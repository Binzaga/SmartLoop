import { and, desc, eq, gte, inArray, isNull, isNotNull, sql } from "drizzle-orm"
import { db, schema } from "../db/client"
import { config } from "../config"

/**
 * Cluster worker — periodically scans for unclustered "bad" events and
 * assigns them to a cluster.
 *
 * MVP strategy (tag-based, deterministic):
 *   - Pull events with cluster_id IS NULL AND (score <= 3 OR has 👎 OR specific tags)
 *   - For each event, pick the most severe tag as its cluster category
 *   - Create the cluster if it doesn't exist; otherwise increment its counts
 *
 * Future (v0.2):
 *   - Embedding + DBSCAN for sub-clusters under each tag
 *   - LLM-named clusters with descriptions
 *   - Auto root-cause inference correlating prompt version changes
 */

const TICK_INTERVAL_MS = 60 * 1000 // every 60s

// Tag → cluster category, ordered by severity (first match wins)
const TAG_TO_CATEGORY: Array<{ tag: string; category: string; severity: number }> = [
  { tag: "safety_violation", category: "safety_violation", severity: 5 },
  { tag: "hallucination", category: "hallucination", severity: 5 },
  { tag: "wrong_lookup", category: "wrong_lookup", severity: 4 },
  { tag: "multilingual_drift", category: "multilingual_drift", severity: 3 },
  { tag: "format_violation", category: "format_violation", severity: 3 },
  { tag: "off_topic", category: "off_topic", severity: 2 },
  { tag: "too_long", category: "too_long", severity: 1 },
  { tag: "too_short", category: "too_short", severity: 1 },
]

const CATEGORY_LABELS: Record<string, { name: string; description: string }> = {
  safety_violation: {
    name: "Safety violation",
    description: "AI 输出包含越权 / 泄露敏感信息 / 不合规内容。",
  },
  hallucination: {
    name: "Hallucination",
    description: "AI 编造未在上下文/工具结果里出现的信息(订单号、客户名、数字等)。",
  },
  wrong_lookup: {
    name: "Wrong tool result",
    description: "工具调用成功但 AI 解读错误,或用错了工具返回的字段。",
  },
  multilingual_drift: {
    name: "Multilingual drift",
    description: "AI 回复语言和用户输入不一致(常见:用户阿拉伯语 → AI 中文)。",
  },
  format_violation: {
    name: "Format violation",
    description: "未遵守 system prompt 中的格式要求(JSON / 长度 / 列表等)。",
  },
  off_topic: {
    name: "Off topic",
    description: "回复跑题或超出 AI 职责范围。",
  },
  too_long: {
    name: "Too long",
    description: "回复啰嗦,超出可读性阈值。",
  },
  too_short: {
    name: "Too short",
    description: "回复过短,关键信息缺失。",
  },
}

let running = false
let timer: ReturnType<typeof setInterval> | null = null

export interface ClusterRunStats {
  scanned: number
  clustered: number
  newClusters: number
  durationMs: number
}

