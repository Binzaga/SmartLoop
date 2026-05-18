import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"
import sensible from "@fastify/sensible"
import { config } from "./config"
import { healthRoutes } from "./routes/health"
import { eventRoutes } from "./routes/events"
import { adminRoutes } from "./routes/admin"
import { judgeRoutes } from "./routes/judge"
import { dashboardRoutes } from "./routes/dashboard"
import { authRoutes } from "./routes/auth"
import { replayRoutes } from "./routes/replay"
import { startJudgeWorker } from "./workers/judge-worker"
import { startClusterWorker } from "./workers/cluster-worker"
import { startAlertWorker } from "./workers/alert-worker"
import { startReplayWorker } from "./workers/replay-worker"

const app = Fastify({
  logger: {
    level: config.LOG_LEVEL,
    transport: {
      target: "pino-pretty",
      options: { colorize: true, translateTime: "HH:MM:ss" },
    },
  },
  trustProxy: true,
})

await app.register(helmet, { contentSecurityPolicy: false })
await app.register(cors, { origin: true })
await app.register(sensible)

// Public health
await app.register(healthRoutes)

// Auth (signup / login / logout / me) — no auth required on these endpoints
await app.register(authRoutes)

// Admin routes (bootstrap products / orgs)
await app.register(adminRoutes)
await app.register(judgeRoutes)
await app.register(dashboardRoutes)
await app.register(replayRoutes)

// Authenticated event ingestion
await app.register(eventRoutes)

const start = async () => {
  try {
    await app.listen({ port: config.API_PORT, host: config.API_HOST })
    app.log.info({ port: config.API_PORT }, "smartloop api listening")

    // Start background workers
    if (config.DASHSCOPE_API_KEY) {
      startJudgeWorker(app.log)
    } else {
      app.log.warn("[judge] DASHSCOPE_API_KEY missing — judge worker NOT started")
    }
    startClusterWorker(app.log)
    startAlertWorker(app.log)
    if (config.DASHSCOPE_API_KEY) {
      startReplayWorker(app.log)
    }
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()

// Graceful shutdown
const shutdown = async (signal: string) => {
  app.log.info({ signal }, "shutting down")
  await app.close()
  process.exit(0)
}
process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
