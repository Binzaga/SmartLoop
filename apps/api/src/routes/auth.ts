import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { eq, sql } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { db, schema } from "../db/client"
import {
  buildSessionCookie,
  buildSessionCookieClear,
  createSession,
  deleteSession,
  findSession,
  parseSessionCookie,
} from "../lib/sessions"

const SignupSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(120).optional(),
})

const LoginSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(1).max(128),
})

export async function authRoutes(app: FastifyInstance) {
  // ===== POST /auth/signup =====
  // First signup becomes admin (bootstrap). Subsequent signups are regular users.
  app.post("/auth/signup", async (req, reply) => {
    const parsed = SignupSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid signup payload", issues: parsed.error.issues }
    }

    const existing = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, parsed.data.email))
      .limit(1)
    if (existing.length > 0) {
      reply.code(409)
      return { error: "email already registered" }
    }

    const userCountRow = await db.execute(sql`select count(*)::int as c from users`)
    const isFirstUser = ((userCountRow as unknown as any[])[0]?.c ?? 0) === 0
    const passwordHash = await bcrypt.hash(parsed.data.password, 12)

    const [created] = await db
      .insert(schema.users)
      .values({
        email: parsed.data.email,
        name: parsed.data.name,
        passwordHash,
        isAdmin: isFirstUser,
        lastLoginAt: new Date(),
      })
      .returning({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        isAdmin: schema.users.isAdmin,
      })

    const { token, expiresAt } = await createSession({
      userId: created.id,
      userAgent: req.headers["user-agent"] as string | undefined,
      ip: req.ip,
    })

    reply.header("set-cookie", buildSessionCookie(token, expiresAt))
    return { ok: true, user: created }
  })

  // ===== POST /auth/login =====
  app.post("/auth/login", async (req, reply) => {
    const parsed = LoginSchema.safeParse(req.body)
    if (!parsed.success) {
      reply.code(400)
      return { error: "invalid login payload" }
    }

    const rows = await db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        name: schema.users.name,
        isAdmin: schema.users.isAdmin,
        passwordHash: schema.users.passwordHash,
      })
      .from(schema.users)
      .where(eq(schema.users.email, parsed.data.email))
      .limit(1)

    const user = rows[0]
    if (!user || !user.passwordHash) {
      // Generic message — don't leak whether email exists
      reply.code(401)
      return { error: "invalid email or password" }
    }

    const ok = await bcrypt.compare(parsed.data.password, user.passwordHash)
    if (!ok) {
      reply.code(401)
      return { error: "invalid email or password" }
    }

    await db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, user.id))

    const { token, expiresAt } = await createSession({
      userId: user.id,
      userAgent: req.headers["user-agent"] as string | undefined,
      ip: req.ip,
    })
    reply.header("set-cookie", buildSessionCookie(token, expiresAt))

    return {
      ok: true,
      user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin },
    }
  })

  // ===== POST /auth/logout =====
  app.post("/auth/logout", async (req, reply) => {
    const token = parseSessionCookie(req.headers.cookie as string | undefined)
    if (token) await deleteSession(token)
    reply.header("set-cookie", buildSessionCookieClear())
    return { ok: true }
  })

  // ===== GET /auth/me =====
  app.get("/auth/me", async (req, reply) => {
    const token = parseSessionCookie(req.headers.cookie as string | undefined)
    if (!token) {
      reply.code(401)
      return { error: "not authenticated" }
    }
    const session = await findSession(token)
    if (!session) {
      reply.code(401)
      return { error: "session expired" }
    }
    return {
      user: {
        id: session.userId,
        email: session.email,
        name: session.name,
        isAdmin: session.isAdmin,
        avatarUrl: session.avatarUrl,
      },
    }
  })
}
