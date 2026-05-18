import { adminFetch } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import {
  IconAlert,
  IconArrowRight,
  IconBrain,
  IconCheck,
  IconClock,
} from "@/components/icons"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface ReplayResult {
  eventId: string
  oldOutput: string | null
  newOutput: string
  oldOverall: number | null
  newOverall: number
  oldTags: string[]
  newTags: string[]
  scoreDelta: number
  judgeReasoning: string
}

interface ReplayRun {
  id: string
  productId: string
  name: string
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  sourceType: "cluster" | "event_ids" | "golden_set" | "recent"
  sourceRef: Record<string, unknown>
  newPrompt: string
  newPromptLabel: string | null
  model: string
  totalEvents: number
  completedEvents: number
  improvedCount: number
  regressedCount: number
  sameCount: number
  passRateOld: number | null
  passRateNew: number | null
  results: ReplayResult[]
  error: string | null
  createdAt: string
  startedAt: string | null
  completedAt: string | null
}

export default async function ReplayDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  let data: { run: ReplayRun } | undefined
  try {
    data = await adminFetch<{ run: ReplayRun }>(`/admin/replay/${encodeURIComponent(id)}`)
  } catch (err) {
    if (`${err}`.includes("404")) notFound()
    throw err
  }
  if (!data?.run) notFound()
  const run = data.run

  const isLive = run.status === "queued" || run.status === "running"

  return (
    <>
      {isLive && <meta httpEquiv="refresh" content="5" />}
      <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <BrandMark size={28} />
              <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
            </Link>
            <span className="text-text-quaternary">/</span>
            <Link
              href={`/dashboard/products/${run.productId}`}
              className="text-sm text-text-secondary hover:text-text-primary"
            >
              {run.productId}
            </Link>
            <span className="text-text-quaternary">/</span>
            <span className="text-sm text-text-secondary">Replay</span>
          </div>
          <Link
            href={`/dashboard/products/${run.productId}/replays`}
            className="text-xs text-text-tertiary hover:text-text-primary"
          >
            ← All replays
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        {/* Hero */}
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-accent-from">
              Replay run
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">{run.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
              <StatusPill status={run.status} />
              <span>·</span>
              <code className="sl-mono">{run.model}</code>
              <span>·</span>
              <SourceLabel sourceType={run.sourceType} sourceRef={run.sourceRef} />
              <span>·</span>
              <span>Started {run.startedAt ? new Date(run.startedAt).toLocaleString("zh-CN", { hour12: false }) : "—"}</span>
            </div>
          </div>
          {run.status === "completed" && (
            <Link
              href={`/dashboard/products/${run.productId}/replays/new?name=${encodeURIComponent(run.name + " — iter")}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-4 py-2 text-sm font-medium text-bg-base"
            >
              Iterate
              <IconArrowRight size={14} />
            </Link>
          )}
        </section>

        {/* Progress / pass rate */}
        <section className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          <PassRateCard
            label="Pass rate · OLD"
            value={run.passRateOld}
            tone="muted"
          />
          <PassRateCard
            label="Pass rate · NEW"
            value={run.passRateNew}
            tone={
              run.passRateNew !== null && run.passRateOld !== null
                ? run.passRateNew > run.passRateOld
                  ? "good"
                  : run.passRateNew < run.passRateOld
                    ? "bad"
                    : "neutral"
                : "neutral"
            }
          />
          <div className="sl-card p-5">
            <p className="text-[11px] uppercase tracking-widest text-text-tertiary">Progress</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tabular-nums">
                {run.completedEvents}
              </span>
              <span className="text-sm text-text-tertiary">/ {run.totalEvents}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-elev-3">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-from to-accent-to transition-all"
                style={{
                  width: `${run.totalEvents > 0 ? (run.completedEvents / run.totalEvents) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <DeltaTile label="Improved" value={run.improvedCount} tone="good" />
              <DeltaTile label="Same" value={run.sameCount} tone="neutral" />
              <DeltaTile label="Regressed" value={run.regressedCount} tone="bad" />
            </div>
          </div>
        </section>

        {/* Error */}
        {run.error && (
          <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/[0.05] p-4 text-sm">
            <div className="font-semibold text-red-300">Replay failed</div>
            <div className="sl-mono mt-1 text-xs text-red-200/70">{run.error}</div>
          </div>
        )}

        {/* New prompt */}
        <section className="mb-8">
          <h2 className="mb-3 inline-flex items-center gap-2 border-b border-border-soft pb-2 text-base font-semibold tracking-tight">
            <IconBrain size={14} className="text-accent-from" />
            New prompt
          </h2>
          <div className="sl-card p-5">
            <pre className="sl-mono whitespace-pre-wrap text-[12px] leading-relaxed text-text-secondary">
              {run.newPrompt}
            </pre>
          </div>
        </section>

        {/* Comparison */}
        <section>
          <h2 className="mb-3 inline-flex items-center gap-2 border-b border-border-soft pb-2 text-base font-semibold tracking-tight">
            <IconCheck size={14} className="text-accent-from" />
            Event-by-event comparison
          </h2>
          {run.results.length === 0 ? (
            <div className="sl-card sl-dots p-12 text-center text-sm text-text-tertiary">
              {isLive ? "Generating + scoring outputs… check back in a few seconds." : "No results."}
            </div>
          ) : (
            <div className="space-y-4">
              {run.results.map((r, i) => (
                <ResultRow key={r.eventId} idx={i + 1} result={r} />
              ))}
            </div>
          )}
        </section>
      </main>
      <footer className="border-t border-border-soft py-6 text-center text-[11px] text-text-tertiary">
        SmartLoop · MIT licensed
      </footer>
    </>
  )
}

function PassRateCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number | null
  tone: "muted" | "good" | "bad" | "neutral"
}) {
  const color =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
        ? "text-red-400"
        : tone === "muted"
          ? "text-text-secondary"
          : "text-text-primary"
  const display = value === null ? "—" : `${Math.round(value * 100)}%`
  return (
    <div className="sl-card p-5">
      <p className="text-[11px] uppercase tracking-widest text-text-tertiary">{label}</p>
      <p className={`mt-3 text-4xl font-semibold tabular-nums tracking-tight ${color}`}>{display}</p>
      <p className="mt-1 text-[11px] text-text-tertiary">events with overall ≥ 4</p>
    </div>
  )
}

function DeltaTile({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: "good" | "bad" | "neutral"
}) {
  const color =
    tone === "good"
      ? "text-emerald-400"
      : tone === "bad"
        ? "text-red-400"
        : "text-text-secondary"
  return (
    <div>
      <p className="text-text-tertiary">{label}</p>
      <p className={`mt-0.5 font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  )
}

function StatusPill({ status }: { status: ReplayRun["status"] }) {
  const map: Record<ReplayRun["status"], { label: string; tone: string }> = {
    queued: { label: "Queued", tone: "border-text-tertiary/30 bg-text-tertiary/10 text-text-secondary" },
    running: { label: "Running", tone: "border-accent-from/30 bg-accent-from/10 text-accent-from" },
    completed: { label: "Completed", tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" },
    failed: { label: "Failed", tone: "border-red-500/30 bg-red-500/10 text-red-300" },
    cancelled: { label: "Cancelled", tone: "border-amber-500/30 bg-amber-500/10 text-amber-300" },
  }
  const m = map[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${m.tone}`}>
      {status === "running" && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="sl-pulse absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {m.label}
    </span>
  )
}

function SourceLabel({
  sourceType,
  sourceRef,
}: {
  sourceType: ReplayRun["sourceType"]
  sourceRef: Record<string, unknown>
}) {
  if (sourceType === "cluster") {
    return <span>Source: cluster <code className="sl-mono">{(sourceRef.clusterId as string)?.slice(0, 8)}…</code></span>
  }
  if (sourceType === "event_ids") {
    const ids = (sourceRef.eventIds as string[]) ?? []
    return <span>Source: {ids.length} explicit event{ids.length !== 1 ? "s" : ""}</span>
  }
  if (sourceType === "recent") {
    return <span>Source: recent {(sourceRef.hours as number) ?? 24}h bad cases</span>
  }
  return <span>Source: {sourceType}</span>
}

function ResultRow({ idx, result }: { idx: number; result: ReplayResult }) {
  const delta = result.scoreDelta
  const deltaColor =
    delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-text-tertiary"
  const deltaIcon = delta > 0 ? "↑" : delta < 0 ? "↓" : "→"

  return (
    <div className="sl-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border-soft px-5 py-3 text-xs">
        <div className="inline-flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bg-elev-3 text-[10px] tabular-nums text-text-secondary">
            {idx}
          </span>
          <code className="sl-mono text-[11px] text-text-tertiary">{result.eventId.slice(0, 8)}…</code>
          <Link
            href={`/dashboard/events/${result.eventId}`}
            className="text-[11px] text-text-tertiary hover:text-text-primary"
          >
            view event ↗
          </Link>
        </div>
        <div className="inline-flex items-center gap-2 text-[11px]">
          <ScorePill score={result.oldOverall} />
          <span className={`tabular-nums ${deltaColor}`}>{deltaIcon} {delta > 0 ? "+" : ""}{delta}</span>
          <ScorePill score={result.newOverall} />
        </div>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border-soft md:grid-cols-2 md:divide-x md:divide-y-0">
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-text-tertiary">
            <span>Old output</span>
            <TagRow tags={result.oldTags} />
          </div>
          <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
            {result.oldOutput ?? <span className="text-text-tertiary">(empty)</span>}
          </pre>
        </div>
        <div className="p-5">
          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-widest text-text-tertiary">
            <span className="text-accent-from">New output</span>
            <TagRow tags={result.newTags} />
          </div>
          <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-primary">
            {result.newOutput}
          </pre>
        </div>
      </div>

      {result.judgeReasoning && (
        <details className="border-t border-border-soft px-5 py-3 text-xs">
          <summary className="cursor-pointer text-text-tertiary">Judge reasoning (new)</summary>
          <pre className="sl-mono mt-2 whitespace-pre-wrap text-[11px] text-text-secondary">{result.judgeReasoning}</pre>
        </details>
      )}
    </div>
  )
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-[10px] text-text-tertiary">—</span>
  const tone =
    score >= 4
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : score >= 3
        ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
        : "border-red-500/30 bg-red-500/10 text-red-300"
  return (
    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold tabular-nums ${tone}`}>
      {score}
    </span>
  )
}

function TagRow({ tags }: { tags: string[] }) {
  if (!tags?.length) return null
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t) => (
        <span
          key={t}
          className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
            t === "good"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : t === "hallucination" || t.includes("safety")
                ? "border-red-500/30 bg-red-500/10 text-red-300"
                : "border-amber-500/30 bg-amber-500/10 text-amber-300"
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  )
}
