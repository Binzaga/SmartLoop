import { adminFetch } from "@/lib/api"
import { BrandMark } from "@/components/BrandMark"
import { ReplayForm } from "@/components/replay/ReplayForm"
import { notFound } from "next/navigation"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface ProductDetail {
  product: { id: string; name: string }
  clusters?: Array<{ id: string; name: string; eventCount24h: number; eventCount7d: number }>
}

export default async function NewReplayPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ source?: string; clusterId?: string; clusterName?: string; name?: string }>
}) {
  const { id } = await props.params
  const sp = await props.searchParams

  let data: ProductDetail | undefined
  try {
    data = await adminFetch<ProductDetail>(`/admin/dashboard/products/${encodeURIComponent(id)}`)
  } catch {
    notFound()
  }
  if (!data) notFound()

  const sourceType =
    sp.source === "recent" || sp.source === "event_ids" || sp.source === "cluster"
      ? sp.source
      : sp.clusterId
        ? "cluster"
        : "recent"

  const clusterName =
    sp.clusterName ??
    data.clusters?.find((c) => c.id === sp.clusterId)?.name ??
    undefined

  return (
    <>
      <header className="sl-glass sticky top-0 z-30 border-b border-border-soft">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <BrandMark size={28} />
              <span className="text-[17px] font-semibold tracking-tight">SmartLoop</span>
            </Link>
            <span className="text-text-quaternary">/</span>
            <Link href={`/dashboard/products/${id}`} className="text-sm text-text-secondary hover:text-text-primary">
              {data.product.name}
            </Link>
            <span className="text-text-quaternary">/</span>
            <span className="text-sm text-text-secondary">New replay</span>
          </div>
          <Link
            href={`/dashboard/products/${id}/replays`}
            className="text-xs text-text-tertiary hover:text-text-primary"
          >
            ← All replays
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-accent-from">Replay sandbox</p>
          <h1 className="text-3xl font-semibold tracking-tight">Test a new prompt</h1>
          <p className="mt-2 text-sm text-text-secondary">
            We'll re-run a set of historical events through your new prompt + the chosen model,
            re-score the outputs, and show you a side-by-side comparison.
          </p>
        </div>

        <div className="sl-card p-6">
          <ReplayForm
            productId={id}
            defaultName={sp.name}
            defaultSource={{
              type: sourceType as "cluster" | "recent" | "event_ids",
              clusterId: sp.clusterId,
              clusterName,
            }}
          />
        </div>

        <p className="mt-6 text-center text-[11px] text-text-tertiary">
          Each replay event costs ~1 generation + 1 judge call. Be reasonable with batch sizes.
        </p>
      </main>
    </>
  )
}
