import { z } from "zod";

// Empty strings in .env files mean "not set".
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional());

const postgresUrl = z
  .string()
  .url()
  .refine((value) => value.startsWith("postgres://") || value.startsWith("postgresql://"), {
    message: "must be a postgres:// connection string",
  });

/** Comma-separated domains → lowercase list without "@" (e.g. "@abc.edu.in, xyz.ac.in"). */
const domainList = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
      .filter(Boolean),
  );

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Database — pooled URL for the app, unpooled (direct) URL for migrations.
  DATABASE_URL: postgresUrl,
  DATABASE_URL_UNPOOLED: postgresUrl,

  // Neon Auth (Managed Better Auth)
  NEON_AUTH_BASE_URL: z.string().url(),
  NEON_AUTH_COOKIE_SECRET: z.string().min(32, "must be at least 32 characters"),
  /** Empty = no restriction (until the college domain is known). */
  ALLOWED_EMAIL_DOMAINS: domainList,

  // Neon Object Storage (S3-compatible)
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_ENDPOINT_URL_S3: z.string().url(),
  AWS_REGION: z.string().min(1),
  STORAGE_BUCKET_MATERIALS: z.string().min(1).default("materials"),

  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // AI (Phase 3) — optional until the AI features land; lib/ai checks them before use.
  GROQ_API_KEY: optional(z.string()),
  GOOGLE_GENERATIVE_AI_API_KEY: optional(z.string()),

  // Web push + cron (Phase 3.6)
  VAPID_PUBLIC_KEY: optional(z.string()),
  VAPID_PRIVATE_KEY: optional(z.string()),
  VAPID_SUBJECT: optional(z.string()),
  CRON_SECRET: optional(z.string().min(16)),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${problems}\nSee .env.example.`);
  }
  return result.data;
}
