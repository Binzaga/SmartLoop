import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { config } from "../config"
import * as schema from "./schema"

const queryClient = postgres(config.DATABASE_URL, {
  max: 20,
  onnotice: () => {}, // silence NOTICE logs
})

export const db = drizzle(queryClient, { schema, logger: config.LOG_LEVEL === "debug" })
export type DB = typeof db
export { schema }
export { queryClient as rawSql }
