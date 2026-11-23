import "server-only";
import { parseServerEnv } from "@/lib/envSchema";

/**
 * Validated server environment. Importing this module fails fast (at boot / first use)
 * when a required variable is missing or malformed, instead of failing deep inside a request.
 * Never import this from client components.
 */
export const env = parseServerEnv(process.env);
