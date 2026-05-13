# SmartLoop

> Open-source quality observation platform for AI products.
> 让每一个 AI 产品自己说出它哪里错了。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Status: Alpha](https://img.shields.io/badge/status-alpha-orange.svg)]()

SmartLoop is what your AI products use to **monitor quality, classify bad cases, run regression tests, and alert when things degrade** — without you wiring all that yourself.

Think of it as **Sentry for AI agents**: one SDK call per LLM invocation, then everything else (auto-scoring, clustering, alerting, eval) lives in a unified platform.

---

## What problem this solves

If you build AI products, you've already faced this:

- 👀 **No idea which prompt is misbehaving** — quality regressions are silent
- 🗂️ **Bad cases stack up in spreadsheets** — nobody categorizes them
- 🎲 **Prompt changes go to prod with no regression check** — you find out from users
- 🌍 **Multi-language quality is invisible** — your English RAG is great, your Arabic RAG is broken
- 📊 **Dashboards exist** — but they're for engineers, not product owners

SmartLoop unifies all five problems into a single platform that any AI product team can run internally.

---

## Quick start

```bash
git clone https://github.com/Binzaga/SmartLoop && cd SmartLoop

# 1. Start Postgres + Redis
docker compose up -d

# 2. Install deps
bun install

# 3. Set up env
cp .env.example apps/api/.env
# Edit apps/api/.env — fill in DASHSCOPE_API_KEY (or any OpenAI-compatible LLM)
# Generate ADMIN_TOKEN: openssl rand -base64 24 | tr -d '/+=' | head -c 32

# 4. Migrate DB
cd apps/api && bun run db:migrate

# 5. Start API + Web
bun run dev                     # API on :8088
cd ../web && bun run dev        # Web on :3001
```

Open http://localhost:3001 — you have the marketing site.
Open http://localhost:3001/dashboard — the actual quality dashboard.

See [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) for the full guide.

---

## Three-line SDK integration

```ts
import { SmartLoop } from "@smartloop/sdk"

const sl = new SmartLoop({
  apiKey: process.env.SMARTLOOP_API_KEY!,
  product: "your-ai-product",
  endpoint: "https://your-smartloop.example.com",
})

sl.log({
  input: userMessage,
  output: aiReply,
  model: "gpt-4o",
  tokens: { input: 1000, output: 200 },
  latencyMs: 1500,
})
```

That's it. SmartLoop now scores this event, classifies it if it goes wrong, and alerts you when regressions kick in.

---

## Core capabilities

| Module | What it does |
|---|---|
| **SDK** | 3-line integration. Async batched. Zero blocking on host app. Node.js today; Python / PHP / Go on the roadmap. |
| **LLM-as-Judge** | Each event auto-scored on 4 dimensions (accuracy / helpfulness / safety / style) + tag classification (hallucination / too-short / off-topic / etc). Pluggable judge model (Qwen / GPT / Claude). |
| **Bad case clustering** | Low-score + thumbs-down events auto-grouped into recurring patterns (5 default categories). |
| **Regression testing** | Golden case sets per product. One click runs a new prompt against the suite. Pass-rate diff makes regressions impossible to miss. |
| **Live dashboard** | Cross-product health scores, sparkline trends, recent event stream, bad-case spotlight. |
| **Alerting** | DingTalk / Slack / Telegram / webhook when bad-case clusters spike or pass-rate drops. |

---

## Why SmartLoop (vs LangSmith / Braintrust / Helicone)

These platforms are all great. SmartLoop differs on three axes:

| | LangSmith | Braintrust | Helicone | **SmartLoop** |
|---|---|---|---|---|
| Audience | Developers (trace) | ML engineers (eval) | Backend devs (cost/latency) | **Product owners + AI engineers + ops** |
| Bad-case management | ❌ | partial | ❌ | ✅ **first-class** |
| Self-hostable | paid tier only | hosted only | yes | **yes, MIT-licensed core** |
| Multi-language UI | EN | EN | EN | EN + 中文 |
| Cross-platform alerting | Slack | Slack | Slack | **Slack + DingTalk + Telegram + 飞书 + webhook** |
| Built-in i18n quality flags | ❌ | ❌ | ❌ | ✅ |

You can absolutely use SmartLoop alongside LangSmith — they trace, we evaluate + alert.

---

## Architecture

```
   AI Product ──SDK──▶ SmartLoop API ──▶ Postgres + Milvus
                            │
                            ├──▶ LLM-as-Judge Worker (Qwen / GPT / Claude)
                            ├──▶ Cluster Worker (embedding + DBSCAN)
                            └──▶ Alert Engine (DingTalk / Slack / Telegram)
                            │
                       Next.js Dashboard
```

Stack:

- **Runtime**: Bun ≥ 1.3
- **API**: Fastify + Drizzle ORM
- **DB**: Postgres 16 + (Milvus for embeddings, optional)
- **LLM**: Pluggable — currently uses DashScope's OpenAI-compatible endpoint
- **Web**: Next.js 16 + Tailwind 4 + React 19

Deep dive: [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)

---

## Repository

```
smartloop/
├── apps/
│   ├── api/              Fastify backend (Drizzle, Postgres)
│   └── web/              Next.js 16 dashboard + marketing site
├── packages/
│   └── sdk-node/         Node.js client SDK
├── docker-compose.yml    Local Postgres + Redis
└── docs/
    ├── ARCHITECTURE.md   Why this design
    ├── DEVELOPMENT.md    5-minute local setup
    ├── DEPLOYMENT.md     Production deployment guide
    ├── API.md            HTTP API reference
    ├── SDK.md            Node.js SDK guide
    ├── SECRETS.md        Secret management + rotation
    └── ROADMAP.md        Done / WIP / future
```

---

## Status

🚧 **Alpha**. Core platform works end-to-end (SDK → API → judge → dashboard).
The marketing site is live. Cluster worker + Python SDK + Slack alerts are coming next.

See [docs/ROADMAP.md](./docs/ROADMAP.md) for the full plan.

---

## Contributing

PRs welcome. Read [CONTRIBUTING.md](./CONTRIBUTING.md) first — quick read.

The fastest way to be helpful:
1. **Add a language to the SDK** (Python is highest priority)
2. **Write an adapter** to your favorite agent framework (LangChain / LlamaIndex / Mastra)
3. **Improve judge prompts** for specific bad-case types (hallucination is the obvious win)
4. **Build the cluster worker** — embedding + DBSCAN, schema already exists

---

## License

MIT. See [LICENSE](./LICENSE).

If you use SmartLoop in production, a GitHub star is the kindest payment 🌟
