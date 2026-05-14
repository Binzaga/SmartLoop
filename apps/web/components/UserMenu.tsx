"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useCurrentUser } from "@/components/UserContext"

export function UserMenu() {
  const user = useCurrentUser()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  if (!user) return null

  const initial = (user.name?.[0] ?? user.email[0] ?? "?").toUpperCase()

  const logout = () => {
    startTransition(async () => {
      await fetch("/auth/logout", { method: "POST", credentials: "include" })
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-border-soft bg-bg-elev-1 px-2 py-1 transition hover:border-border"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-from to-accent-to text-[10px] font-semibold text-bg-base">
          {initial}
        </span>
        <span className="hidden text-xs text-text-secondary md:inline">
          {user.name ?? user.email}
        </span>
      </button>
      {open && (
        <>
          <button
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-30"
            tabIndex={-1}
          />
          <div className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-bg-elev-1 shadow-2xl shadow-black/40">
            <div className="border-b border-border-soft p-3">
              <p className="truncate text-sm font-medium">{user.name ?? "—"}</p>
              <p className="truncate text-[11px] text-text-tertiary">{user.email}</p>
              {user.isAdmin && (
                <span className="mt-2 inline-block rounded border border-accent-from/30 bg-accent-from/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-accent-from">
                  Admin
                </span>
              )}
            </div>
            <button
              onClick={logout}
              disabled={pending}
              className="block w-full px-3 py-2 text-left text-sm text-text-secondary hover:bg-bg-elev-2 disabled:opacity-50"
            >
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
