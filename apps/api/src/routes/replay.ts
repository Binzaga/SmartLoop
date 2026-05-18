import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { desc, eq } from "drizzle-orm"
import { db, schema } from "../db/client"
import { adminAuth } from "../middleware/admin-auth"

const StartReplaySchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1).max(200),
  sourceType: z.enum(["cluster", "event_ids", "golden_set", "recent"]),
  sourceRef: z.record(z.unknown()),
  newPrompt: z.string().min(10).max(20000),
  newPromptLabel: z.string().max(120).optional(),
  model: z.string().default("qwen3.5-plus"),
})

export async function replayRoutes(app: FastifyInstance) {
  app.addHook("preHandler", adminAuth)

  // POST /admin/replay/start
  app.post("/admin/replay/start", async (req, reply) => {
    const parsed = StartReplaySchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid replay payload", issues: parsed.error.issues }
    }

    // Validate product exists
    const product = await db
      .select({ id: schema.products.id })
      .from(schema.products)
      .where(eq(schema.products.id, parsed.data.productId))
      .limit(1)
    if (product.length === 0) {
      reply.code(404)
      return { error: "product not found" }
    }

    const [inserted] = await db
      .insert(schema.replayRuns)
      .values({
        productId: parsed.data.productId,
        name: parsed.data.name,
        sourceType: parsed.data.sourceType,
        sourceRef: parsed.data.sourceRef as object,
        newPrompt: parsed.data.newPrompt,
        newPromptLabel: parsed.data.newPromptLabel,
        model: parsed.data.model,
        status: "queued",
        triggeredByUserId: (req as any).user?.id ?? null,
      })
      .returning({ id: schema.replayRuns.id })

    return { ok: true, runId: inserted.id }
  })

  // GET /admin/replay/list?productId=...
  app.get<{ Querystring: { productId?: string } }>("/admin/replay/list", async (req) => {
    const where = req.query.productId
      ? eq(schema.replayRuns.productId, req.query.productId)
      : undefined
    const rows = await db
      .select({
        id: schema.replayRuns.id,
        productId: schema.replayRuns.productId,
        name: schema.replayRuns.name,
        status: schema.replayRuns.status,
        sourceType: schema.replayRuns.sourceType,
        totalEvents: schema.replayRuns.totalEvents,
        completedEvents: schema.replayRuns.completedEvents,
        improvedCount: schema.replayRuns.improvedCount,
        regressedCount: schema.replayRuns.regressedCount,
        sameCount: schema.replayRuns.sameCount,
        passRateOld: schema.replayRuns.passRateOld,
        passRateNew: schema.replayRuns.passRateNew,
        newPromptLabel: schema.replayRuns.newPromptLabel,
        model: schema.replayRuns.model,
        createdAt: schema.replayRuns.createdAt,
        completedAt: schema.replayRuns.completedAt,
      })
      .from(schema.replayRuns)
      .where(where)
      .orderBy(desc(schema.replayRuns.createdAt))
      .limit(50)
    return { runs: rows }
  })

  // GET /admin/replay/:id
  app.get<{ Params: { id: string } }>("/admin/replay/:id", async (req, reply) => {
    const rows = await db
      .select()
      .from(schema.replayRuns)
      .where(eq(schema.replayRuns.id, req.params.id))
      .limit(1)
    if (rows.length === 0) {
      reply.code(404)
      return { error: "replay run not found" }
    }
    return { run: rows[0] }
  })

  // POST /admin/replay/run-now (force the worker to pick the next queued run)
  app.post("/admin/replay/run-now", async () => {
    const { runReplayBatch } = await import("../workers/replay-worker")
    const stats = await runReplayBatch()
    return { ok: true, ...stats }
  })
}
