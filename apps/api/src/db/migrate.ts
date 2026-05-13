import { drizzle } from "drizzle-orm/postgres-js"
import { migrate } from "drizzle-orm/postgres-js/migrator"
import postgres from "postgres"
import { config } from "../config"

const sql = postgres(config.DATABASE_URL, { max: 1 })
const db = drizzle(sql)

console.log("[migrate] applying migrations from src/db/migrations ...")
await migrate(db, { migrationsFolder: "./src/db/migrations" })
console.log("[migrate] done.")

await sql.end()
process.exit(0)
