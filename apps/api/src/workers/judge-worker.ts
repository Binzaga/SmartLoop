import { and, eq, inArray, isNull, sql } from "drizzle-orm"
import { db, schema } from "../db/client"
import { judgeEvent, type JudgeResult } from "../services/judge"
import { config } from "../config"

/**
 * Polls for un-judged events and runs them through the LLM judge.
 * Designed to be safe to run continuously; uses row-level locking
 * to avoid two workers grabbing the same event.
 */

let running = false
let timer: ReturnType<typeof setInterval> | null = null

export interface JudgeRunStats {
  picked: number
  judged: number
  failed: number
  durationMs: number
}

/** Find events that are missing scores, mark them in-flight, and judge them. */
export async function runJudgeBatch(limit = config.JUDGE_BATCH_SIZE): Promise<JudgeRunStats> {
  const started = Date.now()
  let picked = 0
  let judged = 0
  let failed = 0

  // SELECT ... FOR UPDATE SKIP LOCKED lets us safely batch under concurrency.
  const rows = await db.execute(sql`
    select id, product_id, input_message, output_message, tools_called, language, status
    from events
    where scores is null
    order by created_at asc
    limit ${limit}
    for update skip locked
  `)

  const batch = rows as unknown as Array<{
    id: string
    product_id: string
    input_message: string | null
    output_message: string | null
    tools_called: unknown
    language: string | null
    status: string
  }>
  picked = batch.length

  // Fetch product names once
  const productIds = [...new Set(batch.map((r) => r.product_id))]
  const products =
    productIds.length === 0
      ? []
      : await db
          .select({ id: schema.products.id, name: schema.products.name })
          .from(schema.products)
          .where(inArray(schema.products.id, productIds))
  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? id

  for (const row of batch) {
    try {
      const { result, reasoning } = await judgeEvent({
        input: row.input_message,
        output: row.output_message,
        toolsCalled: (row.tools_called as any[]) ?? [],
        language: row.language,
        productName: productName(row.product_id),
        status: row.status,
      })
      await db
        .update(schema.events)
        .set({
          scores: result as unknown as object,
          judgeReasoning: reasoning,
        })
        .where(eq(schema.events.id, row.id))
      judged++
    } catch (err) {
      failed++
      // mark with error sentinel so we don't busy-loop on poison events
      const sentinel: JudgeResult & { _error: string } = {
        accuracy: { score: 0, reasoning: "(judge failed)" },
        helpfulness: { score: 0, reasoning: "" },
        safety: { score: 0, reasoning: "" },
        style: { score: 0, reasoning: "" },
        overall: 0,
        tags: ["judge_error"],
        _error: (err as Error).message.slice(0, 500),
      }
      await db
        .update(schema.events)
        .set({
          scores: sentinel as unknown as object,
          judgeReasoning: `judge_failed: ${(err as Error).message.slice(0, 300)}`,
        })
        .where(eq(schema.events.id, row.id))
    }
  }

  return { picked, judged, failed, durationMs: Date.now() - started }
}

/** Start a periodic worker. Returns a stop function. */
export function startJudgeWorker(logger: { info: Function; error: Function }) {
  if (timer) return () => stopJudgeWorker()

  const tick = async () => {
    if (running) return
    running = true
    try {
      const stats = await runJudgeBatch()
      if (stats.picked > 0) {
        logger.info(stats, "[judge] batch")
      }
    } catch (err) {
      logger.error({ err }, "[judge] tick failed")
    } finally {
      running = false
    }
  }

  timer = setInterval(tick, config.JUDGE_TICK_INTERVAL_MS)
  // First tick immediately
  void tick()
  logger.info({ intervalMs: config.JUDGE_TICK_INTERVAL_MS }, "[judge] worker started")
  return () => stopJudgeWorker()
}

export function stopJudgeWorker() {
  if (timer) clearInterval(timer)
  timer = null
}
