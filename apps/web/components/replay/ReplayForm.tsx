"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight } from "@/components/icons"

interface SourceMeta {
  type: "cluster" | "event_ids" | "recent"
  clusterId?: string
  clusterName?: string
  eventIds?: string[]
  hours?: number
}

export function ReplayForm({
  productId,
  defaultName,
  defaultSource,
}: {
  productId: string
  defaultName?: string
  defaultSource: SourceMeta
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState(defaultName ?? "")
  const [newPrompt, setNewPrompt] = useState("")
  const [model, setModel] = useState("qwen3.5-plus")
  const [sourceType, setSourceType] = useState<"cluster" | "recent">(
    defaultSource.type === "recent" ? "recent" : "cluster",
  )
  const [recentHours, setRecentHours] = useState(24)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (newPrompt.trim().length < 10) {
      setError("Prompt must be at least 10 characters.")
      return
    }
    if (!name.trim()) {
      setError("Give this replay a name (e.g. 'v3.3 stricter grounding').")
      return
    }

    const sourceRef: Record<string, unknown> =
      sourceType === "cluster"
        ? { clusterId: defaultSource.clusterId }
        : defaultSource.type === "event_ids"
          ? { eventIds: defaultSource.eventIds }
          : { hours: recentHours, onlyBad: true }

    const finalSourceType = defaultSource.type === "event_ids" ? "event_ids" : sourceType

    startTransition(async () => {
      const res = await fetch("/admin/replay/start", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          name,
          newPrompt,
          model,
          sourceType: finalSourceType,
          sourceRef,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Failed to start replay")
        return
      }
      router.push(`/dashboard/replays/${data.runId}`)
    })
  }

  const canSwitchSource =
    defaultSource.type !== "event_ids" // event_ids replays are pre-bound

  return (
    <form onSubmit={submit} className="space-y-5">
      <FieldGroup label="Replay name" hint="Use a label like 'v3.3 fix hallucination' so you can find this run later.">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="v3.3 — stricter grounding"
          required
          className="w-full rounded-lg border border-border-soft bg-bg-elev-2 px-3 py-2 text-sm placeholder:text-text-quaternary focus:border-border-strong focus:outline-none"
        />
      </FieldGroup>

      <FieldGroup label="Source events">
        {defaultSource.type === "cluster" ? (
          <div className="rounded-lg border border-border-soft bg-bg-elev-2/60 p-3 text-sm">
            Cluster:{" "}
            <span className="font-medium">{defaultSource.clusterName ?? "(unnamed)"}</span>{" "}
            <span className="text-text-tertiary">— all events in this cluster will be replayed.</span>
          </div>
        ) : defaultSource.type === "event_ids" ? (
          <div className="rounded-lg border border-border-soft bg-bg-elev-2/60 p-3 text-sm">
            {defaultSource.eventIds?.length ?? 0} specific event
            {(defaultSource.eventIds?.length ?? 0) !== 1 ? "s" : ""} selected.
          </div>
        ) : (
          <div className="space-y-3 rounded-lg border border-border-soft bg-bg-elev-2/60 p-3">
            <p className="text-sm">Recent low-score events (score ≤ 3) from the last:</p>
            <div className="flex flex-wrap gap-2">
              {[6, 24, 72, 168].map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setRecentHours(h)}
                  className={`rounded-md border px-3 py-1 text-xs ${
                    recentHours === h
                      ? "border-accent-from/40 bg-accent-from/10 text-accent-from"
                      : "border-border-soft bg-bg-elev-3 text-text-secondary hover:border-border"
                  }`}
                >
                  {h <= 24 ? `${h}h` : `${h / 24}d`}
                </button>
              ))}
            </div>
          </div>
        )}
      </FieldGroup>

      <FieldGroup label="Model" hint="The model that will generate the new outputs. Defaults to your primary.">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full appearance-none rounded-lg border border-border-soft bg-bg-elev-2 px-3 py-2 text-sm focus:border-border-strong focus:outline-none"
        >
          <option value="qwen3.5-plus">qwen3.5-plus (default)</option>
          <option value="qwen3-max">qwen3-max</option>
        </select>
      </FieldGroup>

      <FieldGroup
        label="New system prompt"
        hint="The prompt you want to test. Each event's original user input will be replayed against this."
      >
        <textarea
          value={newPrompt}
          onChange={(e) => setNewPrompt(e.target.value)}
          rows={10}
          required
          placeholder={`You are a helpful customer-service AI.\n\nCore rules:\n- Only answer based on context I provide or tool output.\n- If you don't have grounded info, reply "I need more context to answer".\n- Never invent customer names, order IDs, or numbers.`}
          className="sl-mono w-full resize-y rounded-lg border border-border-soft bg-bg-elev-2 px-3 py-2 text-[13px] leading-relaxed placeholder:text-text-quaternary focus:border-border-strong focus:outline-none"
        />
        <p className="mt-1.5 text-[11px] text-text-tertiary">{newPrompt.length} characters</p>
      </FieldGroup>

      {error && (
        <p className="rounded-md border border-red-500/30 bg-red-500/[0.05] px-3 py-2 text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-border-soft bg-bg-elev-1 px-4 py-2 text-sm text-text-secondary hover:border-border"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to px-5 py-2 text-sm font-medium text-bg-base disabled:opacity-50"
        >
          {pending ? "Queueing…" : "Start replay"}
          <IconArrowRight size={14} />
        </button>
      </div>
    </form>
  )
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] uppercase tracking-widest text-text-tertiary">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-text-tertiary">{hint}</p>}
    </div>
  )
}
