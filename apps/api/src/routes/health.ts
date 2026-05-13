import type { FastifyInstance } from "fastify"
import { sql } from "drizzle-orm"
import { db } from "../db/client"

export async function healthRoutes(app: FastifyInstance) {
  // Friendly landing page so '/' doesn't look broken
  app.get("/", async () => ({
    service: "smartloop-api",
    version: "0.1.0",
    status: "running",
    endpoints: {
      health: "GET /healthz",
      readiness: "GET /readyz",
      ingestEvent: "POST /v1/events (requires X-SmartLoop-Key)",
      ingestBatch: "POST /v1/events/batch (requires X-SmartLoop-Key)",
      feedback: "POST /v1/events/:id/feedback (requires X-SmartLoop-Key)",
      adminProducts: "GET/POST /admin/products (requires X-Admin-Token)",
      adminOrgs: "GET/POST /admin/orgs (requires X-Admin-Token)",
      judgeRun: "POST /admin/judge/run (requires X-Admin-Token)",
    },
    docs: "see /home/jump/smartloop/README.md (server-side)",
  }))

  app.get("/healthz", async () => ({ ok: true, ts: new Date().toISOString() }))

  app.get("/readyz", async (_req, reply) => {
    try {
      const result = await db.execute(sql`select 1 as ok`)
      return { ok: true, db: result.length > 0 }
    } catch (err) {
      reply.code(503)
      return { ok: false, error: (err as Error).message }
    }
  })
}
