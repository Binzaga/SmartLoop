import { adminFetch, type ProductHealth, type EventSummary } from "@/lib/api"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function fetchOverview() {
  return adminFetch<{
    products: ProductHealth[]
    recentEvents: EventSummary[]
    totals: { events24h: number; events7d: number; productsCount: number; alertsFiring: number }
  }>("/admin/dashboard/overview")
}

export default async function Home() {
  let data
  let error: string | null = null
  try {
    data = await fetchOverview()
  } catch (err) {
    error = (err as Error).message
  }

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-semibold tracking-tight">SmartLoop</span>
            <span className="text-xs text-zinc-500">v0.1 · AI Product Quality Platform</span>
          </div>
          <nav className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500">SaleSmartly</span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="font-semibold">API 不可达</div>
            <div className="font-mono text-xs mt-1">{error}</div>
            <div className="mt-2 text-red-600">
              检查 API 是否运行: <code>curl http://localhost:8088/healthz</code>
            </div>
          </div>
        )}

        {data && (
          <>
            <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="24h 事件量" value={data.totals.events24h.toLocaleString()} />
              <Stat label="7d 事件量" value={data.totals.events7d.toLocaleString()} />
              <Stat label="接入产品数" value={data.totals.productsCount.toString()} />
              <Stat
                label="正在告警"
                value={data.totals.alertsFiring.toString()}
                tone={data.totals.alertsFiring > 0 ? "warn" : "ok"}
              />
            </section>

            <section className="mb-10">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">产品健康总览</h2>
                <span className="text-xs text-zinc-500">
                  分数 = 24h 差评率 + 幻觉率 + 平均评测分综合
                </span>
              </div>
              {data.products.length === 0 ? (
                <EmptyCard hint="还没接入任何产品。用 admin 接口创建第一个 product 即可。" />
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {data.products.map((p) => (
                    <ProductCard key={p.productId} p={p} />
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">最近事件</h2>
                <span className="text-xs text-zinc-500">最近 20 条 AI 交互</span>
              </div>
              {data.recentEvents.length === 0 ? (
                <EmptyCard hint="还没有事件。用 SDK 上报第一条试试。" />
              ) : (
                <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wider text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">时间</th>
                        <th className="px-4 py-3">产品</th>
                        <th className="px-4 py-3">用户输入</th>
                        <th className="px-4 py-3">评分</th>
                        <th className="px-4 py-3">Tags</th>
                        <th className="px-4 py-3">反馈</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.recentEvents.map((e) => (
                        <tr key={e.id} className="hover:bg-zinc-50">
                          <td className="px-4 py-3 text-xs text-zinc-500 whitespace-nowrap">
                            {new Date(e.createdAt).toLocaleString("zh-CN", { hour12: false })}
                          </td>
                          <td className="px-4 py-3">
                            <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs">
                              {e.productId}
                            </code>
                          </td>
                          <td className="px-4 py-3 max-w-md truncate" title={e.inputMessage ?? ""}>
                            {e.inputMessage ?? <span className="text-zinc-400">—</span>}
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
                            {e.rating === "up" && <span className="text-green-600">👍</span>}
                            {e.rating === "down" && <span className="text-red-600">👎</span>}
                            {!e.rating && <span className="text-zinc-300">—</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <footer className="border-t border-zinc-200 bg-white py-4 text-center text-xs text-zinc-500">
        SmartLoop · Hackathon MVP · {new Date().toLocaleDateString("zh-CN")}
      </footer>
    </main>
  )
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string
  tone?: "default" | "ok" | "warn" | "crit"
}) {
  const toneColor =
    tone === "warn"
      ? "text-amber-600"
      : tone === "crit"
        ? "text-red-600"
        : tone === "ok"
          ? "text-emerald-600"
          : "text-zinc-900"
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${toneColor}`}>{value}</div>
    </div>
  )
}

function ProductCard({ p }: { p: ProductHealth }) {
  const tone =
    p.healthScore >= 80 ? "emerald" : p.healthScore >= 60 ? "amber" : "red"
  const toneRing =
    tone === "emerald"
      ? "ring-emerald-200 bg-emerald-50"
      : tone === "amber"
        ? "ring-amber-200 bg-amber-50"
        : "ring-red-200 bg-red-50"
  const toneText =
    tone === "emerald" ? "text-emerald-700" : tone === "amber" ? "text-amber-700" : "text-red-700"
  return (
    <Link
      href={`/products/${p.productId}`}
      className="block rounded-lg border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <h3 className="truncate text-base font-semibold">{p.name}</h3>
            <code className="text-xs text-zinc-400">{p.productId}</code>
          </div>
          {p.ownerTeam && <p className="text-xs text-zinc-500">{p.ownerTeam}</p>}
        </div>
        <div
          className={`flex shrink-0 items-center justify-center rounded-full px-3 py-1 text-sm font-semibold ring-1 ${toneRing} ${toneText}`}
        >
          {p.healthScore}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
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
  const color = tone === "warn" ? "text-amber-700" : tone === "crit" ? "text-red-700" : "text-zinc-900"
  return (
    <div>
      <div className="text-zinc-500">{label}</div>
      <div className={`mt-0.5 font-medium ${color}`}>{value}</div>
    </div>
  )
}

function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span className="text-zinc-300 text-xs">未评</span>
  const tone =
    score >= 4
      ? "bg-emerald-100 text-emerald-700"
      : score >= 3
        ? "bg-amber-100 text-amber-700"
        : "bg-red-100 text-red-700"
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${tone}`}>
      {score}
    </span>
  )
}

function Tag({ t }: { t: string }) {
  const tone =
    t === "good"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : t === "hallucination"
        ? "bg-red-50 text-red-700 border-red-200"
        : t.includes("safety")
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-zinc-50 text-zinc-600 border-zinc-200"
  return (
    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${tone}`}>{t}</span>
  )
}

function EmptyCard({ hint }: { hint: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center text-sm text-zinc-500">
      {hint}
    </div>
  )
}
