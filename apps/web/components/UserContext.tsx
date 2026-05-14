"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { CurrentUser } from "@/lib/api"

const Ctx = createContext<CurrentUser | null>(null)

export function UserContext({ user, children }: { user: CurrentUser; children: ReactNode }) {
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>
}

export function useCurrentUser() {
  return useContext(Ctx)
}
