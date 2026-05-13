# `@smartloop/sdk` — Node.js Client

接入只需 3 行代码。

---

## 安装

仓库内 workspace 互相引用即可。外部项目暂时需要 link:

```bash
# 在 SmartLoop 仓库内
cd packages/sdk-node
bun link

# 在你的产品仓库内
bun link @smartloop/sdk
```

未来发布 npm 后:
```bash
bun add @smartloop/sdk
```

---

## 快速上手

```ts
import { SmartLoop } from "@smartloop/sdk"

const sl = new SmartLoop({
  apiKey: process.env.SMARTLOOP_API_KEY!,
  product: "my-agent",
  endpoint: process.env.SMARTLOOP_ENDPOINT ?? "http://localhost:8088",
})

// 一次性上报
sl.log({
  input: "用户问题",
  output: "AI 回答",
  model: "qwen3.5-plus",
  promptVersion: "v3.2",
  tokens: { input: 100, output: 50 },
  latencyMs: 1200,
  language: "zh-CN",
})

// 程序退出前
await sl.shutdown()
```

---

## Session 模式(推荐)

适合多步骤 / 工具调用 / 长延迟的场景。

```ts
const session = sl.startSession({
  conversationId: "conv_abc",
  userIdHash: hashUser(user.id),
  input: userMessage,
})

try {
  const ctx = await retrieveContext(userMessage)
  session.recordToolCall({
    name: "retrieve_context",
    input: { query: userMessage },
    output: { hits: ctx.length },
    latencyMs: 200,
    success: true,
  })

  const reply = await llm.invoke(prompt, ctx)

  await session.complete({
    output: reply.text,
    model: "qwen3.5-plus",
    promptVersion: "v3.2",
    tokens: reply.tokens,
    costUsd: reply.costUsd,
  })
} catch (err) {
  await session.fail({
    error: (err as Error).message,
    metadata: { stage: "llm_call" },
  })
  throw err
}
```

---

## 用户反馈

前端按钮 → 调你自己的后端 → 后端调:

```ts
await sl.feedback({
  eventId: "uuid from earlier",
  rating: "down",
  reasons: ["hallucination"],
  comment: "AI 说有 12 条但实际 8 条",
  userIdHash: hashUser(user.id),
})
```

---

## 配置

```ts
new SmartLoop({
  apiKey: string,             // 必填
  product: string,            // 必填 (与你创建 product 时的 id 对应)
  endpoint: string,           // 必填 (SmartLoop 后端 URL)

  batchSize?: number,         // 默认 50,达到这个数立即 flush
  flushIntervalMs?: number,   // 默认 5000,周期性 flush

  onError?: (err, ctx) => void,  // 可选,SDK 内部错误暴露
})
```

---

## 行为保证

- **永远不阻塞主业务**: `log()` 同步返回,网络发送是异步的
- **永远不抛异常**到宿主代码(除非构造函数参数错)
- **批量发送**省 HTTP 开销
- **进程退出前**记得 `await sl.shutdown()`(否则可能丢最后的批次)
- **重试**: MVP 阶段失败直接丢(v0.2 加本地文件落盘 retry)

---

## 隐私

SDK 把 `input` + `output` 文本传给 SmartLoop 后端;后端**再传给 LLM-as-Judge**(qwen3-max via DashScope)。

**敏感字段建议你的产品代码层先做脱敏**,再传给 SDK:
- ❌ 不要把 `用户邮箱` / `订单号原文` 直接传给 SDK
- ✅ 改成 `用户邮箱<已脱敏>` / `订单号 ORDER-xxxx`
- ✅ 或者把客户姓名替换成占位符,SmartLoop 不需要看到真实身份

`metadata` 字段也是同样的原则。

---

## 后端字段映射

SDK 字段 ↔ 后端 `events` 表:

| SDK | 表 |
|---|---|
| `input` | `input_message` |
| `output` | `output_message` |
| `model` | `model` |
| `promptVersion` | `prompt_version_label` |
| `tokens.input` | `tokens_input` |
| `tokens.output` | `tokens_output` |
| `tokens.cacheHit` | `tokens_cache_hit` |
| `costUsd` | `cost_usd` |
| `latencyMs` | `latency_ms` |
| `toolsCalled` | `tools_called` (JSONB) |
| `status` | `status` |
| `errorMessage` | `error_message` |
| `language` | `language` |
| `metadata` | `metadata` (JSONB) |

---

## 多语言 SDK 路线图

- ✅ Node.js / TypeScript(当前)
- 🚧 Python(下一个,给 algo 团队)
- 📋 PHP (for any Hyperf-based stack)
- 📋 Go
- 📋 浏览器 SDK(给前端直接埋 👍/👎)

详见 [ROADMAP.md](./ROADMAP.md)。
