import { adminFetch } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import {
  IconAlert,
  IconArrowRight,
  IconBolt,
  IconBrain,
  IconCheck,
  IconClock,
  IconHeart,
  IconShield,
  IconThumbsDown,
  IconThumbsUp,
} from "@/components/icons"
import Link from "next/link"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

interface EventDetail {
  event: {
    id: string
    productId: string
    productName: string
    productOwnerTeam: string | null
    conversationId: string | null
    userIdHash: string | null
    inputMessage: string | null
    outputMessage: string | null
    model: string | null
    promptVersionLabel: string | null
    tokensInput: number
    tokensOutput: number
    costUsd: number | null
    latencyMs: number
    toolsCalled: Array<{
      name: string
      input?: unknown
      output?: unknown
      latencyMs?: number
      success?: boolean
      errorMessage?: string
    }>
    scores: {
      overall?: number
      accuracy?: { score: number; reasoning: string }
      helpfulness?: { score: number; reasoning: string }
      safety?: { score: number; reasoning: string }
      style?: { score: number; reasoning: string }
      tags?: string[]
      _error?: string
    } | null
    judgeReasoning: string | null
    status: string
    errorMessage: string | null
    language: string | null
    metadata: Record<string, unknown>
    createdAt: string
  }
  feedback: Array<{
    id: string
    rating: "up" | "down" | "neutral"
    reasons: string[]
    comment: string | null
    createdAt: string
  }>
  relatedEvents: Array<{
    id: string
    inputMessage: string | null
    outputMessage: string | null
    score: number | null
    createdAt: string
  }>
}

