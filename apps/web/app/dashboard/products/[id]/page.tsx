import { adminFetch } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import { HealthRing } from "@/components/HealthRing"
import { Sparkline } from "@/components/Sparkline"
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconBrain,
  IconChart,
  IconCheck,
  IconClock,
  IconHeart,
  IconThumbsDown,
  IconThumbsUp,
} from "@/components/icons"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ProductDetail {
  product: {
    id: string
    name: string
    ownerTeam: string | null
    description: string | null
    createdAt: string
  }
  stats: {
    event_count_24h: number
    event_count_7d: number
    avg_overall_24h: number | null
    avg_overall_7d: number | null
    hallucination_24h: number
    avg_latency_24h: number
    feedback_count_24h: number
    downs_24h: number
    ups_24h: number
  }
  trend: Array<{
    day: string
    events: number
    avgScore: number | null
    hallucinations: number
  }>
  recentEvents: Array<{
    id: string
    inputMessage: string | null
    outputMessage: string | null
    model: string | null
    overallScore: number | null
    tags: string[]
    rating: "up" | "down" | "neutral" | null
    createdAt: string
  }>
  tagDistribution: Array<{ tag: string; count: number }>
}

const TAG_META: Record<string, { label: string; tone: string }> = {
  hallucination: { label: "Hallucination", tone: "red" },
  too_long: { label: "Too long", tone: "amber" },
  too_short: { label: "Too short", tone: "amber" },
  off_topic: { label: "Off topic", tone: "amber" },
  format_violation: { label: "Format violation", tone: "amber" },
  safety_violation: { label: "Safety violation", tone: "red" },
  multilingual_drift: { label: "Multilingual drift", tone: "indigo" },
  wrong_lookup: { label: "Wrong tool result", tone: "indigo" },
}

