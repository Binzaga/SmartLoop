import { getCurrentUser } from "@/lib/api"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import { UserContext } from "@/components/UserContext"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/dashboard")
  return <UserContext user={user}>{children}</UserContext>
}
