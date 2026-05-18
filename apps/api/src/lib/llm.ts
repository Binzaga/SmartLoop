import OpenAI from "openai"
import { config } from "../config"

/** Shared OpenAI-compatible client pointed at DashScope (aliyun Qwen).
 *  Timeout/retry set conservatively so a single hung call can't stall a worker. */
export const llm = new OpenAI({
  apiKey: config.DASHSCOPE_API_KEY ?? "missing",
  baseURL: config.DASHSCOPE_BASE_URL,
  timeout: 30_000, // 30s per request
  maxRetries: 1,
})

export const judgeModel = config.JUDGE_MODEL
export const primaryModel = config.PRIMARY_MODEL

/**
 * Strict JSON-only completion: forces the model to return parseable JSON
 * by using response_format and a short retry on parse failure.
 */
export async function llmJson<T = unknown>(opts: {
  model?: string
  system: string
  user: string
  maxTokens?: number
  temperature?: number
}): Promise<{ data: T; raw: string; usage?: OpenAI.CompletionUsage }> {
  const model = opts.model ?? judgeModel
  const params: OpenAI.Chat.ChatCompletionCreateParamsNonStreaming = {
    model,
    messages: [
      { role: "system", content: opts.system },
      { role: "user", content: opts.user },
    ],
    response_format: { type: "json_object" },
    temperature: opts.temperature ?? 0,
    max_tokens: opts.maxTokens ?? 800,
  }

  const r = await llm.chat.completions.create(params)
  const raw = r.choices[0]?.message?.content ?? ""
  const data = parseJsonOrThrow<T>(raw)
  return { data, raw, usage: r.usage }
}

function parseJsonOrThrow<T>(s: string): T {
  // Strip code fences if present (some models wrap json in ```json ... ```)
  const cleaned = s.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "")
  try {
    return JSON.parse(cleaned) as T
  } catch (err) {
    // Last-resort: find the first { ... } block
    const m = cleaned.match(/\{[\s\S]*\}/)
    if (m) {
      try {
        return JSON.parse(m[0]) as T
      } catch {
        // fallthrough
      }
    }
    throw new Error(`LLM returned non-JSON content: ${s.slice(0, 200)}`)
  }
}
