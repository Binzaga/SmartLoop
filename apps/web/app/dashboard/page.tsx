import { adminFetch, type ProductHealth, type EventSummary } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import { HealthRing } from "@/components/HealthRing"
import { Sparkline } from "@/components/Sparkline"
import {
  IconActivity,
  IconAlert,
  IconArrowRight,
  IconBolt,
  IconBrain,
  IconCheck,
  IconChart,
  IconClock,
  IconHeart,
  IconMessage,
  IconRobot,
  IconSearch,
  IconShield,
  IconSparkle,
  IconThumbsDown,
  IconThumbsUp,
} from "@/components/icons"
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

  // Highlight a bad case for the spotlight slot
  const spotlight = data?.recentEvents.find(
    (e) => (e.overallScore ?? 5) <= 3 || e.tags.includes("hallucination"),
  ) ?? data?.recentEvents[0]

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-6 pb-20 pt-10">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-500/5 p-4 text-sm sl-fade-in">
            <IconAlert size={20} className="mt-0.5 text-red-400 shrink-0" />
            <div>
              <div className="font-semibold text-red-300">API 不可达</div>
              <div className="sl-mono mt-1 text-xs text-red-200/70">{error}</div>
            </div>
          </div>
        )}

        {data && (
          <>
            <Hero totals={data.totals} />
            <SpotlightStrip spotlight={spotlight ?? null} />
            <SectionTitle
              eyebrow="Products"
              title="实时健康看板"
              hint="评分综合 24h 评测分 × 差评率 × 幻觉次数"
              icon={<IconChart size={14} />}
            />
            <ProductsGrid products={data.products} />
            <SectionTitle
              eyebrow="Live"
              title="实时事件流"
              hint={`最近 ${data.recentEvents.length} 条 AI 交互`}
              icon={<IconActivity size={14} />}
            />
            <EventTable events={data.recentEvents} />
          </>
        )}
      </main>
      <Footer />
    </>
  )
}

// ============================================================================
// Top Bar
// ============================================================================

function TopBar() {
  return (
    <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="sl-float inline-flex">
            <BrandMark size={30} />
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
              AI Quality
            </span>
          </div>
        </Link>

        <div className="hidden flex-1 px-12 md:flex">
          <div className="relative w-full max-w-md">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="搜索事件、cluster、产品…"
              className="w-full rounded-lg border border-border-soft bg-bg-elev-1 px-9 py-1.5 text-sm placeholder:text-text-quaternary focus:border-border-strong focus:outline-none"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 sl-mono text-[10px] text-text-tertiary">
              ⌘ K
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <LiveBadge />
          <button className="hidden items-center gap-1.5 rounded-lg border border-border-soft bg-bg-elev-1 px-3 py-1.5 text-xs text-text-secondary hover:border-border md:inline-flex">
            <IconBolt size={12} />
            操作
          </button>
        </div>
      </div>
    </header>
  )
}

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.08] px-2.5 py-1">
      <span className="relative flex h-1.5 w-1.5">
        <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="text-[10px] font-medium uppercase tracking-wider text-emerald-300">Live</span>
    </div>
  )
}

// ============================================================================
// Hero
// ============================================================================

function Hero({
  totals,
}: {
  totals: { events24h: number; events7d: number; productsCount: number; alertsFiring: number }
}) {
  return (
    <section className="mb-10">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl sl-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border-soft bg-bg-elev-1 px-3 py-1">
            <IconSparkle size={12} className="text-accent-from" />
            <span className="text-[11px] uppercase tracking-widest text-text-secondary">
              Live Quality Dashboard · v0.1 alpha
            </span>
          </div>
          <h1 className="text-[44px] font-semibold leading-[1.05] tracking-tight md:text-[56px]">
            让每一个 AI 产品
            <br />
            <span className="sl-gradient-text">自己说出</span> 它哪里错了
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-text-secondary">
            一处「质检台」给所有 AI 产品共用——SDK 一行接入，差评自动归类，
            Prompt 改动跑回归，异常实时告警。Open source, MIT-licensed.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3 sl-fade-in" style={{ animationDelay: "150ms" }}>
          <Link
            href="https://github.com/Binzaga/SmartLoop/blob/main/docs/SDK.md"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-5 py-2.5 text-sm font-medium text-bg-base shadow-lg shadow-accent-from/20 transition hover:shadow-accent-from/30"
          >
            集成新产品
            <IconArrowRight size={14} />
          </Link>
          <Link
            href="https://github.com/Binzaga/SmartLoop/tree/main/docs"
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl border border-border-soft bg-bg-elev-1 px-4 py-2.5 text-sm text-text-secondary hover:border-border"
          >
            查看文档
          </Link>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard
          icon={<IconMessage size={14} />}
          label="24h 事件"
          value={totals.events24h.toLocaleString()}
          delta={null}
          accent="from-accent-from/15 to-transparent"
        />
        <KpiCard
          icon={<IconActivity size={14} />}
          label="7d 事件"
          value={totals.events7d.toLocaleString()}
          delta={null}
          accent="from-indigo-500/15 to-transparent"
        />
        <KpiCard
          icon={<IconRobot size={14} />}
          label="接入产品"
          value={totals.productsCount.toString()}
          delta={null}
          accent="from-teal-500/15 to-transparent"
        />
        <KpiCard
          icon={<IconAlert size={14} />}
          label="正在告警"
          value={totals.alertsFiring.toString()}
          delta={null}
          accent={
            totals.alertsFiring > 0
              ? "from-red-500/20 to-transparent"
              : "from-emerald-500/15 to-transparent"
          }
          tone={totals.alertsFiring > 0 ? "crit" : "good"}
        />
      </div>
    </section>
  )
}

