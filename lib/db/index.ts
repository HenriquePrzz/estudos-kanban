import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

function buildConnectionString() {
  const url = process.env.DATABASE_URL
  if (!url) return url
  // Silencia o aviso de deprecação do pg mantendo o comportamento atual (verify-full).
  return url.includes("sslmode=") ? url : `${url}${url.includes("?") ? "&" : "?"}sslmode=verify-full`
}

export const pool = new Pool({ connectionString: buildConnectionString() })
export const db = drizzle(pool, { schema })
