# @smartloop/sdk

Node/Bun client SDK for SmartLoop.

## Quick start

```ts
import { SmartLoop } from "@smartloop/sdk"

const sl = new SmartLoop({
  apiKey: process.env.SMARTLOOP_API_KEY!,
  product: "my-agent",
  endpoint: "http://localhost:8080",
})

sl.log({
  input: "昨天哪些会话没回复？",
  output: "昨天有 12 条会话未回复...",
  model: "qwen-plus",
  promptVersion: "v3.2",
  tokens: { input: 2100, output: 350 },
  latencyMs: 1840,
})

// Before process exit:
await sl.shutdown()
```

## Session mode (recommended for tool-calling agents)

```ts
const session = sl.startSession({
  conversationId: "conv_abc",
  userIdHash: "user_123_hashed",
  input: "昨天哪些会话没回复？",
})

session.recordToolCall({
  name: "query_sessions",
  input: { reply_status: 1 },
  output: { count: 12 },
  latencyMs: 240,
  success: true,
})

await session.complete({
  output: "昨天有 12 条会话未回复",
  model: "qwen-plus",
  promptVersion: "v3.2",
  tokens: { input: 2100, output: 350 },
})
```

## Attach feedback

```ts
await sl.feedback({
  eventId: "uuid-from-event",
  rating: "down",
  reasons: ["hallucination"],
  comment: "说有 12 条但其实是 8 条",
})
```

## Non-blocking guarantees

- `log()` returns immediately; events are batched
- Network failures absorbed silently unless `onError` is set
- Flush happens every 5 seconds OR when batch reaches 50 events
- `shutdown()` flushes remaining events