function KpiCard({
  icon,
  label,
  value,
  delta,
  accent,
  tone = "default",
}: {
  icon: React.ReactNode
  label: string
  value: string
  delta: string | null
  accent: string
  tone?: "default" | "good" | "warn" | "crit"
}) {
  const valueTone =
    tone === "crit"
      ? "text-red-400"
      : tone === "warn"
        ? "text-amber-400"
        : tone === "good"
          ? "text-emerald-400"
          : "text-text-primary"
  return (
    <div className="sl-card p-5">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-3xl`}
        aria-hidden
      />
      <div className="flex items-center justify-between text-text-tertiary">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-widest">
          {icon}
          {label}
        </span>
        {delta && <span className="text-[10px]">{delta}</span>}
      </div>
      <div className={`mt-4 text-[40px] font-semibold leading-none tracking-tight tabular-nums ${valueTone}`}>
        {value}
      </div>
    </div>
  )
}

// ============================================================================
// Spotlight: most recent bad case (the demo "Aha" moment)
// ============================================================================

function SpotlightStrip({ spotlight }: { spotlight: EventSummary | null }) {
  if (!spotlight) return null
  const isBad = (spotlight.overallScore ?? 5) <= 3 || spotlight.tags.includes("hallucination")

  return (
    <section className="mb-10 sl-fade-in" style={{ animationDelay: "200ms" }}>
      <div className="sl-card relative p-6 md:p-7">
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r ${
            isBad
              ? "from-transparent via-red-400/40 to-transparent"
              : "from-transparent via-accent-from/40 to-transparent"
          }`}
          aria-hidden
        />
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <div className="flex shrink-0 items-start gap-3">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
                isBad
                  ? "border-red-500/30 bg-red-500/10 text-red-400"
                  : "border-accent-from/30 bg-accent-from/10 text-accent-from"
              }`}
            >
              {isBad ? <IconAlert size={20} /> : <IconSparkle size={20} />}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span
                className={`sl-pill ${
                  isBad
                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                }`}
              >
                {isBad ? <IconAlert size={11} /> : <IconCheck size={11} />}
                {isBad ? "Quality Loop 抓到" : "近期最佳"}
              </span>
              <span className="sl-mono text-[11px] text-text-tertiary">
                {spotlight.productId}
              </span>
              <span className="text-[11px] text-text-tertiary">·</span>
              <span className="sl-mono text-[11px] text-text-tertiary">
                {new Date(spotlight.createdAt).toLocaleString("zh-CN", { hour12: false })}
              </span>
              {spotlight.tags.length > 0 && (
                <>
                  <span className="text-[11px] text-text-tertiary">·</span>
                  <div className="flex flex-wrap gap-1">
                    {spotlight.tags.map((t) => (
                      <Tag key={t} t={t} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <h3 className="text-[17px] font-medium tracking-tight text-text-primary">
              {spotlight.inputMessage ?? "(empty input)"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              <span className="mr-2 inline-flex h-4 w-4 items-center justify-center rounded bg-bg-elev-3 text-[10px] text-text-tertiary">
                AI
              </span>
              {spotlight.outputMessage ?? "(empty output)"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:flex-col md:items-end">
            <ScoreChip score={spotlight.overallScore} large />
            <Link
              href={`/dashboard/events/${spotlight.id}`}
              className="inline-flex items-center gap-1 rounded-lg border border-border-soft bg-bg-elev-2 px-3 py-1.5 text-xs text-text-secondary hover:border-border hover:text-text-primary"
            >
              查看根因
              <IconArrowRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// Section title
// ============================================================================

function SectionTitle({
  eyebrow,
  title,
  hint,
  icon,
}: {
  eyebrow: string
  title: string
  hint?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3 border-b border-border-soft pb-3">
      <div className="flex items-baseline gap-3">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] text-text-tertiary">
          {icon}
          {eyebrow}
        </span>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
      </div>
      {hint && <span className="text-[11px] text-text-tertiary">{hint}</span>}
    </div>
  )
}

// ============================================================================
// Products grid
// ============================================================================

function ProductsGrid({ products }: { products: ProductHealth[] }) {
  if (products.length === 0) {
    return (
      <div className="sl-card sl-dots p-12 text-center text-sm text-text-secondary">
        还没接入任何产品。
        <br />
        <code className="sl-mono mt-2 inline-block rounded bg-bg-elev-2 px-2 py-1 text-xs">
          POST /admin/products
        </code>
      </div>
    )
  }
  return (
    <div className="mb-12 grid grid-cols-1 gap-4 md:grid-cols-2">
      {products.map((p, i) => (
        <div key={p.productId} className="sl-fade-in" style={{ animationDelay: `${300 + i * 80}ms` }}>
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  )
}

function ProductCard({ p }: { p: ProductHealth }) {
  const seed = p.productId
    .split("")
    .reduce((s, ch) => s + ch.charCodeAt(0), 0)
  const fakeSeries = Array.from({ length: 12 }, (_, i) =>
    Math.max(1, (p.eventCount7d / 12) * (0.5 + 1.0 * Math.abs(Math.sin(i * 1.2 + seed))))
  )
  const sparkFrom = p.healthScore >= 80 ? "#34d399" : p.healthScore >= 60 ? "#fbbf24" : "#f87171"
  const sparkTo = p.healthScore >= 80 ? "#10b981" : p.healthScore >= 60 ? "#f59e0b" : "#ef4444"

  return (
    <Link href={`/dashboard/products/${p.productId}`} className="sl-card sl-card-hover block p-6">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-2">
            <ProductIcon id={p.productId} />
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-semibold tracking-tight">{p.name}</h3>
              <p className="sl-mono mt-0.5 text-[10px] text-text-tertiary">{p.productId}</p>
            </div>
          </div>
          {p.ownerTeam && (
            <p className="text-[11px] text-text-tertiary">{p.ownerTeam}</p>
          )}

          <div className="mt-5 flex items-end justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums">{p.eventCount24h}</span>
                <span className="text-[11px] text-text-tertiary">events / 24h</span>
              </div>
              <div className="mt-2">
                <Sparkline values={fakeSeries} gradientFrom={sparkFrom} gradientTo={sparkTo} width={200} height={36} />
              </div>
              <p className="mt-1 text-[10px] uppercase tracking-wider text-text-tertiary">7d activity</p>
            </div>
          </div>
        </div>

        <HealthRing score={p.healthScore} />
      </div>

      <div className="sl-divider mt-5" />

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Metric
          icon={<IconThumbsDown size={11} />}
          label="差评率"
          value={`${(p.thumbsDownRate24h * 100).toFixed(0)}%`}
          tone={p.thumbsDownRate24h > 0.1 ? "warn" : undefined}
        />
        <Metric
          icon={<IconBrain size={11} />}
          label="幻觉"
          value={p.hallucinationCount24h.toString()}
          tone={p.hallucinationCount24h > 0 ? "warn" : undefined}
        />
        <Metric
          icon={<IconHeart size={11} />}
          label="平均分"
          value={p.avgOverall !== null ? p.avgOverall.toFixed(2) : "—"}
        />
      </div>
    </Link>
  )
}

function ProductIcon({ id }: { id: string }) {
  // Hash id → pick a gradient
  const seed = id.split("").reduce((s, ch) => s + ch.charCodeAt(0), 0)
  const palettes = [
    { from: "#a78bfa", to: "#818cf8" },
    { from: "#34d399", to: "#10b981" },
    { from: "#60a5fa", to: "#34d399" },
    { from: "#fbbf24", to: "#f59e0b" },
  ]
  const p = palettes[seed % palettes.length]
  const initial = id.charAt(0).toUpperCase()

  return (
    <div
      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold text-bg-base"
      style={{ background: `linear-gradient(135deg, ${p.from}, ${p.to})` }}
    >
      {initial}
    </div>
  )
}

function Metric({
  icon,
  label,
  value,
  tone,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  tone?: "warn" | "crit"
}) {
  const color = tone === "warn" ? "text-amber-400" : tone === "crit" ? "text-red-400" : "text-text-primary"
  return (
    <div>
      <div className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-text-tertiary">
        {icon}
        {label}
      </div>
      <div className={`mt-1 font-medium tabular-nums ${color}`}>{value}</div>
    </div>
  )
}

// ============================================================================
// Event table
// ============================================================================

function EventTable({ events }: { events: EventSummary[] }) {
  if (events.length === 0) {
    return (
      <div className="sl-card sl-dots p-12 text-center text-sm text-text-secondary">还没有事件</div>
    )
  }
  return (
    <div className="sl-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b border-border-soft bg-bg-elev-2/40 text-left text-[10px] font-medium uppercase tracking-[0.18em] text-text-tertiary">
          <tr>
            <th className="px-5 py-3">时间</th>
            <th className="px-5 py-3">产品</th>
            <th className="px-5 py-3">用户输入</th>
            <th className="px-5 py-3">评分</th>
            <th className="px-5 py-3">Tags</th>
            <th className="px-5 py-3">反馈</th>
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {events.map((e, i) => (
            <tr
              key={e.id}
              className={`group border-t border-border-soft transition-colors hover:bg-bg-elev-2/60 ${
                i === 0 ? "bg-accent-from/[0.025]" : ""
              }`}
            >
              <td className="px-5 py-3.5 align-top">
                <div className="inline-flex items-center gap-1.5 text-[11px] text-text-tertiary whitespace-nowrap tabular-nums">
                  <IconClock size={10} />
                  {new Date(e.createdAt).toLocaleString("zh-CN", { hour12: false })}
                </div>
              </td>
              <td className="px-5 py-3.5 align-top">
                <Link
                  href={`/dashboard/products/${e.productId}`}
                  className="inline-flex items-center gap-2 transition hover:opacity-80"
                >
                  <ProductIcon id={e.productId} />
                  <code className="sl-mono text-[11px] text-text-secondary">{e.productId}</code>
                </Link>
              </td>
              <td className="px-5 py-3.5 align-top">
                <Link href={`/dashboard/events/${e.id}`} className="block hover:text-accent-from">
                  <div className="max-w-md truncate" title={e.inputMessage ?? ""}>
                    {e.inputMessage ?? <span className="text-text-tertiary">—</span>}
                  </div>
                  {e.outputMessage && (
                    <div className="mt-1 max-w-md truncate text-[11px] text-text-tertiary" title={e.outputMessage}>
                      → {e.outputMessage}
                    </div>
                  )}
                </Link>
              </td>
              <td className="px-5 py-3.5 align-top">
                <ScoreChip score={e.overallScore} />
              </td>
              <td className="px-5 py-3.5 align-top">
                <div className="flex flex-wrap gap-1">
                  {e.tags.map((t) => (
                    <Tag key={t} t={t} />
                  ))}
                </div>
              </td>
              <td className="px-5 py-3.5 align-top">
                {e.rating === "up" && <IconThumbsUp size={14} className="text-emerald-400" />}
                {e.rating === "down" && <IconThumbsDown size={14} className="text-red-400" />}
                {!e.rating && <span className="text-text-quaternary">—</span>}
              </td>
              <td className="px-5 py-3.5 align-top">
                <Link
                  href={`/dashboard/events/${e.id}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border-soft bg-bg-elev-2 px-2 py-1 text-[10px] text-text-tertiary opacity-0 transition group-hover:opacity-100 hover:border-border hover:text-text-primary"
                >
                  详情
                  <IconArrowRight size={9} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ScoreChip({ score, large = false }: { score: number | null; large?: boolean }) {
  if (score === null) {
    return (
      <span className={`sl-pill border-border-soft bg-bg-elev-2 text-text-tertiary ${large ? "text-xs" : ""}`}>
        未评
      </span>
    )
  }
  const tone =
    score >= 4
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : score >= 3
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
  const sizeClass = large ? "h-10 w-10 text-base" : "h-7 w-7 text-xs"
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-semibold tabular-nums ${sizeClass} ${tone}`}
    >
      {score}
    </span>
  )
}

function Tag({ t }: { t: string }) {
  const tone =
    t === "good"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : t === "hallucination" || t.includes("safety")
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : t.includes("too_long") || t.includes("too_short")
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : t.includes("multilingual") || t.includes("wrong_lookup")
            ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
            : "border-border bg-bg-elev-2 text-text-secondary"
  const icon =
    t === "good" ? <IconCheck size={9} /> :
    t === "hallucination" ? <IconBrain size={9} /> :
    t.includes("safety") ? <IconShield size={9} /> :
    null

  return (
    <span className={`sl-pill ${tone}`}>
      {icon}
      {t}
    </span>
  )
}

// ============================================================================
// Footer
// ============================================================================

function Footer() {
  return (
    <footer className="border-t border-border-soft py-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 text-[11px] text-text-tertiary">
        <div className="flex items-center gap-2">
          <BrandMark size={16} />
          <span>SmartLoop · Open-source AI quality platform · MIT licensed</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            All systems operational
          </span>
          <span className="sl-mono">{new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>
    </footer>
  )
}
