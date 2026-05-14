/**
 * Server-side API client. Talks to the SmartLoop API on localhost.
 * Forwards the user's session cookie so /admin/* endpoints recognise the
 * logged-in user. Falls back to X-Admin-Token if SMARTLOOP_ADMIN_TOKEN is
 * still configured (legacy / programmatic access).
 */
import { cookies } from "next/headers"

const API_URL = process.env.SMARTLOOP_API_URL ?? "http://127.0.0.1:8088"
const ADMIN_TOKEN = process.env.SMARTLOOP_ADMIN_TOKEN ?? ""

type FetchOpts = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  revalidate?: number
}

async function buildHeaders(opts: FetchOpts): Promise<Record<string, string>> {
  const headers: Record<string, string> = {}
  if (opts.body) headers["content-type"] = "application/json"

  // Forward the user's session cookie if present
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("sl_session")
    if (session) headers["cookie"] = `sl_session=${session.value}`
  } catch {
    // cookies() throws if called outside a request context — that's fine
  }

  // Fallback: legacy admin token for scripts / first-run before login
  if (ADMIN_TOKEN && !headers["cookie"]) {
    headers["x-admin-token"] = ADMIN_TOKEN
  }
  return headers
}

export async function adminFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const headers = await buildHeaders(opts)
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${path} failed ${res.status}: ${text.slice(0, 200)}`)
  }
  return (await res.json()) as T
}

export interface CurrentUser {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  avatarUrl: string | null
}

/** Returns the current user from the session cookie, or null if not signed in. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("sl_session")
    if (!session) return null
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { cookie: `sl_session=${session.value}` },
      next: { revalidate: 0 },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.user as CurrentUser
  } catch {
    return null
  }
}

// ===== Types matching the API responses =====

export interface Product {
  id: string
  orgId: string
  name: string
  ownerTeam: string | null
  enabled: boolean
  createdAt: string
}

export interface ProductsResponse {
  products: Product[]
}

export interface ProductHealth {
  productId: string
  name: string
  ownerTeam: string | null
  eventCount24h: number
  eventCount7d: number
  avgOverall: number | null
  thumbsDownRate24h: number
  hallucinationCount24h: number
  judgedRatio: number
  healthScore: number
}

export interface EventSummary {
  id: string
  productId: string
  inputMessage: string | null
  outputMessage: string | null
  model: string | null
  overallScore: number | null
  tags: string[]
  rating: "up" | "down" | "neutral" | null
  createdAt: string
}
