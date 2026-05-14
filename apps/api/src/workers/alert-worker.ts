import { and, eq, sql } from "drizzle-orm"
import { db, schema } from "../db/client"
import { config } from "../config"

/**
 * Alert worker — periodically evaluates alert rules and dispatches notifications.
 *
 * MVP strategy:
 *   - Default rule per product: any cluster's 24h event count >= 3x the average
 *     daily count of the prior 7 days (and >= 5 events in 24h to avoid noise)
 *   - When triggered, posts a Markdown card to the configured DingTalk webhook.
 *   - Records alerts in the alerts table for the dashboard.
 *
 * Future (v0.2):
 *   - User-defined rules in the rules table
 *   - Multi-channel: Slack / Telegram / Lark / generic webhook
 *   - Severity tiers, escalation, snooze
 */

const TICK_INTERVAL_MS = 5 * 60 * 1000 // every 5 min
const MIN_24H_EVENTS = 1
const SPIKE_MULTIPLIER = 1.5

let running = false
let timer: ReturnType<typeof setInterval> | null = null

export interface AlertRunStats {
  rulesEvaluated: number
  alertsFired: number
  durationMs: number
}

export async function runAlertBatch(): Promise<AlertRunStats> {
  const started = Date.now()
  let alertsFired = 0

  // ===== Built-in default rule: cluster spike =====
  // For each cluster with >= MIN_24H_EVENTS in last 24h, compare to baseline.
  const candidates = await db.execute(sql`
    with stats as (
      select
        c.id as cluster_id,
        c.product_id,
        c.name as cluster_name,
        c.category,
        c.event_count_24h,
        coalesce(
          (
            select avg(daily_count)::float
            from (
              select count(*)::int as daily_count
              from events e
              where e.cluster_id = c.id
                and e.created_at < now() - interval '24 hours'
                and e.created_at >= now() - interval '8 days'
              group by date_trunc('day', e.created_at)
            ) d
          ),
          0
        ) as baseline_daily_avg
      from clusters c
      where c.status = 'active'
        and c.event_count_24h >= ${MIN_24H_EVENTS}
    )
    select * from stats
    where event_count_24h >= ${SPIKE_MULTIPLIER} * greatest(baseline_daily_avg, 1)
  `)

  const spikes = candidates as unknown as Array<{
    cluster_id: string
    product_id: string
    cluster_name: string
    category: string
    event_count_24h: number
    baseline_daily_avg: number
  }>

  for (const s of spikes) {
    // Avoid duplicate firing: skip if there's an open (firing) alert for this cluster
    const existing = await db.execute(sql`
      select id from alerts
      where status = 'firing'
        and context->>'clusterId' = ${s.cluster_id}
      order by triggered_at desc
      limit 1
    `)
    if ((existing as unknown as any[]).length > 0) continue

    // Build alert
    const title = `Cluster spike — ${s.cluster_name}`
    const ratio = s.baseline_daily_avg > 0 ? s.event_count_24h / s.baseline_daily_avg : Infinity
    const context = {
      productId: s.product_id,
      clusterId: s.cluster_id,
      clusterName: s.cluster_name,
      category: s.category,
      count24h: s.event_count_24h,
      baselineDaily: Number(s.baseline_daily_avg.toFixed(2)),
      ratio: Number.isFinite(ratio) ? Number(ratio.toFixed(2)) : null,
    }

    // Find any DingTalk webhook configured (env-based for MVP; would be alert_rules table in prod)
    const channels: Array<{ type: "dingtalk"; webhookUrl: string }> = []
    if (config.DINGTALK_WEBHOOK_URL) {
      channels.push({ type: "dingtalk", webhookUrl: config.DINGTALK_WEBHOOK_URL })
    }

    // Persist (ruleId null = built-in system rule)
    await db
      .insert(schema.alerts)
      .values({
        ruleId: null,
        productId: s.product_id,
        title,
        severity: ratio >= 5 ? "critical" : "warning",
        context: context as unknown as object,
      })

    // Dispatch to channels (best-effort, swallow errors)
    for (const ch of channels) {
      try {
        if (ch.type === "dingtalk") {
          await dispatchDingTalk(ch.webhookUrl, title, context)
        }
      } catch (err) {
        // Log only — don't block other alerts
      }
    }

    alertsFired++
  }

  return {
    rulesEvaluated: 1, // built-in rule only
    alertsFired,
    durationMs: Date.now() - started,
  }
}

async function dispatchDingTalk(
  webhookUrl: string,
  title: string,
  context: Record<string, unknown>,
) {
  const ratio = (context.ratio as number | null) ?? 0
  const md = [
    `### 🚨 ${title}`,
    `**Product**: \`${context.productId}\``,
    `**Cluster**: ${context.clusterName} (\`${context.category}\`)`,
    `**24h events**: **${context.count24h}** vs baseline ${context.baselineDaily}/day`,
    `**Spike**: ${ratio.toFixed(1)}×`,
    "",
    `→ [Inspect in SmartLoop](http://47.82.1.197/dashboard/products/${context.productId})`,
  ].join("\n")

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      msgtype: "markdown",
      markdown: { title, text: md },
    }),
  })
}

export function startAlertWorker(logger: { info: Function; error: Function }) {
  if (timer) return () => stopAlertWorker()
  const tick = async () => {
    if (running) return
    running = true
    try {
      const stats = await runAlertBatch()
      if (stats.alertsFired > 0) {
        logger.info(stats, "[alert] batch — alerts fired")
      }
    } catch (err) {
      logger.error({ err }, "[alert] tick failed")
    } finally {
      running = false
    }
  }
  timer = setInterval(tick, TICK_INTERVAL_MS)
  void tick()
  logger.info({ intervalMs: TICK_INTERVAL_MS }, "[alert] worker started")
  return () => stopAlertWorker()
}

export function stopAlertWorker() {
  if (timer) clearInterval(timer)
  timer = null
}