export default async function ProductDetail(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params
  let data: ProductDetail | undefined
  try {
    data = await adminFetch<ProductDetail>(`/admin/dashboard/products/${encodeURIComponent(id)}`)
  } catch (err) {
    if (`${err}`.includes("404")) notFound()
    throw err
  }
  if (!data) notFound()

  const { product, stats, trend, recentEvents, tagDistribution } = data

  // Health score (simple composite)
  let score = 100
  if (stats.avg_overall_24h !== null) score -= Math.max(0, (4 - stats.avg_overall_24h) * 10)
  if (stats.feedback_count_24h > 0)
    score -= (stats.downs_24h / stats.feedback_count_24h) * 100 * 0.4
  if (stats.event_count_24h > 0)
    score -= Math.min(40, (stats.hallucination_24h / stats.event_count_24h) * 100 * 0.5)
  const healthScore = Math.max(0, Math.min(100, Math.round(score)))

  const series = trend.map((d) => d.events)

  return (
    <>
      <DashboardNav productName={product.name} />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-8">
        <Breadcrumb productId={product.id} productName={product.name} />

        <header className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">{product.name}</h1>
              <code className="sl-mono rounded bg-bg-elev-2 px-2 py-0.5 text-[11px] text-text-secondary">
                {product.id}
              </code>
            </div>
            {product.ownerTeam && (
              <p className="text-sm text-text-secondary">
                Owner · <span className="text-text-primary">{product.ownerTeam}</span>
              </p>
            )}
            {product.description && (
              <p className="mt-3 max-w-2xl text-sm text-text-tertiary">{product.description}</p>
            )}
            <p className="mt-2 text-[11px] text-text-quaternary">
              Created {new Date(product.createdAt).toLocaleDateString("zh-CN")}
            </p>
          </div>
          <div className="flex items-center justify-end gap-6">
            <HealthRing score={healthScore} size={104} />
          </div>
        </header>

        {/* KPI strip */}
        <section className="mb-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi
            icon={<IconActivity size={14} />}
            label="24h events"
            value={stats.event_count_24h.toLocaleString()}
            sub={`${stats.event_count_7d.toLocaleString()} in 7d`}
          />
          <Kpi
            icon={<IconHeart size={14} />}
            label="Avg score 24h"
            value={stats.avg_overall_24h !== null ? stats.avg_overall_24h.toFixed(2) : "—"}
            sub={stats.avg_overall_7d !== null ? `7d: ${stats.avg_overall_7d.toFixed(2)}` : "no judged events"}
            tone={stats.avg_overall_24h !== null && stats.avg_overall_24h < 3.5 ? "warn" : "default"}
          />
          <Kpi
            icon={<IconBrain size={14} />}
            label="Hallucination 24h"
            value={stats.hallucination_24h.toString()}
            sub={stats.event_count_24h > 0 ? `${((stats.hallucination_24h / stats.event_count_24h) * 100).toFixed(1)}%` : "0%"}
            tone={stats.hallucination_24h > 0 ? "warn" : "default"}
          />
          <Kpi
            icon={<IconClock size={14} />}
            label="Avg latency"
            value={stats.avg_latency_24h > 0 ? `${stats.avg_latency_24h}ms` : "—"}
            sub={stats.event_count_24h > 0 ? "all 24h events" : "no events"}
          />
        </section>

        {/* 7-day trend */}
        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between border-b border-border-soft pb-3">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold tracking-tight">
              <IconChart size={14} className="text-accent-from" />
              7d Activity Trend
            </h2>
            <span className="text-[11px] text-text-tertiary">
              {trend.length} day buckets
            </span>
          </div>
          <div className="sl-card p-6">
            {trend.length === 0 ? (
              <p className="py-6 text-center text-sm text-text-tertiary">No activity in last 7 days</p>
            ) : (
              <div className="flex items-end gap-6">
                <Sparkline values={series} width={600} height={80} />
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                  {trend.slice(-4).map((d) => (
                    <div key={d.day}>
                      <p className="text-text-tertiary">{new Date(d.day).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}</p>
                      <p className="font-medium tabular-nums">{d.events} events</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Bad-case clusters / tag distribution */}
        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between border-b border-border-soft pb-3">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold tracking-tight">
              <IconAlert size={14} className="text-accent-from" />
              Bad-Case Distribution (24h)
            </h2>
            <span className="text-[11px] text-text-tertiary">
              Auto-clustering worker coming soon · showing tag-based grouping
            </span>
          </div>
          {tagDistribution.length === 0 ? (
            <div className="sl-card sl-dots p-12 text-center text-sm text-text-tertiary">
              No bad cases in last 24 hours. Healthy! 🎉
            </div>
          ) : (
            <div className="sl-card p-6">
              <ClusterStackedBar dist={tagDistribution} />
              <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {tagDistribution.map((d) => (
                  <ClusterRow key={d.tag} tag={d.tag} count={d.count} />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Recent events */}
        <section>
          <div className="mb-3 flex items-baseline justify-between border-b border-border-soft pb-3">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold tracking-tight">
              <IconActivity size={14} className="text-accent-from" />
              Recent Events
            </h2>
            <span className="text-[11px] text-text-tertiary">{recentEvents.length} of latest</span>
          </div>
          <EventTable events={recentEvents} />
        </section>
      </main>
      <Footer />
    </>
  )
}

// ============================================================================

function DashboardNav({ productName }: { productName: string }) {
  return (
    <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
          </Link>
          <span className="text-text-quaternary">/</span>
          <span className="text-sm text-text-secondary">{productName}</span>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-bg-elev-1 px-3 py-1.5 text-xs text-text-secondary hover:border-border"
        >
          ← Back to overview
        </Link>
      </div>
    </header>
  )
}

function Breadcrumb({ productId, productName }: { productId: string; productName: string }) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs text-text-tertiary">
      <Link href="/dashboard" className="hover:text-text-primary">
        Dashboard
      </Link>
      <span>/</span>
      <Link href="/dashboard" className="hover:text-text-primary">
        Products
      </Link>
      <span>/</span>
      <span className="text-text-secondary">
        {productName} <code className="sl-mono ml-1 text-text-tertiary">{productId}</code>
      </span>
    </nav>
  )
}

function Kpi({
  icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub?: string
  tone?: "default" | "warn" | "crit"
}) {
  const valueColor = tone === "warn" ? "text-amber-400" : tone === "crit" ? "text-red-400" : "text-text-primary"
  return (
    <div className="sl-card p-5">
      <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-text-tertiary">
        {icon}
        {label}
      </div>
      <div className={`mt-3 text-3xl font-semibold tabular-nums tracking-tight ${valueColor}`}>{value}</div>
      {sub && <p className="mt-1 text-[11px] text-text-tertiary">{sub}</p>}
    </div>
  )
}

function ClusterStackedBar({ dist }: { dist: Array<{ tag: string; count: number }> }) {
  const total = dist.reduce((s, d) => s + d.count, 0)
  if (total === 0) return null
  return (
    <div className="flex h-2.5 overflow-hidden rounded-full bg-bg-elev-3">
      {dist.map((d) => {
        const tone = TAG_META[d.tag]?.tone ?? "amber"
        const color =
          tone === "red"
            ? "bg-red-500"
            : tone === "amber"
              ? "bg-amber-500"
              : tone === "indigo"
                ? "bg-indigo-500"
                : "bg-text-quaternary"
        return <div key={d.tag} className={color} style={{ width: `${(d.count / total) * 100}%` }} />
      })}
    </div>
  )
}

function ClusterRow({ tag, count }: { tag: string; count: number }) {
  const meta = TAG_META[tag] ?? { label: tag, tone: "amber" }
  const tone =
    meta.tone === "red"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : meta.tone === "amber"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : meta.tone === "indigo"
          ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
          : "border-border-soft bg-bg-elev-2 text-text-secondary"
  const dotColor =
    meta.tone === "red"
      ? "bg-red-500"
      : meta.tone === "amber"
        ? "bg-amber-500"
        : meta.tone === "indigo"
          ? "bg-indigo-500"
          : "bg-text-quaternary"
  return (
    <div className={`flex items-center justify-between rounded-lg border bg-bg-elev-2/40 p-3 ${tone.split(" ").filter(c => c.startsWith("border")).join(" ")}`}>
      <span className="inline-flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dotColor}`} />
        <span className="text-sm">{meta.label}</span>
      </span>
      <span className="tabular-nums text-sm font-medium">{count}</span>
    </div>
  )
}

function EventTable({
  events,
}: {
  events: ProductDetail["recentEvents"]
}) {
  if (events.length === 0) {
    return (
      <div className="sl-card sl-dots p-12 text-center text-sm text-text-tertiary">No events yet</div>
    )
  }
  return (
    <div className="sl-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-border-soft bg-bg-elev-2/40 text-left text-[10px] uppercase tracking-[0.18em] text-text-tertiary">
          <tr>
            <th className="px-5 py-3 font-medium">Time</th>
            <th className="px-5 py-3 font-medium">User input</th>
            <th className="px-5 py-3 font-medium">Score</th>
            <th className="px-5 py-3 font-medium">Tags</th>
            <th className="px-5 py-3 font-medium">Feedback</th>
            <th className="px-5 py-3 font-medium" />
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr
              key={e.id}
              className={`group border-t border-border-soft transition hover:bg-bg-elev-2/60 ${
                i === 0 ? "bg-accent-from/[0.025]" : ""
              }`}
            >
              <td className="px-5 py-3 align-top text-[11px] text-text-tertiary whitespace-nowrap tabular-nums">
                {new Date(e.createdAt).toLocaleString("zh-CN", { hour12: false })}
              </td>
              <td className="px-5 py-3 align-top">
                <div className="max-w-md truncate" title={e.inputMessage ?? ""}>
                  {e.inputMessage ?? <span className="text-text-tertiary">—</span>}
                </div>
                {e.outputMessage && (
                  <div className="mt-1 max-w-md truncate text-[11px] text-text-tertiary" title={e.outputMessage}>
                    → {e.outputMessage}
                  </div>
                )}
              </td>
              <td className="px-5 py-3 align-top">
                <ScoreChip score={e.overallScore} />
              </td>
              <td className="px-5 py-3 align-top">
                <div className="flex flex-wrap gap-1">
                  {e.tags.map((t) => (
                    <Tag key={t} t={t} />
                  ))}
                </div>
              </td>
              <td className="px-5 py-3 align-top">
                {e.rating === "up" && <IconThumbsUp size={14} className="text-emerald-400" />}
                {e.rating === "down" && <IconThumbsDown size={14} className="text-red-400" />}
                {!e.rating && <span className="text-text-quaternary">—</span>}
              </td>
              <td className="px-5 py-3 align-top">
                <Link
                  href={`/dashboard/events/${e.id}`}
                  className="inline-flex items-center gap-1 text-[11px] text-text-tertiary opacity-0 transition group-hover:opacity-100 hover:text-text-primary"
                >
                  Details <IconArrowRight size={10} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScoreChip({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-[11px] text-text-tertiary">—</span>
  }
  const tone =
    score >= 4
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : score >= 3
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold tabular-nums ${tone}`}>
      {score}
    </span>
  )
}

function Tag({ t }: { t: string }) {
  const meta = TAG_META[t]
  const tone =
    t === "good"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : meta?.tone === "red"
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : meta?.tone === "amber"
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : meta?.tone === "indigo"
            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
            : "border-border bg-bg-elev-2 text-text-secondary"
  return (
    <span className={`inline-flex items-center rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>
      {meta?.label ?? t}
    </span>
  )
}

function Footer() {
  return (
    <footer className="border-t border-border-soft py-6 text-center text-[11px] text-text-tertiary">
      <span>SmartLoop · MIT licensed</span>
    </footer>
  )
}
