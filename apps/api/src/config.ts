import "dotenv/config"
import { z } from "zod"

const ConfigSchema = z.object({
  DATABASE_URL: z
    .string()
    .default("postgres://smartloop:smartloop_dev_pass@localhost:5433/smartloop"),
  REDIS_URL: z.string().default("redis://localhost:6380"),
  API_PORT: z.coerce.number().default(8080),
  API_HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  API_KEY_SECRET: z.string().default("dev-secret-replace-in-prod-please"),
  ADMIN_TOKEN: z.string().min(16, "ADMIN_TOKEN must be >= 16 chars"),
  /** Comma-separated list of IPs allowed to call /admin/*. Empty = no IP restriction. */
  ADMIN_IP_ALLOWLIST: z.string().default(""),
  DASHSCOPE_API_KEY: z.string().optional(),
  DASHSCOPE_BASE_URL: z
    .string()
    .default("https://dashscope.aliyuncs.com/compatible-mode/v1"),
  JUDGE_MODEL: z.string().default("qwen-plus"),
  PRIMARY_MODEL: z.string().default("qwen-plus"),
  JUDGE_BATCH_SIZE: z.coerce.number().default(10),
  JUDGE_TICK_INTERVAL_MS: z.coerce.number().default(5000),
  DINGTALK_WEBHOOK_URL: z.string().optional(),
  DINGTALK_WEBHOOK_SECRET: z.string().optional(),
})

export const config = ConfigSchema.parse(process.env)
export type Config = z.infer<typeof ConfigSchema>
