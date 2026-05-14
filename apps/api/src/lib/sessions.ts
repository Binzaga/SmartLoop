import { nanoid } from "nanoid"
import { eq, gt, and, lte } from "drizzle-orm"
import { db, schema } from "../db/client"

export const SESSION_COOKIE = "sl_session"
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export async function createSession(opts: {
  userId: string
  userAgent?: string
  ip?: string
}): Promise<{ token: string; expiresAt: Date }> {
  const token = `slsess_${nanoid(40)}`
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)
  await db.insert(schema.sessions).values({
    token,
    userId: opts.userId,
    expiresAt,
    userAgent: opts.userAgent,
    ip: opts.ip,
  })
  return { token, expiresAt }
}

export async function findSession(token: string) {
  const rows = await db
    .select({
      token: schema.sessions.token,
      userId: schema.sessions.userId,
      expiresAt: schema.sessions.expiresAt,
      email: schema.users.email,
      name: schema.users.name,
      isAdmin: schema.users.isAdmin,
      avatarUrl: schema.users.avatarUrl,
    })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.users.id, schema.sessions.userId))
    .where(and(eq(schema.sessions.token, token), gt(schema.sessions.expiresAt, new Date())))
    .limit(1)
  return rows[0] ?? null
}

export async function deleteSession(token: string) {
  await db.delete(schema.sessions).where(eq(schema.sessions.token, token))
}

export async function purgeExpiredSessions() {
  await db.delete(schema.sessions).where(lte(schema.sessions.expiresAt, new Date()))
}

/** Serialise a session cookie (HttpOnly, SameSite=Lax, 30-day expiry). */
export function buildSessionCookie(token: string, expiresAt: Date): string {
  const attrs = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Expires=${expiresAt.toUTCString()}`,
  ]
  // In production with HTTPS, add Secure
  if (process.env.NODE_ENV === "production") attrs.push("Secure")
  return attrs.join("; ")
}

export function buildSessionCookieClear(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
}

export function parseSessionCookie(cookieHeader?: string): string | null {
  if (!cookieHeader) return null
  const pairs = cookieHeader.split(";").map((p) => p.trim().split("="))
  for (const [k, v] of pairs) {
    if (k === SESSION_COOKIE && v) return v
  }
  return null
}
