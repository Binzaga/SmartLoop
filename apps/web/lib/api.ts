/**
 * Server-side API client. Talks to the SmartLoop API on localhost.
 * Never exposed to the browser — keep ADMIN_TOKEN server-side only.
 */

const API_URL = process.env.SMARTLOOP_API_URL ?? "http://127.0.0.1:8088"
const ADMIN_TOKEN = process.env.SMARTLOOP_ADMIN_TOKEN ?? ""

type FetchOpts = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  /** Revalidate window in seconds for ISR-style caching. 0 = always fresh. */
  revalidate?: number
}

export async function adminFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      "x-admin-token": ADMIN_TOKEN,
      ...(opts.body ? { "content-type": "application/json" } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    next: opts.revalidate !== undefined ? { revalidate: opts.revalidate } : { revalidate: 0 },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`API ${path} failed ${res.status}: ${text.slice(0, 200)}`)
  }
  return (await res.json()) as T
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
