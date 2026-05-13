/**
 * Smoke test for the SDK against a locally-running SmartLoop API.
 * Run: bun run packages/sdk-node/test-sdk.ts
 */
import { SmartLoop } from "./src/index.ts"

const API_KEY = process.env.SMARTLOOP_API_KEY
const ENDPOINT = process.env.SMARTLOOP_ENDPOINT ?? "http://localhost:8088"

if (!API_KEY) {
  console.error("Set SMARTLOOP_API_KEY env var to a real product key first.")
  process.exit(1)
}

const sl = new SmartLoop({
  apiKey: API_KEY,
  product: "crm-claw",
  endpoint: ENDPOINT,
  flushIntervalMs: 1000,
  onError: (err, ctx) => console.error("[sdk error]", ctx.phase, err.message),
})

console.log("=== Test 1: simple log ===")
sl.log({
  input: "(SDK test) 昨天哪些会话没回复？",
  output: "(SDK test) 昨天有 12 条会话未回复...",
  model: "qwen-plus",
  promptVersion: "v3.2",
  tokens: { input: 2100, output: 350 },
  latencyMs: 1840,
  language: "zh-CN",
})

console.log("=== Test 2: session-based ===")
const session = sl.startSession({
  conversationId: "sdk_conv_001",
  userIdHash: "user_xyz_hashed",
  input: "(SDK session) Kevin 客服今天处理了多少会话？",
})
session.recordToolCall({
  name: "query_members",
  input: { name: "Kevin" },
  output: { sys_user_id: "u_456" },
  latencyMs: 120,
  success: true,
})
session.recordToolCall({
  name: "query_sessions",
  input: { sys_user_id: "u_456" },
  output: { count: 28 },
  latencyMs: 200,
  success: true,
})
await session.complete({
  output: "Kevin 今天处理了 28 条会话",
  model: "qwen-plus",
  promptVersion: "v3.2",
  tokens: { input: 1800, output: 60 },
})

console.log("=== Forcing flush ===")
await sl.flush()
await sl.shutdown()
console.log("Done.")
