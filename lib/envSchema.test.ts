import { describe, expect, it } from "vitest";
import { parseServerEnv } from "@/lib/envSchema";

const valid = {
  DATABASE_URL: "postgresql://u:p@host-pooler.example.com/db?sslmode=require",
  DATABASE_URL_UNPOOLED: "postgresql://u:p@host.example.com/db?sslmode=require",
  NEON_AUTH_BASE_URL: "https://auth.example.com/neondb/auth",
  NEON_AUTH_COOKIE_SECRET: "x".repeat(32),
  AWS_ACCESS_KEY_ID: "key",
  AWS_SECRET_ACCESS_KEY: "secret",
  AWS_ENDPOINT_URL_S3: "https://storage.example.com",
  AWS_REGION: "ap-southeast-1",
};

describe("parseServerEnv", () => {
  it("accepts a complete environment and applies defaults", () => {
    const env = parseServerEnv(valid);
    expect(env.STORAGE_BUCKET_MATERIALS).toBe("materials");
    expect(env.ALLOWED_EMAIL_DOMAINS).toEqual([]);
    expect(env.GROQ_API_KEY).toBeUndefined();
  });

  it("normalises the allowed email domains", () => {
    const env = parseServerEnv({ ...valid, ALLOWED_EMAIL_DOMAINS: " @ABC.edu.in, xyz.ac.in ," });
    expect(env.ALLOWED_EMAIL_DOMAINS).toEqual(["abc.edu.in", "xyz.ac.in"]);
  });

  it("treats empty optional values as unset", () => {
    expect(parseServerEnv({ ...valid, GROQ_API_KEY: "" }).GROQ_API_KEY).toBeUndefined();
  });

  it("lists every missing or invalid variable", () => {
    expect(() =>
      parseServerEnv({ ...valid, DATABASE_URL: "mysql://nope", NEON_AUTH_COOKIE_SECRET: "short" }),
    ).toThrow(/DATABASE_URL[\s\S]*NEON_AUTH_COOKIE_SECRET/);
  });
});
