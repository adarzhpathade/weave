import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";
import { env } from "@/lib/env";

export const auth = createNeonAuth({
  baseUrl: env.NEON_AUTH_BASE_URL,
  cookies: { secret: env.NEON_AUTH_COOKIE_SECRET },
});

export type NeonAuthUser = {
  id: string;
  email: string;
  name: string;
};

export type SendEmailCodeResult =
  | { ok: true }
  | { ok: false; error: "rate_limited" | "failed" };

export type VerifyEmailCodeResult =
  | { ok: true; user: NeonAuthUser }
  | { ok: false; error: "invalid_code" | "rate_limited" | "failed" };

interface NeonAuthEmailOtpEndpoints {
  sendVerificationOtp(params: {
    email: string;
    type: "sign-in";
  }): Promise<{ data: unknown; error: unknown }>;
}

interface NeonAuthSignInEndpoints {
  emailOtp(params: {
    email: string;
    otp: string;
  }): Promise<{
    data: { user?: { id: string; email: string; name?: string | null } } | null;
    error: unknown;
  }>;
}

interface NeonAuthExtended {
  emailOtp: NeonAuthEmailOtpEndpoints;
  signIn: NeonAuthSignInEndpoints;
}

const authClient = auth as unknown as NeonAuthExtended;

function classifySendError(error: unknown): "rate_limited" | "failed" {
  if (!error || typeof error !== "object") {
    return "failed";
  }
  const e = error as { status?: unknown; code?: unknown };
  if (e.status === 429 || e.code === "TOO_MANY_ATTEMPTS") {
    return "rate_limited";
  }
  return "failed";
}

function classifyVerifyError(
  error: unknown,
): "invalid_code" | "rate_limited" | "failed" {
  if (!error || typeof error !== "object") {
    return "failed";
  }
  const e = error as { status?: unknown; code?: unknown; message?: unknown };
  if (e.status === 429 || e.code === "TOO_MANY_ATTEMPTS") {
    return "rate_limited";
  }
  if (
    e.code === "INVALID_OTP" ||
    e.code === "OTP_EXPIRED" ||
    (typeof e.code === "string" && e.code.includes("OTP")) ||
    (typeof e.message === "string" && /otp|code|expired/i.test(e.message))
  ) {
    return "invalid_code";
  }
  return "failed";
}

/**
 * Sends a 6-digit sign-in verification code to the given email via Neon Auth.
 */
export async function sendEmailCode(email: string): Promise<SendEmailCodeResult> {
  try {
    const res = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });

    if (res?.error) {
      console.error("sendVerificationOtp error:", res.error);
      return { ok: false, error: classifySendError(res.error) };
    }

    return { ok: true };
  } catch (error) {
    console.error("sendVerificationOtp threw an exception:", error);
    return { ok: false, error: classifySendError(error) };
  }
}

/**
 * Verifies a 6-digit email sign-in code with Neon Auth.
 * Returns the Neon Auth user { id, email, name } on success, or a typed error.
 */
export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<VerifyEmailCodeResult> {
  try {
    const res = await authClient.signIn.emailOtp({
      email,
      otp: code,
    });

    if (res?.error) {
      console.error("signIn.emailOtp error:", res.error);
      return { ok: false, error: classifyVerifyError(res.error) };
    }

    const user = res?.data?.user;
    if (!user || !user.id || !user.email) {
      console.error("signIn.emailOtp returned no user in data");
      return { ok: false, error: "failed" };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
      },
    };
  } catch (error) {
    console.error("signIn.emailOtp threw an exception:", error);
    return { ok: false, error: classifyVerifyError(error) };
  }
}
