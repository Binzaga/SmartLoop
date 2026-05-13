/**
 * SmartLoop Node.js SDK
 *
 * Tiny client library for AI products to report quality events.
 * Designed to be non-blocking: failures never throw into the host app.
 */

export interface SmartLoopOptions {
  apiKey: string
  product: string
  endpoint: string
  /** Max events to buffer before forcing a flush. Default 50. */
  batchSize?: number
  /** Flush interval in ms. Default 5000. */
  flushIntervalMs?: number
  /** Hooks for visibility into SDK internals (testing/debug). */
  onError?: (err: Error, context: { phase: string; size?: number }) => void
}

export interface ToolCallRecord {
  name: string
  input?: unknown
  output?: unknown
  latencyMs?: number
  success?: boolean
  errorMessage?: string
}

export interface LogEventPayload {
  conversationId?: string
  userIdHash?: string
  parentEventId?: string
  input?: string | null
  output?: string | null
  model?: string
  promptVersion?: string
  tokens?: { input?: number; output?: number; cacheHit?: number }
  costUsd?: number
  latencyMs?: number
  toolsCalled?: ToolCallRecord[]
  status?: "success" | "error" | "timeout"
  errorMessage?: string
  language?: string
  metadata?: Record<string, unknown>
}

export interface FeedbackPayload {
  eventId: string
  rating: "up" | "down" | "neutral"
  reasons?: string[]
  comment?: string
  userIdHash?: string
}

export class SmartLoop {
  private buffer: LogEventPayload[] = []
  private flushing = false
  private timer: ReturnType<typeof setInterval> | null = null

  constructor(private readonly opts: SmartLoopOptions) {
    if (!opts.apiKey) throw new Error("[smartloop] apiKey is required")
    if (!opts.product) throw new Error("[smartloop] product is required")
    if (!opts.endpoint) throw new Error("[smartloop] endpoint is required")
    this.startTimer()
  }

  /** Synchronous-feel API to log a complete event. Returns immediately. */
  log(payload: LogEventPayload): void {
    this.buffer.push(payload)
    if (this.buffer.length >= (this.opts.batchSize ?? 50)) {
      // fire-and-forget; errors absorbed by flush()
      void this.flush()
    }
  }

  /** Start a session for multi-step tracking; complete() pushes the event. */
  startSession(initial: { conversationId?: string; userIdHash?: string; input?: string }) {
    const sl = this
    const startedAt = Date.now()
    const toolsCalled: ToolCallRecord[] = []
    let promptVersion: string | undefined
    let model: string | undefined

    return {
      recordToolCall(call: ToolCallRecord) {
        toolsCalled.push(call)
      },
      setModel(m: string) {
        model = m
      },
      setPromptVersion(v: string) {
        promptVersion = v
      },
      async complete(final: {
        output: string
        model?: string
        promptVersion?: string
        tokens?: LogEventPayload["tokens"]
        costUsd?: number
        metadata?: Record<string, unknown>
      }) {
        sl.log({
          conversationId: initial.conversationId,
          userIdHash: initial.userIdHash,
          input: initial.input,
          output: final.output,
          model: final.model ?? model,
          promptVersion: final.promptVersion ?? promptVersion,
          tokens: final.tokens,
          costUsd: final.costUsd,
          latencyMs: Date.now() - startedAt,
          toolsCalled,
          status: "success",
          metadata: final.metadata,
        })
      },
      async fail(err: { error: string; metadata?: Record<string, unknown> }) {
        sl.log({
          conversationId: initial.conversationId,
          userIdHash: initial.userIdHash,
          input: initial.input,
          latencyMs: Date.now() - startedAt,
          toolsCalled,
          status: "error",
          errorMessage: err.error,
          metadata: err.metadata,
        })
      },
    }
  }

  /** Send user feedback (👍/👎/comment) attached to a previous event. */
  async feedback(payload: FeedbackPayload): Promise<void> {
    const url = `${this.opts.endpoint.replace(/\/$/, "")}/v1/events/${payload.eventId}/feedback`
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-smartloop-key": this.opts.apiKey,
        },
        body: JSON.stringify({
          rating: payload.rating,
          reasons: payload.reasons,
          comment: payload.comment,
          userIdHash: payload.userIdHash,
        }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        this.opts.onError?.(new Error(`feedback failed: ${res.status} ${body}`), { phase: "feedback" })
      }
    } catch (err) {
      this.opts.onError?.(err as Error, { phase: "feedback" })
    }
  }

  /** Force-flush any buffered events. Safe to call at process exit. */
  async flush(): Promise<void> {
    if (this.flushing) return
    if (this.buffer.length === 0) return
    this.flushing = true
    const batch = this.buffer.splice(0, this.buffer.length)
    try {
      const res = await fetch(`${this.opts.endpoint.replace(/\/$/, "")}/v1/events/batch`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-smartloop-key": this.opts.apiKey,
        },
        body: JSON.stringify({ events: batch }),
      })
      if (!res.ok) {
        const body = await res.text().catch(() => "")
        this.opts.onError?.(new Error(`flush failed: ${res.status} ${body}`), {
          phase: "flush",
          size: batch.length,
        })
        // Drop events on hard failure (MVP). v0.2 will retry to local file.
      }
    } catch (err) {
      this.opts.onError?.(err as Error, { phase: "flush", size: batch.length })
    } finally {
      this.flushing = false
    }
  }

  /** Stop the auto-flush timer (e.g. before process exit). */
  async shutdown(): Promise<void> {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    await this.flush()
  }

  private startTimer() {
    const interval = this.opts.flushIntervalMs ?? 5000
    this.timer = setInterval(() => void this.flush(), interval)
    // Don't keep the event loop alive just for flushing
    if (typeof this.timer === "object" && this.timer && "unref" in this.timer) {
      ;(this.timer as unknown as { unref: () => void }).unref()
    }
  }
}

export default SmartLoop
