import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

// The connection is created lazily on first query — NOT at import time — so
// `next build` can analyze route modules without DATABASE_URL being present.
// Supabase pooled "Transaction mode" (port 6543) requires prepare:false.
const globalForDb = globalThis as unknown as {
  client?: ReturnType<typeof postgres>;
  db?: DB;
};

function getDb(): DB {
  if (globalForDb.db) return globalForDb.db;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const client = globalForDb.client ?? postgres(connectionString, { prepare: false });
  globalForDb.client = client;
  globalForDb.db = drizzle(client, { schema });
  return globalForDb.db;
}

// Proxy so `import { db }` never connects until a method is actually used.
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export { schema };
