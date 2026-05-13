import { adminFetch, type ProductHealth, type EventSummary } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import { HealthRing } from "@/components/HealthRing"
import { Sparkline } from "@/components/Sparkline"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface OverviewResponse {
  products: ProductHealth[]
  recentEvents: EventSummary[]
  totals: { events24h: number; events7d: number; productsCount: number; alertsFiring: number }
}

async function fetchOverview() {
  return adminFetch<OverviewResponse>("/admin/dashboard/overview")
}

export default async function Home() {
  let data: OverviewResponse | undefined
  let error: string | null = null
  try {
    data = await fetchOverview()
  } catch (err) {
    error = (err as Error).message
  }

  return (
    <main className="min-h-screen">
      <TopBar />

      <div className="mx-auto max-w-7xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">
            <div className="font-semibold text-red-300">API 不可达</div>
            <div className="sl-mono text-xs mt-1 text-red-200/80">{error}</div>
          </div>
        )}

        {data && (
          <>
            <Hero totals={data.totals} />

            <Section
              title="产品健康总览"
              hint="评分综合 24h 评测分 × 差评率 × 幻觉次数"
            >
              {data.products.length === 0 ? (
                <EmptyCard hint="还没接入任何产品。" />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.products.map((p) => (
                    <ProductCard key={p.productId} p={p} />
                  ))}
                </div>
              )}
            </Section>

            <Section title="实时事件流" hint="最近 20 条 AI 交互">
              {data.recentEvents.length === 0 ? (
                <EmptyCard hint="还没有事件。" />
              ) : (
                <EventTable events={data.recentEvents} />
              )}
            </Section>
          </>
        )}
      </div>

      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--text-tertiary)]">
        SmartLoop · Hackathon MVP · Built for SaleSmartly · {new Date().toLocaleDateString("zh-CN")}
      </footer>
    </main>
  )
}

function TopBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(10,10,12,0.6)]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <BrandMark size={28} />
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold tracking-tight">SmartLoop</span>
            <span className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)]">
              v0.1 · AI Quality Platform
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <LivePill />
          <span className="hidden text-[var(--text-secondary)] md:inline">
            for SaleSmartly
          </span>
        </div>
      </div>
    </header>
  )
}

function LivePill() {
  return (
    <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev-1)] px-3 py-1">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 sl-pulse" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      <span className="text-xs text-[var(--text-secondary)]">实时</span>
    </div>
  )
}

function Hero({
  totals,
}: {
  totals: { events24h: number; events7d: number; productsCount: number; alertsFiring: number }
}) {
  return (
    <section className="mb-10">
      <div className="mb-6 max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          让每一个 AI 产品 <GradientWord>自己说出</GradientWord>{" "}
          它哪里错了
        </h1>
        <p className="mt-3 text-sm text-[var(--text-secondary)] md:text-base">
          SmartLoop 是 SaleSmartly 内部所有 AI 产品共用的质量监控平台——SDK 一键接入,
          差评自动归类,Prompt 改动跑回归,异常实时告警。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          label="24h 事件"
          value={totals.events24h.toLocaleString()}
          accent="from-violet-500/20 to-violet-500/0"
        />
        <KpiCard
          label="7d 事件"
          value={totals.events7d.toLocaleString()}
          accent="from-sky-500/20 to-sky-500/0"
        />
        <KpiCard
          label="接入产品"
          value={totals.productsCount.toString()}
          accent="from-teal-500/20 to-teal-500/0"
        />
        <KpiCard
          label="正在告警"
          value={totals.alertsFiring.toString()}
          accent={totals.alertsFiring > 0 ? "from-red-500/20 to-red-500/0" : "from-emerald-500/20 to-emerald-500/0"}
          tone={totals.alertsFiring > 0 ? "warn" : "ok"}
        />
      </div>
    </section>
  )
}

function GradientWord({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        background: "linear-gradient(120deg, #8b7cff 0%, #5eead4 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </span>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {hint && <span className="text-xs text-[var(--text-tertiary)]">{hint}</span>}
      </div>
      {children}
    </section>
  )
}

function KpiCard({
  label,
  value,
  accent,
  tone = "default",
}: {
  label: string
  value: string
  accent: string
  tone?: "default" | "ok" | "warn" | "crit"
}) {
  const text =
    tone === "warn"
      ? "text-amber-400"
      : tone === "crit"
        ? "text-red-400"
        : tone === "ok"
          ? "text-emerald-400"
          : "text-[var(--text-primary)]"
  return (
    <div className={`sl-card relative overflow-hidden p-5`}>
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${accent}`} aria-hidden="true" />
      <div className="text-[11px] uppercase tracking-widest text-[var(--text-tertiary)]">
        {label}
      </div>
      <div className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${text}`}>
        {value}
      </div>
    </div>
  )
}

