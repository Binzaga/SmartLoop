import { and, asc, eq, gte, inArray, sql } from "drizzle-orm"
import { db, schema } from "../db/client"
import { llm } from "../lib/llm"
import { judgeEvent } from "../services/judge"
import { config } from "../config"

/**
 * Replay worker — picks up `queued` replay_runs, resolves the source set
 * of events, runs each event's input through the new prompt + the chosen
 * model, scores the new output with the judge, and writes back a
 * per-event comparison + aggregate stats.
 *
 * No tool-calling support yet (the replay treats the new prompt as a
 * static system prompt with the user input). Tool replay is out of
 * scope until we have tool-mocking infra; for now we replay generation
 * quality, not the full agent loop.
 */

const TICK_INTERVAL_MS = 10 * 1000 // poll every 10s
const PER_RUN_MAX_EVENTS = 200

let running = false
let timer: ReturnType<typeof setInterval> | null = null

export async function runReplayBatch(): Promise<{ picked: number; finished: number }> {
  // Grab one queued run at a time to keep semantics simple.
  const queued = await db.execute(sql`
    select id
    from replay_runs
    where status = 'queued'
    order by created_at asc
    for update skip locked
    limit 1
  `)
  const row = (queued as unknown as Array<{ id: string }>)[0]
  if (!row) return { picked: 0, finished: 0 }

  await db
    .update(schema.replayRuns)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(schema.replayRuns.id, row.id))

  try {
    await executeReplay(row.id)
    return { picked: 1, finished: 1 }
  } catch (err) {
    await db
      .update(schema.replayRuns)
      .set({
        status: "failed",
        error: (err as Error).message.slice(0, 1000),
        completedAt: new Date(),
      })
      .where(eq(schema.replayRuns.id, row.id))
    return { picked: 1, finished: 0 }
  }
}

async function executeReplay(runId: string) {
  const [run] = await db
    .select()
    .from(schema.replayRuns)
    .where(eq(schema.replayRuns.id, runId))
    .limit(1)
  if (!run) throw new Error("run not found")

  // 1. Resolve the source events
  const sourceEvents = await resolveSourceEvents(
    run.productId,
    run.sourceType,
    run.sourceRef as Record<string, unknown>,
  )

  await db
    .update(schema.replayRuns)
    .set({ totalEvents: sourceEvents.length })
    .where(eq(schema.replayRuns.id, runId))

  if (sourceEvents.length === 0) {
    await db
      .update(schema.replayRuns)
      .set({ status: "completed", completedAt: new Date(), results: [] })
      .where(eq(schema.replayRuns.id, runId))
    return
  }

  // Compute pass_rate_old up front
  const oldOverallScores = sourceEvents
    .map((e) => (e.scores as any)?.overall as number | undefined)
    .filter((s): s is number => typeof s === "number")
  const passRateOld =
    oldOverallScores.length > 0
      ? oldOverallScores.filter((s) => s >= 4).length / oldOverallScores.length
      : null

  await db
    .update(schema.replayRuns)
    .set({ passRateOld })
    .where(eq(schema.replayRuns.id, runId))

  // 2. For each event, run it through the new prompt + judge.
  const results: Array<{
    eventId: string
    oldOutput: string | null
    newOutput: string
    oldOverall: number | null
    newOverall: number
    oldTags: string[]
    newTags: string[]
    scoreDelta: number // newOverall - oldOverall (0 if old missing)
    judgeReasoning: string
  }> = []

  let improved = 0
  let regressed = 0
  let same = 0

  // Process serially to keep DashScope happy (could parallelize with a small pool later)
  for (let i = 0; i < sourceEvents.length; i++) {
    const ev = sourceEvents[i]
    const input = ev.inputMessage ?? ""
    if (!input) continue

    console.log(`[replay] ${runId.slice(0, 8)} event ${i + 1}/${sourceEvents.length}`)

    let newOutput = ""
    try {
      const completion = await llm.chat.completions.create({
        model: run.model,
        messages: [
          { role: "system", content: run.newPrompt },
          { role: "user", content: input },
        ],
        temperature: 0.2,
        max_tokens: 800,
      })
      newOutput = completion.choices[0]?.message?.content ?? ""
    } catch (err) {
      newOutput = `(generation failed: ${(err as Error).message.slice(0, 200)})`
    }

    // Judge the new output
    let newJudge
    try {
      newJudge = await judgeEvent({
        input,
        output: newOutput,
        toolsCalled: [],
        language: ev.language,
        productName: undefined,
        status: "success",
      })
    } catch (err) {
      // If judging fails, score it 0 and tag judge_error
      newJudge = {
        result: {
          accuracy: { score: 0, reasoning: "(judge failed)" },
          helpfulness: { score: 0, reasoning: "" },
          safety: { score: 0, reasoning: "" },
          style: { score: 0, reasoning: "" },
          overall: 0,
          tags: ["judge_error"],
        },
        reasoning: `judge_failed: ${(err as Error).message.slice(0, 300)}`,
        rawJson: "",
      }
    }

    const oldOverall = ((ev.scores as any)?.overall as number | undefined) ?? null
    const oldTags = ((ev.scores as any)?.tags as string[] | undefined) ?? []
    const newOverall = newJudge.result.overall

    const oldComp = oldOverall ?? 0
    if (newOverall > oldComp) improved++
    else if (newOverall < oldComp) regressed++
    else same++

    results.push({
      eventId: ev.id,
      oldOutput: ev.outputMessage,
      newOutput,
      oldOverall,
      newOverall,
      oldTags,
      newTags: newJudge.result.tags,
      scoreDelta: newOverall - oldComp,
      judgeReasoning: newJudge.reasoning,
    })

    // Stream progress every 5 events
    if (i % 5 === 0 || i === sourceEvents.length - 1) {
      await db
        .update(schema.replayRuns)
        .set({
          completedEvents: i + 1,
          improvedCount: improved,
          regressedCount: regressed,
          sameCount: same,
          results: results as unknown as object,
        })
        .where(eq(schema.replayRuns.id, runId))
    }
  }

  // Compute pass_rate_new
  const passRateNew =
    results.length > 0 ? results.filter((r) => r.newOverall >= 4).length / results.length : null

  await db
    .update(schema.replayRuns)
    .set({
      status: "completed",
      completedAt: new Date(),
      completedEvents: results.length,
      improvedCount: improved,
      regressedCount: regressed,
      sameCount: same,
      passRateNew,
      results: results as unknown as object,
    })
    .where(eq(schema.replayRuns.id, runId))
}

