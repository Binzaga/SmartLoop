import { defineConfig } from "drizzle-kit"
import "dotenv/config"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://smartloop:smartloop_dev_pass@localhost:5433/smartloop",
  },
  verbose: true,
  strict: true,
})
