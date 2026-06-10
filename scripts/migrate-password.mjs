import { readFileSync } from "node:fs";
import postgres from "postgres";

// load DATABASE_URL from .env.local
const env = readFileSync(new URL("../.env.local", import.meta.url), "utf-8");
const line = env.split("\n").find((l) => l.startsWith("DATABASE_URL="));
const url = line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, "");

const sql = postgres(url, { prepare: false, max: 1 });
await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash text`;
console.log("OK: password_hash column ensured");
await sql.end();
