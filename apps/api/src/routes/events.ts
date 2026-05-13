import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db, schema } from "../db/client"
import { authProductFromApiKey } from "../middleware/auth"

const ToolCallSchema = z.object({
  name: z.string(),
  input: z.unknown().optional(),
  output: z.unknown().optional(),
  latencyMs: z.number().int().nonnegative().optional(),
  success: z.boolean().optional(),
  errorMessage: z.string().optional(),
})

const TokensSchema = z.object({
  input: z.number().int().nonnegative().default(0),
  output: z.number().int().nonnegative().default(0),
  cacheHit: z.number().int().nonnegative().optional(),
})

const EventInputSchema = z.object({
  conversationId: z.string().optional(),
  userIdHash: z.string().optional(),
  parentEventId: z.string().uuid().optional(),

  input: z.string().nullable().optional(),
  output: z.string().nullable().optional(),

  model: z.string().optional(),
  promptVersion: z.string().optional(),

  tokens: TokensSchema.optional(),
  costUsd: z.number().nonnegative().optional(),
  latencyMs: z.number().int().nonnegative().optional(),

  toolsCalled: z.array(ToolCallSchema).optional(),
  status: z.enum(["success", "error", "timeout"]).default("success"),
  errorMessage: z.string().optional(),

  language: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})

const BatchSchema = z.object({
  events: z.array(EventInputSchema).min(1).max(100),
})

const FeedbackSchema = z.object({
  rating: z.enum(["up", "down", "neutral"]),
  reasons: z.array(z.string()).optional(),
  comment: z.string().max(2000).optional(),
  userIdHash: z.string().optional(),
})

export async function eventRoutes(app: FastifyInstance) {
  app.addHook("preHandler", authProductFromApiKey)

  // === Single event ingestion ===
  app.post("/v1/events", async (req, reply) => {
    const product = req.product!
    const parsed = EventInputSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid event payload", issues: parsed.error.issues }
    }
    const payload = parsed.data

    const inserted = await db
      .insert(schema.events)
      .values({
        productId: product.productId,
        orgId: product.orgId,
        conversationId: payload.conversationId,
        userIdHash: payload.userIdHash,
        parentEventId: payload.parentEventId,
        inputMessage: payload.input ?? null,
        outputMessage: payload.output ?? null,
        model: payload.model,
        promptVersionLabel: payload.promptVersion,
        tokensInput: payload.tokens?.input ?? 0,
        tokensOutput: payload.tokens?.output ?? 0,
        tokensCacheHit: payload.tokens?.cacheHit ?? 0,
        costUsd: payload.costUsd ?? 0,
        latencyMs: payload.latencyMs ?? 0,
        toolsCalled: payload.toolsCalled ?? [],
        status: payload.status,
        errorMessage: payload.errorMessage,
        language: payload.language,
        metadata: payload.metadata ?? {},
      })
      .returning({ id: schema.events.id })

    return { ok: true, eventId: inserted[0].id }
  })

  // === Batch ingestion ===
  app.post("/v1/events/batch", async (req, reply) => {
    const product = req.product!
    const parsed = BatchSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid batch payload", issues: parsed.error.issues }
    }

    const rows = parsed.data.events.map((e) => ({
      productId: product.productId,
      orgId: product.orgId,
      conversationId: e.conversationId,
      userIdHash: e.userIdHash,
      parentEventId: e.parentEventId,
      inputMessage: e.input ?? null,
      outputMessage: e.output ?? null,
      model: e.model,
      promptVersionLabel: e.promptVersion,
      tokensInput: e.tokens?.input ?? 0,
      tokensOutput: e.tokens?.output ?? 0,
      tokensCacheHit: e.tokens?.cacheHit ?? 0,
      costUsd: e.costUsd ?? 0,
      latencyMs: e.latencyMs ?? 0,
      toolsCalled: e.toolsCalled ?? [],
      status: e.status,
      errorMessage: e.errorMessage,
      language: e.language,
      metadata: e.metadata ?? {},
    }))

    const inserted = await db.insert(schema.events).values(rows).returning({ id: schema.events.id })
    return { ok: true, count: inserted.length, eventIds: inserted.map((r) => r.id) }
  })

  // === Feedback attach ===
  app.post<{ Params: { id: string } }>("/v1/events/:id/feedback", async (req, reply) => {
    const product = req.product!
    const parsed = FeedbackSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid feedback payload", issues: parsed.error.issues }
    }

    // Verify event exists and belongs to this product
    const existing = await db
      .select({ id: schema.events.id, productId: schema.events.productId })
      .from(schema.events)
      .where(eq(schema.events.id, req.params.id))
      .limit(1)

    if (existing.length === 0) {
      reply.code(404)
      return { error: "event not found" }
    }
    if (existing[0].productId !== product.productId) {
      reply.code(403)
      return { error: "event belongs to a different product" }
    }

    const inserted = await db
      .insert(schema.feedback)
      .values({
        eventId: req.params.id,
        productId: product.productId,
        rating: parsed.data.rating,
        reasons: parsed.data.reasons ?? [],
        comment: parsed.data.comment,
        userIdHash: parsed.data.userIdHash,
      })
      .returning({ id: schema.feedback.id })

    return { ok: true, feedbackId: inserted[0].id }
  })
}
