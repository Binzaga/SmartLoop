import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { eq } from "drizzle-orm"
import { db, schema } from "../db/client"
import { generateApiKey } from "../lib/api-key"
import { adminAuth } from "../middleware/admin-auth"

/**
 * Admin routes for bootstrapping products / orgs.
 * Protected by X-Admin-Token header.
 */
export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", adminAuth)
  // === List orgs ===
  app.get("/admin/orgs", async () => {
    const rows = await db.select().from(schema.orgs)
    return { orgs: rows }
  })

  // === Create org ===
  const CreateOrgSchema = z.object({
    id: z.string().min(2).max(64),
    name: z.string().min(1).max(200),
  })
  app.post("/admin/orgs", async (req, reply) => {
    const parsed = CreateOrgSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid", issues: parsed.error.issues }
    }
    const [row] = await db.insert(schema.orgs).values(parsed.data).returning()
    return { ok: true, org: row }
  })

  // === List products ===
  app.get("/admin/products", async () => {
    const rows = await db
      .select({
        id: schema.products.id,
        orgId: schema.products.orgId,
        name: schema.products.name,
        ownerTeam: schema.products.ownerTeam,
        enabled: schema.products.enabled,
        createdAt: schema.products.createdAt,
      })
      .from(schema.products)
    return { products: rows }
  })

  // === Create product (returns API key ONE TIME) ===
  const CreateProductSchema = z.object({
    id: z
      .string()
      .min(2)
      .max(64)
      .regex(/^[a-z0-9-]+$/, "lowercase letters, digits, hyphens only"),
    orgId: z.string(),
    name: z.string().min(1).max(200),
    description: z.string().optional(),
    ownerTeam: z.string().optional(),
  })
  app.post("/admin/products", async (req, reply) => {
    const parsed = CreateProductSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid", issues: parsed.error.issues }
    }

    const org = await db
      .select()
      .from(schema.orgs)
      .where(eq(schema.orgs.id, parsed.data.orgId))
      .limit(1)
    if (org.length === 0) {
      reply.code(404)
      return { error: "org not found" }
    }

    const { raw, hash } = generateApiKey()

    const [product] = await db
      .insert(schema.products)
      .values({
        id: parsed.data.id,
        orgId: parsed.data.orgId,
        name: parsed.data.name,
        description: parsed.data.description,
        ownerTeam: parsed.data.ownerTeam,
        apiKeyHash: hash,
      })
      .returning({
        id: schema.products.id,
        orgId: schema.products.orgId,
        name: schema.products.name,
      })

    return {
      ok: true,
      product,
      apiKey: raw,
      warning: "Save this key now — it will not be shown again.",
    }
  })

  // === Rotate API key ===
  app.post<{ Params: { id: string } }>(
    "/admin/products/:id/rotate-key",
    async (req, reply) => {
      const existing = await db
        .select()
        .from(schema.products)
        .where(eq(schema.products.id, req.params.id))
        .limit(1)
      if (existing.length === 0) {
        reply.code(404)
        return { error: "product not found" }
      }
      const { raw, hash } = generateApiKey()
      await db
        .update(schema.products)
        .set({ apiKeyHash: hash, updatedAt: new Date() })
        .where(eq(schema.products.id, req.params.id))
      return { ok: true, apiKey: raw, warning: "Old key is now invalid." }
    },
  )
}
