# SmartLoop

SaleSmartly AI Product Quality Monitoring & Iteration Platform.

Lets every internal AI product (CRM Claw, AI bot, AI translation, etc.) share a single quality observation platform: bad case clustering, regression testing, alerting, prompt iteration.

## Status

Hackathon MVP under active development. Target ship: 2026-06-08 路演.

## Architecture

```
AI Product ──SDK──> SmartLoop API ──> Postgres + Milvus
                         │
                         ├─> Worker (LLM-as-Judge, clustering, alerting)
                         └─> Web Dashboard (Next.js)
```

## Stack

- Runtime: Bun (Node-compatible)
- API: Fastify + TypeScript
- ORM: Drizzle
- DB: Postgres 16
- Queue/Cache: Redis
- LLM: Qwen 3.5 plus (DashScope)
- Web: Next.js 16 + Tailwind

## Local Development

Prerequisites: Bun >= 1.3, Docker.

```bash
# Start Postgres + Redis
bun run db:up

# Install deps
bun install

# Run migrations
bun run db:migrate

# Start API
bun run dev:api
```

API listens on `http://localhost:8080`.

## Project Layout

```
smartloop/
├── apps/
│   ├── api/         Fastify backend + workers
│   └── web/         Next.js dashboard (deferred)
├── packages/
│   └── sdk-node/    Node.js client SDK
├── docker-compose.yml
└── package.json
```

## License

Internal SaleSmartly project. Not for external distribution yet.