async function resolveSourceEvents(
  productId: string,
  sourceType: string,
  sourceRef: Record<string, unknown>,
): Promise<
  Array<{
    id: string
    inputMessage: string | null
    outputMessage: string | null
    scores: unknown
    language: string | null
  }>
> {
  if (sourceType === "cluster") {
    const clusterId = sourceRef.clusterId as string | undefined
    if (!clusterId) return []
    const rows = await db
      .select({
        id: schema.events.id,
        inputMessage: schema.events.inputMessage,
        outputMessage: schema.events.outputMessage,
        scores: schema.events.scores,
        language: schema.events.language,
      })
      .from(schema.events)
      .where(and(eq(schema.events.productId, productId), eq(schema.events.clusterId, clusterId)))
      .orderBy(asc(schema.events.createdAt))
      .limit(PER_RUN_MAX_EVENTS)
    return rows
  }

  if (sourceType === "event_ids") {
    const ids = sourceRef.eventIds as string[] | undefined
    if (!ids || ids.length === 0) return []
    const rows = await db
      .select({
        id: schema.events.id,
        inputMessage: schema.events.inputMessage,
        outputMessage: schema.events.outputMessage,
        scores: schema.events.scores,
        language: schema.events.language,
      })
      .from(schema.events)
      .where(and(eq(schema.events.productId, productId), inArray(schema.events.id, ids)))
      .limit(PER_RUN_MAX_EVENTS)
    return rows
  }

  if (sourceType === "recent") {
    const hours = (sourceRef.hours as number | undefined) ?? 24
    const onlyBad = (sourceRef.onlyBad as boolean | undefined) ?? true
    const cutoff = new Date(Date.now() - hours * 3600 * 1000)
    const rows = await db.execute(sql`
      select id, input_message as "inputMessage", output_message as "outputMessage", scores, language
      from events
      where product_id = ${productId}
        and created_at >= ${cutoff.toISOString()}
        ${onlyBad ? sql`and (scores->>'overall')::int <= 3` : sql``}
      order by created_at desc
      limit ${PER_RUN_MAX_EVENTS}
    `)
    return rows as unknown as Array<{
      id: string
      inputMessage: string | null
      outputMessage: string | null
      scores: unknown
      language: string | null
    }>
  }

  // golden_set: not yet wired up since we don't have golden cases populated
  return []
}

export function startReplayWorker(logger: { info: Function; error: Function }) {
  if (timer) return () => stopReplayWorker()
  const tick = async () => {
    if (running) return
    running = true
    try {
      const stats = await runReplayBatch()
      if (stats.picked > 0) {
        logger.info(stats, "[replay] batch")
      }
    } catch (err) {
      logger.error({ err }, "[replay] tick failed")
    } finally {
      running = false
    }
  }
  timer = setInterval(tick, TICK_INTERVAL_MS)
  void tick()
  logger.info({ intervalMs: TICK_INTERVAL_MS }, "[replay] worker started")
  return () => stopReplayWorker()
}

export function stopReplayWorker() {
  if (timer) clearInterval(timer)
  timer = null
}
