import type { FastifyInstance } from "fastify"
import { runJudgeBatch } from "../workers/judge-worker"
import { z } from "zod"
import { adminAuth } from "../middleware/admin-auth"

/**
 * Admin routes for triggering judge runs and inspecting score state.
 * Protected by X-Admin-Token header.
 */
export async function judgeRoutes(app: FastifyInstance) {
  app.addHook("preHandler", adminAuth)
  // POST /admin/judge/run — manually fire one batch
  app.post("/admin/judge/run", async (req) => {
    const Body = z.object({ limit: z.number().int().min(1).max(100).optional() })
    const parsed = Body.safeParse(req.body ?? {})
    const stats = await runJudgeBatch(parsed.success ? parsed.data.limit : undefined)
    return { ok: true, ...stats }
  })
}
