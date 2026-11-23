import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

// Load .env / .env.local the same way Next.js does.
loadEnvConfig(process.cwd());

const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) {
  throw new Error("DATABASE_URL_UNPOOLED is not set. Copy .env.example to .env.local.");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema",
  out: "./lib/db/migrations",
  dbCredentials: { url },
  // Neon Auth owns this schema; never let drizzle-kit touch it.
  schemaFilter: ["public"],
  strict: true,
  verbose: true,
});
