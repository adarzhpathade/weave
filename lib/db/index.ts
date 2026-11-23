import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";

// HTTP driver over the pooled URL: one round trip per query, good for serverless.
// The schema object is added in Phase 0.5 (lib/db/schema).
export const db = drizzle({ client: neon(env.DATABASE_URL) });