export async function runClusterBatch(limit = 50): Promise<ClusterRunStats> {
  const started = Date.now()

  // Find "bad" events that are not yet clustered.
  // Bad = score <= 3 OR has at least one severity-bearing tag OR has 👎 feedback.
  const rows = await db.execute(sql`
    select e.id, e.product_id, e.scores, e.created_at
    from events e
    left join feedback f on f.event_id = e.id
    where e.cluster_id is null
      and e.scores is not null
      and (
        (e.scores->>'overall')::int <= 3
        or (e.scores ? 'tags' and (e.scores->'tags')::jsonb ?| array[
          'hallucination','safety_violation','wrong_lookup',
          'multilingual_drift','format_violation','off_topic','too_long','too_short'
        ])
        or f.rating = 'down'
      )
    order by e.created_at asc
    limit ${limit}
  `)
  const events = rows as unknown as Array<{
    id: string
    product_id: string
    scores: { tags?: string[] } | null
    created_at: string
  }>

  if (events.length === 0) {
    return { scanned: 0, clustered: 0, newClusters: 0, durationMs: Date.now() - started }
  }

  // Group by (product_id, category)
  const grouped = new Map<string, { productId: string; category: string; eventIds: string[] }>()
  for (const ev of events) {
    const tags = ev.scores?.tags ?? []
    const cat = pickCategory(tags)
    if (!cat) continue
    const key = `${ev.product_id}::${cat}`
    if (!grouped.has(key)) {
      grouped.set(key, { productId: ev.product_id, category: cat, eventIds: [] })
    }
    grouped.get(key)!.eventIds.push(ev.id)
  }

  let clustered = 0
  let newClusters = 0

  for (const { productId, category, eventIds } of grouped.values()) {
    // Find existing cluster for this product + category, or create one.
    const existing = await db
      .select({ id: schema.clusters.id, representative: schema.clusters.representativeEventIds })
      .from(schema.clusters)
      .where(
        and(eq(schema.clusters.productId, productId), eq(schema.clusters.category, category)),
      )
      .limit(1)

    let clusterId: string
    let representativeEventIds: string[]
    if (existing.length === 0) {
      const meta = CATEGORY_LABELS[category] ?? { name: category, description: "" }
      const [created] = await db
        .insert(schema.clusters)
        .values({
          productId,
          name: meta.name,
          description: meta.description,
          category,
          representativeEventIds: eventIds.slice(0, 5),
          eventCountTotal: 0,
          eventCount24h: 0,
          eventCount7d: 0,
          status: "active",
        })
        .returning({ id: schema.clusters.id })
      clusterId = created.id
      representativeEventIds = eventIds.slice(0, 5)
      newClusters++
    } else {
      clusterId = existing[0].id
      representativeEventIds = existing[0].representative as string[]
      // Add up to 5 examples (newest wins)
      const next = [...eventIds.slice(0, 5), ...representativeEventIds].slice(0, 5)
      representativeEventIds = next
    }

    // Assign events to cluster
    await db
      .update(schema.events)
      .set({ clusterId })
      .where(inArray(schema.events.id, eventIds))

    // Recompute counts for the cluster
    await recomputeClusterStats(clusterId, representativeEventIds)
    clustered += eventIds.length
  }

  return {
    scanned: events.length,
    clustered,
    newClusters,
    durationMs: Date.now() - started,
  }
}

async function recomputeClusterStats(clusterId: string, repIds: string[]) {
  const counts = await db.execute(sql`
    select
      count(*)::int as total,
      sum(case when created_at >= now() - interval '24 hours' then 1 else 0 end)::int as c24,
      sum(case when created_at >= now() - interval '7 days' then 1 else 0 end)::int as c7
    from events
    where cluster_id = ${clusterId}
  `)
  const c = (counts as unknown as any[])[0] ?? { total: 0, c24: 0, c7: 0 }

  // Build a 7-day trend
  const trendRows = await db.execute(sql`
    select date_trunc('day', created_at) as day, count(*)::int as n
    from events
    where cluster_id = ${clusterId} and created_at >= now() - interval '7 days'
    group by 1 order by 1 asc
  `)
  const trend = (trendRows as unknown as any[]).map((r) => ({
    day: r.day,
    count: r.n,
  }))

  await db
    .update(schema.clusters)
    .set({
      eventCountTotal: c.total ?? 0,
      eventCount24h: c.c24 ?? 0,
      eventCount7d: c.c7 ?? 0,
      trend: trend as unknown as object,
      representativeEventIds: repIds,
      updatedAt: new Date(),
    })
    .where(eq(schema.clusters.id, clusterId))
}

function pickCategory(tags: string[]): string | null {
  if (!Array.isArray(tags) || tags.length === 0) return null
  let best: { category: string; severity: number } | null = null
  for (const t of tags) {
    const match = TAG_TO_CATEGORY.find((m) => m.tag === t)
    if (match && (!best || match.severity > best.severity)) {
      best = { category: match.category, severity: match.severity }
    }
  }
  return best?.category ?? null
}

export function startClusterWorker(logger: { info: Function; error: Function }) {
  if (timer) return () => stopClusterWorker()
  const tick = async () => {
    if (running) return
    running = true
    try {
      const stats = await runClusterBatch()
      if (stats.scanned > 0) {
        logger.info(stats, "[cluster] batch")
      }
    } catch (err) {
      logger.error({ err }, "[cluster] tick failed")
    } finally {
      running = false
    }
  }
  timer = setInterval(tick, TICK_INTERVAL_MS)
  void tick()
  logger.info({ intervalMs: TICK_INTERVAL_MS }, "[cluster] worker started")
  return () => stopClusterWorker()
}

export function stopClusterWorker() {
  if (timer) clearInterval(timer)
  timer = null
}
