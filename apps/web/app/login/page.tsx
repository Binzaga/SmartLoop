import { BrandMark } from "@/components/BrandMark"
import { LoginForm } from "@/components/LoginForm"
import { getCurrentUser } from "@/lib/api"
import { redirect } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function LoginPage(props: {
  searchParams: Promise<{ next?: string; mode?: string }>
}) {
  const user = await getCurrentUser()
  const sp = await props.searchParams
  if (user) {
    redirect(sp.next ?? "/dashboard")
  }

  return (
    <main className="flex min-h-screen flex-col">
      <header className="border-b border-border-soft py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={26} />
            <span className="text-base font-semibold tracking-tight">SmartLoop</span>
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop"
            target="_blank"
            className="text-xs text-text-tertiary hover:text-text-primary"
          >
            github
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-soft bg-bg-elev-1 px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-text-secondary">
                self-hosted instance
              </span>
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">Welcome to SmartLoop</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Sign in or create an account to access your dashboard.
            </p>
          </div>

          <LoginForm defaultMode={sp.mode === "signup" ? "signup" : "login"} next={sp.next} />

          <p className="mt-8 text-center text-[11px] text-text-tertiary">
            The first user to sign up on this instance becomes the admin.
            <br />
            Self-host docs:{" "}
            <Link
              href="https://github.com/Binzaga/SmartLoop/blob/main/docs/DEVELOPMENT.md"
              target="_blank"
              className="underline-offset-2 hover:underline"
            >
              DEVELOPMENT.md
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
