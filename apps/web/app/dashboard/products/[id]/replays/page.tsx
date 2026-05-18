import { adminFetch } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import { IconArrowRight, IconClock, IconBolt } from "@/components/icons"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ReplayListRun {
  id: string
  productId: string
  name: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  sourceType: string
  totalEvents: number
  completedEvents: number
  improvedCount: number
  regressedCount: number
  sameCount: number
  passRateOld: number | null
  passRateNew: number | null
  newPromptLabel: string | null
  model: string
  createdAt: string
  completedAt: string | null
}

export default async function ReplaysList(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  let runs: ReplayListRun[] = []
  let productName = id
  try {
    const [list, product] = await Promise.all([
      adminFetch<{ runs: ReplayListRun[] }>(
        `/admin/replay/list?productId=${encodeURIComponent(id)}`,
      ),
      adminFetch<{ product: { name: string } }>(
        `/admin/dashboard/products/${encodeURIComponent(id)}`,
      ),
    ])
    runs = list.runs
    productName = product.product.name
  } catch (err) {
    if (`${err}`.includes("404")) notFound()
    throw err
  }

  return (
    <>
      <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <BrandMark size={28} />
              <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
            </Link>
            <span className="text-text-quaternary">/</span>
            <Link
              href={`/dashboard/products/${id}`}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              {productName}
            </Link>
            <span className="text-text-quaternary">/</span>
            <span className="text-sm text-text-secondary">Replays</span>
          </div>
          <Link
            href={`/dashboard/products/${id}/replays/new?source=recent`}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-4 py-2 text-sm font-medium text-bg-base"
          >
            <IconBolt size={12} />
            New replay
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <section className="mb-8">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-accent-from">
            Replay sandbox
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">Replay runs</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary">
            Test a new prompt against historical bad cases. See exactly which events improve,
            regress, or stay the same before you ship the change.
          </p>
        </section>

        {runs.length === 0 ? (
          <div className="sl-card sl-dots p-12 text-center">
            <p className="mb-2 text-sm text-text-secondary">No replay runs yet.</p>
            <p className="mb-6 text-[12px] text-text-tertiary">
              Start one from a cluster you want to fix, or against the last 24h of bad cases.
            </p>
            <Link
              href={`/dashboard/products/${id}/replays/new?source=recent`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-5 py-2 text-sm font-medium text-bg-base"
            >
              <IconBolt size={12} />
              Start your first replay
            </Link>
          </div>
        ) : (
          <div className="sl-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-border-soft bg-bg-elev-2/40 text-left text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Events</th>
                  <th className="px-5 py-3 font-medium">Pass rate</th>
                  <th className="px-5 py-3 font-medium">Δ</th>
                  <th className="px-5 py-3 font-medium">Started</th>
                  <th className="px-5 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
                  <tr key={r.id} className="group border-t border-border-soft hover:bg-bg-elev-2/60">
                    <td className="px-5 py-3.5 align-top">
                      <Link
                        href={`/dashboard/replays/${r.id}`}
                        className="block hover:text-accent-from"
                      >
                        <div className="font-medium">{r.name}</div>
                        <div className="mt-0.5 text-[11px] text-text-tertiary">
                          {r.sourceType} · <code className="sl-mono">{r.model}</code>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-5 py-3.5 align-top text-[12px] tabular-nums">
                      {r.completedEvents}/{r.totalEvents}
                    </td>
                    <td className="px-5 py-3.5 align-top text-[12px] tabular-nums">
                      {r.passRateOld !== null && r.passRateNew !== null ? (
                        <span>
                          <span className="text-text-tertiary">
                            {Math.round(r.passRateOld * 100)}%
                          </span>{" "}
                          →{" "}
                          <span
                            className={
                              r.passRateNew > r.passRateOld
                                ? "text-emerald-400"
                                : r.passRateNew < r.passRateOld
                                  ? "text-red-400"
                                  : "text-text-primary"
                            }
                          >
                            {Math.round(r.passRateNew * 100)}%
                          </span>
                        </span>
                      ) : (
                        <span className="text-text-tertiary">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 align-top text-[12px]">
                      <span className="text-emerald-400">+{r.improvedCount}</span>{" "}
                      <span className="text-text-tertiary">/</span>{" "}
                      <span className="text-red-400">-{r.regressedCount}</span>
                    </td>
                    <td className="px-5 py-3.5 align-top text-[11px] text-text-tertiary tabular-nums">
                      <div className="inline-flex items-center gap-1">
                        <IconClock size={10} />
                        {new Date(r.createdAt).toLocaleString("zh-CN", { hour12: false })}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 align-top">
                      <Link
                        href={`/dashboard/replays/${r.id}`}
                        className="inline-flex items-center gap-1 text-[11px] text-text-tertiary opacity-0 transition group-hover:opacity-100 hover:text-text-primary"
                      >
                        Open <IconArrowRight size={10} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <footer className="border-t border-border-soft py-6 text-center text-[11px] text-text-tertiary">
        SmartLoop · MIT licensed
      </footer>
    </>
  )
}

function StatusPill({ status }: { status: ReplayListRun["status"] }) {
  const map: Record<ReplayListRun["status"], { label: string; tone: string }> = {
    queued: { label: "Queued", tone: "border-text-tertiary/30 bg-text-tertiary/10 text-text-secondary" },
    running: { label: "Running", tone: "border-accent-from/30 bg-accent-from/10 text-accent-from" },
    completed: { label: "Done", tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    failed: { label: "Failed", tone: "border-red-500/30 bg-red-500/10 text-red-300" },
    cancelled: { label: "Cancelled", tone: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  }
  const m = map[status]
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${m.tone}`}
    >
      {m.label}
    </span>
  )
}
