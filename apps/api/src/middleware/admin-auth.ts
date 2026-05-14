import type { FastifyRequest, FastifyReply } from "fastify"
import { timingSafeEqual } from "crypto"
import { config } from "../config"
import { findSession, parseSessionCookie } from "../lib/sessions"

const allowedIps = config.ADMIN_IP_ALLOWLIST.split(",")
  .map((s) => s.trim())
  .filter(Boolean)

/**
 * Protects /admin/* and /v1/dashboard routes.
 * Accepts EITHER:
 *   - A logged-in Dashboard user session (cookie), OR
 *   - An X-Admin-Token header (programmatic / SDK / scripts)
 */
export async function adminAuth(req: FastifyRequest, reply: FastifyReply) {
  // IP allowlist (optional, only enforced if set in env)
  if (allowedIps.length > 0) {
    const remote =
      (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim() ?? req.ip
    if (!allowedIps.includes(remote)) {
      reply.code(403).send({ error: "ip not allowed" })
      return reply
    }
  }

  // 1) User session cookie path (preferred for browser/Dashboard)
  const sessionToken = parseSessionCookie(req.headers.cookie as string | undefined)
  if (sessionToken) {
    const session = await findSession(sessionToken)
    if (session) {
      // attach for downstream handlers if they care
      ;(req as any).user = {
        id: session.userId,
        email: session.email,
        name: session.name,
        isAdmin: session.isAdmin,
      }
      return
    }
  }

  // 2) Programmatic token path (CI, scripts, hosted SDK)
  const token =
    (req.headers["x-admin-token"] as string | undefined) ??
    extractBearer(req.headers.authorization)

  if (!token || !constantEq(token, config.ADMIN_TOKEN)) {
    reply.code(401).send({ error: "admin auth required (login or X-Admin-Token)" })
    return reply
  }
}

function extractBearer(header?: string): string | undefined {
  if (!header) return undefined
  const [scheme, value] = header.split(" ")
  if (scheme?.toLowerCase() === "bearer" && value) return value
  return undefined
}

function constantEq(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf-8")
  const bb = Buffer.from(b, "utf-8")
  if (ab.length !== bb.length) {
    const len = Math.max(ab.length, bb.length)
    const a2 = Buffer.alloc(len, 0)
    const b2 = Buffer.alloc(len, 0)
    ab.copy(a2)
    bb.copy(b2)
    return timingSafeEqual(a2, b2) && ab.length === bb.length
  }
  return timingSafeEqual(ab, bb)
}
