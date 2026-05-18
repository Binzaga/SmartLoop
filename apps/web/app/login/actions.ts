"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

const API_URL = process.env.SMARTLOOP_API_URL ?? "http://127.0.0.1:8088"

interface AuthState {
  error?: string
  ok?: boolean
}

/**
 * Server Action for login + signup. Handles the API call server-side,
 * extracts the Set-Cookie value, persists it via Next's cookie store,
 * and redirects on success. Avoids all client-side cookie / hydration
 * timing issues.
 */
export async function authAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const mode = formData.get("mode")?.toString() === "signup" ? "signup" : "login"
  const email = formData.get("email")?.toString().trim().toLowerCase()
  const password = formData.get("password")?.toString()
  const name = formData.get("name")?.toString().trim() || undefined
  const next = formData.get("next")?.toString() || "/dashboard"

  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login"
  const body = mode === "signup" ? { email, password, name } : { email, password }

  let res: Response
  try {
    res = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    })
  } catch (err) {
    return { error: `Network error: ${(err as Error).message}` }
  }

  const data: any = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { error: data.error ?? `Auth failed (HTTP ${res.status})` }
  }

  // Extract the session token from the API's Set-Cookie header and
  // re-set it via Next's server-side cookie store so the very next
  // request (the redirect target) carries it.
  const setCookieHeader = res.headers.get("set-cookie") ?? ""
  const match = /sl_session=([^;]+)/.exec(setCookieHeader)
  if (match) {
    const cookieStore = await cookies()
    cookieStore.set("sl_session", match[1], {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    })
  }

  redirect(next)
}