function ProductCard({ p }: { p: ProductHealth }) {
  // Synthesize a sparkline series from 7d/24h for now (real series in next iteration)
  const fakeSeries = Array.from({ length: 8 }, (_, i) => {
    const base = Math.max(1, p.eventCount7d / 8)
    return base * (0.6 + 0.8 * Math.abs(Math.sin(i + p.productId.length)))
  })
  const sparkColor = p.healthScore >= 80 ? "#10b981" : p.healthScore >= 60 ? "#f59e0b" : "#ef4444"

  return (
    <Link
      href={`/products/${p.productId}`}
      className="sl-card sl-card-hover block p-5 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-base font-semibold">{p.name}</h3>
            <code className="sl-mono text-[11px] text-[var(--text-tertiary)]">
              {p.productId}
            </code>
          </div>
          {p.ownerTeam && (
            <p className="mt-1 text-xs text-[var(--text-secondary)]">{p.ownerTeam}</p>
          )}
          <div className="mt-3">
            <Sparkline values={fakeSeries} stroke={sparkColor} />
            <div className="mt-1 text-[10px] uppercase tracking-wider text-[var(--text-tertiary)]">
              7d activity
            </div>
          </div>
        </div>
        <HealthRing score={p.healthScore} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 border-t border-[var(--border)] pt-4 text-xs">
        <Metric label="24h 事件" value={p.eventCount24h.toString()} />
        <Metric
          label="差评率"
          value={`${(p.thumbsDownRate24h * 100).toFixed(1)}%`}
          tone={p.thumbsDownRate24h > 0.1 ? "warn" : undefined}
        />
        <Metric
          label="幻觉次数"
          value={p.hallucinationCount24h.toString()}
          tone={p.hallucinationCount24h > 0 ? "warn" : undefined}
        />
        <Metric
          label="平均分"
          value={p.avgOverall !== null ? p.avgOverall.toFixed(2) : "—"}
        />
      </div>
    </Link>
  )
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: "warn" | "crit"
}) {
  const color =
    tone === "warn" ? "text-amber-400" : tone === "crit" ? "text-red-400" : "text-[var(--text-primary)]"
  return (
    <div>
      <div className="text-[var(--text-tertiary)]">{label}</div>
      <div className={`mt-0.5 font-medium tabular-nums ${color}`}>{value}</div>
    </div>
  )
}

function EventTable({ events }: { events: EventSummary[] }) {
  return (
    <div className="sl-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[var(--bg-elev-2)] text-left text-[11px] uppercase tracking-widest text-[var(--text-tertiary)]">
          <tr>
            <th className="px-4 py-3 font-medium">时间</th>
            <th className="px-4 py-3 font-medium">产品</th>
            <th className="px-4 py-3 font-medium">用户输入</th>
            <th className="px-4 py-3 font-medium">评分</th>
            <th className="px-4 py-3 font-medium">Tags</th>
            <th className="px-4 py-3 font-medium">反馈</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr
              key={e.id}
              className={`border-t border-[var(--border)] transition hover:bg-[var(--bg-elev-2)] ${
                i === 0 ? "bg-emerald-500/[0.02]" : ""
              }`}
            >
              <td className="px-4 py-3 text-[11px] text-[var(--text-tertiary)] whitespace-nowrap tabular-nums">
                {new Date(e.createdAt).toLocaleString("zh-CN", { hour12: false })}
              </td>
              <td className="px-4 py-3">
                <code className="sl-mono rounded bg-[var(--bg-elev-2)] px-1.5 py-0.5 text-[11px] text-[var(--text-secondary)]">
                  {e.productId}
                </code>
              </td>
              <td className="px-4 py-3 max-w-md truncate" title={e.inputMessage ?? ""}>
                {e.inputMessage ?? <span className="text-[var(--text-tertiary)]">—</span>}
              </td>
              <td className="px-4 py-3">
                <ScoreChip score={e.overallScore} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {e.tags.map((t) => (
                    <Tag key={t} t={t} />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3">
                {e.rating === "up" && <span className="text-emerald-400">👍</span>}
                {e.rating === "down" && <span className="text-red-400">👎</span>}
                {!e.rating && <span className="text-[var(--text-tertiary)]">—</span>}
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
    return <span className="text-[11px] text-[var(--text-tertiary)]">未评</span>
  }
  const tone =
    score >= 4
      ? "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
      : score >= 3
        ? "bg-amber-500/10 text-amber-300 ring-amber-500/20"
        : "bg-red-500/10 text-red-300 ring-red-500/20"
  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ring-1 tabular-nums ${tone}`}
    >
      {score}
    </span>
  )
}

function Tag({ t }: { t: string }) {
  const tone =
    t === "good"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
      : t === "hallucination"
        ? "bg-red-500/10 text-red-300 border-red-500/30"
        : t.includes("safety")
          ? "bg-red-500/10 text-red-300 border-red-500/30"
          : t.includes("too_long") || t.includes("too_short")
            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
            : "bg-[var(--bg-elev-2)] text-[var(--text-secondary)] border-[var(--border)]"
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>
      {t}
    </span>
  )
}

function EmptyCard({ hint }: { hint: string }) {
  return (
    <div className="sl-card border-dashed p-10 text-center text-sm text-[var(--text-secondary)]">
      {hint}
    </div>
  )
}