export default async function EventDetail(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  let data: EventDetail | undefined
  try {
    data = await adminFetch<EventDetail>(`/admin/dashboard/events/${encodeURIComponent(id)}`)
  } catch (err) {
    if (`${err}`.includes("404")) notFound()
    throw err
  }
  if (!data) notFound()

  const { event, feedback, relatedEvents } = data
  const scores = event.scores ?? null
  const overall = scores?.overall ?? null
  const tags = scores?.tags ?? []

  return (
    <>
      <DashboardNav productId={event.productId} productName={event.productName} />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <Breadcrumb productId={event.productId} productName={event.productName} />

        <header className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Event detail</h1>
            <code className="sl-mono rounded bg-bg-elev-2 px-2 py-0.5 text-[11px] text-text-tertiary">
              {event.id.slice(0, 8)}…
            </code>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-text-tertiary">
            <span className="inline-flex items-center gap-1.5">
              <IconClock size={11} />
              {new Date(event.createdAt).toLocaleString("zh-CN", { hour12: false })}
            </span>
            {event.model && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <IconBrain size={11} />
                  {event.model}
                </span>
              </>
            )}
            {event.promptVersionLabel && (
              <>
                <span>·</span>
                <code className="sl-mono">{event.promptVersionLabel}</code>
              </>
            )}
            {event.language && (
              <>
                <span>·</span>
                <span>{event.language}</span>
              </>
            )}
            {event.status !== "success" && (
              <>
                <span>·</span>
                <span className="inline-flex items-center gap-1 text-red-400">
                  <IconAlert size={11} />
                  {event.status}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Input / Output side-by-side */}
        <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="sl-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary">User input</p>
              {event.conversationId && (
                <code className="sl-mono text-[10px] text-text-tertiary">
                  conv {event.conversationId.slice(0, 8)}…
                </code>
              )}
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
              {event.inputMessage ?? <span className="text-text-tertiary">(empty)</span>}
            </pre>
          </div>
          <div className="sl-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary">AI output</p>
              {overall !== null && (
                <ScoreChip score={overall} />
              )}
            </div>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
              {event.outputMessage ?? <span className="text-text-tertiary">(empty)</span>}
            </pre>
          </div>
        </section>

        {/* Performance */}
        <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <PerfTile label="Latency" value={`${event.latencyMs}ms`} />
          <PerfTile label="Tokens in" value={event.tokensInput.toLocaleString()} />
          <PerfTile label="Tokens out" value={event.tokensOutput.toLocaleString()} />
          <PerfTile label="Cost" value={event.costUsd !== null ? `$${event.costUsd.toFixed(4)}` : "—"} />
        </section>

        {/* Tool calls timeline */}
        {event.toolsCalled.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 inline-flex items-center gap-2 border-b border-border-soft pb-2 text-base font-semibold tracking-tight">
              <IconBolt size={14} className="text-accent-from" />
              Tool calls ({event.toolsCalled.length})
            </h2>
            <div className="sl-card overflow-hidden">
              <ol className="divide-y divide-border-soft">
                {event.toolsCalled.map((tc, i) => (
                  <li key={i} className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-elev-2 text-[10px] tabular-nums text-text-secondary">
                          {i + 1}
                        </span>
                        <code className="sl-mono text-sm">{tc.name}</code>
                        {tc.success !== false ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                            <IconCheck size={10} />
                            success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">
                            <IconAlert size={10} />
                            failed
                          </span>
                        )}
                      </div>
                      {typeof tc.latencyMs === "number" && (
                        <span className="text-[11px] tabular-nums text-text-tertiary">{tc.latencyMs}ms</span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <details className="rounded-lg bg-bg-elev-2/60 p-3 text-xs">
                        <summary className="cursor-pointer text-text-tertiary">Input</summary>
                        <pre className="sl-mono mt-2 overflow-x-auto text-[11px] text-text-secondary">
                          {JSON.stringify(tc.input, null, 2)}
                        </pre>
                      </details>
                      <details className="rounded-lg bg-bg-elev-2/60 p-3 text-xs">
                        <summary className="cursor-pointer text-text-tertiary">Output</summary>
                        <pre className="sl-mono mt-2 overflow-x-auto text-[11px] text-text-secondary">
                          {JSON.stringify(tc.output, null, 2)}
                        </pre>
                      </details>
                    </div>
                    {tc.errorMessage && (
                      <p className="mt-2 text-[11px] text-red-400">{tc.errorMessage}</p>
                    )}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* Judge scores */}
        {scores && !scores._error && (
          <section className="mb-8">
            <h2 className="mb-3 inline-flex items-center gap-2 border-b border-border-soft pb-2 text-base font-semibold tracking-tight">
              <IconBrain size={14} className="text-accent-from" />
              LLM-as-Judge breakdown
            </h2>
            <div className="sl-card p-6">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <ScoreDimension dim="accuracy" label="Accuracy" icon={<IconCheck size={12} />} data={scores.accuracy} />
                <ScoreDimension dim="helpfulness" label="Helpfulness" icon={<IconHeart size={12} />} data={scores.helpfulness} />
                <ScoreDimension dim="safety" label="Safety" icon={<IconShield size={12} />} data={scores.safety} />
                <ScoreDimension dim="style" label="Style" icon={<IconBolt size={12} />} data={scores.style} />
              </div>

              {tags.length > 0 && (
                <div className="mt-6 border-t border-border-soft pt-5">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-text-tertiary">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <Tag key={t} t={t} />
                    ))}
                  </div>
                </div>
              )}

              {event.judgeReasoning && (
                <details className="mt-5 rounded-lg bg-bg-elev-2/40 p-4 text-xs">
                  <summary className="cursor-pointer text-text-tertiary">Raw judge reasoning</summary>
                  <pre className="sl-mono mt-3 whitespace-pre-wrap text-[11px] text-text-secondary">
                    {event.judgeReasoning}
                  </pre>
                </details>
              )}
            </div>
          </section>
        )}

        {scores?._error && (
          <section className="mb-8">
            <div className="sl-card border-red-500/30 p-5 text-sm text-red-300">
              <div className="font-semibold">Judge failed</div>
              <div className="sl-mono mt-1 text-xs text-red-200/70">{scores._error}</div>
            </div>
          </section>
        )}

        {/* User feedback */}
        {feedback.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 inline-flex items-center gap-2 border-b border-border-soft pb-2 text-base font-semibold tracking-tight">
              <IconThumbsDown size={14} className="text-accent-from" />
              User feedback
            </h2>
            <div className="space-y-3">
              {feedback.map((f) => (
                <div key={f.id} className="sl-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2">
                      {f.rating === "up" ? (
                        <IconThumbsUp size={14} className="text-emerald-400" />
                      ) : (
                        <IconThumbsDown size={14} className="text-red-400" />
                      )}
                      <span className="text-sm">
                        {f.rating === "up" ? "Positive" : f.rating === "down" ? "Negative" : "Neutral"}
                      </span>
                    </span>
                    <span className="text-[11px] text-text-tertiary">
                      {new Date(f.createdAt).toLocaleString("zh-CN", { hour12: false })}
                    </span>
                  </div>
                  {f.reasons.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {f.reasons.map((r) => (
                        <Tag key={r} t={r} />
                      ))}
                    </div>
                  )}
                  {f.comment && (
                    <p className="mt-3 text-sm text-text-secondary">"{f.comment}"</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related events */}
        {relatedEvents.length > 0 && (
          <section>
            <h2 className="mb-3 inline-flex items-center gap-2 border-b border-border-soft pb-2 text-base font-semibold tracking-tight">
              Same conversation
            </h2>
            <div className="space-y-2">
              {relatedEvents.map((e) => (
                <Link
                  key={e.id}
                  href={`/dashboard/events/${e.id}`}
                  className="sl-card sl-card-hover block p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm" title={e.inputMessage ?? ""}>
                        {e.inputMessage ?? <span className="text-text-tertiary">—</span>}
                      </p>
                      {e.outputMessage && (
                        <p className="mt-1 truncate text-[11px] text-text-tertiary" title={e.outputMessage}>
                          → {e.outputMessage}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <ScoreChip score={e.score} />
                      <IconArrowRight size={12} className="text-text-tertiary" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  )
}

function DashboardNav({ productId, productName }: { productId: string; productName: string }) {
  return (
    <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <BrandMark size={28} />
            <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
          </Link>
          <span className="text-text-quaternary">/</span>
          <Link href={`/dashboard/products/${productId}`} className="text-sm text-text-secondary hover:text-text-primary">
            {productName}
          </Link>
        </div>
        <Link
          href={`/dashboard/products/${productId}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border-soft bg-bg-elev-1 px-3 py-1.5 text-xs text-text-secondary hover:border-border"
        >
          ← Back
        </Link>
      </div>
    </header>
  )
}

function Breadcrumb({ productId, productName }: { productId: string; productName: string }) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-xs text-text-tertiary">
      <Link href="/dashboard" className="hover:text-text-primary">Dashboard</Link>
      <span>/</span>
      <Link href={`/dashboard/products/${productId}`} className="hover:text-text-primary">{productName}</Link>
      <span>/</span>
      <span className="text-text-secondary">Event</span>
    </nav>
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

function PerfTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="sl-card p-4">
      <p className="text-[10px] uppercase tracking-widest text-text-tertiary">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function ScoreDimension({
  label,
  icon,
  data,
}: {
  dim: string
  label: string
  icon: React.ReactNode
  data: { score: number; reasoning: string } | undefined
}) {
  const score = data?.score ?? 0
  const pct = (score / 5) * 100
  const tone = score >= 4 ? "from-emerald-500 to-emerald-400" : score >= 3 ? "from-amber-500 to-amber-400" : "from-red-500 to-red-400"
  const textTone = score >= 4 ? "text-emerald-300" : score >= 3 ? "text-amber-300" : "text-red-300"
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
          {icon}
          {label}
        </p>
        <span className={`text-xl font-semibold tabular-nums ${textTone}`}>{score}</span>
      </div>
      <div className="mb-2 relative overflow-hidden rounded-full bg-bg-elev-3" style={{ height: 6 }}>
        <div className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${tone}`} style={{ width: `${pct}%` }} />
      </div>
      {data?.reasoning && (
        <p className="text-[11px] leading-relaxed text-text-tertiary">{data.reasoning}</p>
      )}
    </div>
  )
}

const TAG_LABELS: Record<string, string> = {
  hallucination: "Hallucination",
  too_long: "Too long",
  too_short: "Too short",
  off_topic: "Off topic",
  format_violation: "Format violation",
  safety_violation: "Safety violation",
  multilingual_drift: "Multilingual drift",
  wrong_lookup: "Wrong tool result",
  good: "Good",
}

function Tag({ t }: { t: string }) {
  const tone =
    t === "good"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
      : t === "hallucination" || t.includes("safety")
        ? "border-red-500/30 bg-red-500/10 text-red-300"
        : t.includes("too_") || t.includes("format") || t.includes("off_")
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : "border-indigo-500/30 bg-indigo-500/10 text-indigo-300"
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${tone}`}>
      {TAG_LABELS[t] ?? t}
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
