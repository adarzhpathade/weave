"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth, sendEmailCode, verifyEmailCode } from "@/lib/auth/server";
import { createSession, destroySession } from "@/lib/auth/session";
import { ensureStudentUser, getStudentByEmail } from "@/lib/db/queries";
import { linkStudentToAuthUser } from "@/lib/db/queries/students";
import { env } from "@/lib/env";
import type { ActionResult } from "./types";

const NOT_ON_LIST_MESSAGE = "This email isn't on the CSIT student list.";
const INVALID_EMAIL_MESSAGE = "Enter your college email.";
const INVALID_CODE_MESSAGE = "That code is wrong or has expired. Try again.";
const TOO_MANY_TRIES_MESSAGE = "Too many tries. Wait a minute and try again.";
const CODE_REQUIRED_MESSAGE = "We've moved to email codes. Request a code to sign in.";
const SIGN_IN_FAILED_MESSAGE = "Couldn't sign you in right now. Please try again.";

const signInEmailSchema = z.string().trim().toLowerCase().email(INVALID_EMAIL_MESSAGE);
const signInCodeSchema = z.string().trim().regex(/^\d{6}$/, INVALID_CODE_MESSAGE);

function isDomainAllowed(email: string, demoEmail: string): boolean {
  if (env.ALLOWED_EMAIL_DOMAINS.length === 0 || email === demoEmail) {
    return true;
  }
  const domain = email.split("@")[1] ?? "";
  return env.ALLOWED_EMAIL_DOMAINS.includes(domain);
}

/**
 * Step 1: validate email, check the student list, send the code.
 * For the demo email: do NOT send a code; sign in straight away and return { demo: true }.
 */
export async function requestSignInCode(
  email: string,
): Promise<ActionResult<{ demo: boolean }>> {
  const parsed = signInEmailSchema.safeParse(email);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_EMAIL",
        message: parsed.error.issues[0]?.message ?? INVALID_EMAIL_MESSAGE,
      },
    };
  }

  const normalizedEmail = parsed.data;
  const demoEmail = process.env.DEMO_STUDENT_EMAIL?.trim().toLowerCase() ?? "";

  if (!isDomainAllowed(normalizedEmail, demoEmail)) {
    return {
      ok: false,
      error: {
        code: "NOT_ON_LIST",
        message: NOT_ON_LIST_MESSAGE,
      },
    };
  }

  try {
    const student = await getStudentByEmail(normalizedEmail);
    if (!student || student.status !== "active") {
      return {
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: NOT_ON_LIST_MESSAGE,
        },
      };
    }

    if (normalizedEmail === demoEmail) {
      const userId =
        student.userId ?? (await ensureStudentUser(student.id, student.email, student.fullName));
      await createSession(student.id, userId);
      return { ok: true, data: { demo: true } };
    }

    const sendResult = await sendEmailCode(normalizedEmail);
    if (!sendResult.ok) {
      if (sendResult.error === "rate_limited") {
        return {
          ok: false,
          error: {
            code: "TOO_MANY_TRIES",
            message: TOO_MANY_TRIES_MESSAGE,
          },
        };
      }
      return {
        ok: false,
        error: {
          code: "SIGN_IN_FAILED",
          message: SIGN_IN_FAILED_MESSAGE,
        },
      };
    }

    return { ok: true, data: { demo: false } };
  } catch (error) {
    console.error("requestSignInCode failed:", error);
    return {
      ok: false,
      error: {
        code: "SIGN_IN_FAILED",
        message: SIGN_IN_FAILED_MESSAGE,
      },
    };
  }
}

/**
 * Step 2: check the code with Neon Auth, then create the weave_session cookie.
 */
export async function verifySignInCode(
  email: string,
  code: string,
): Promise<ActionResult<{ studentId: string }>> {
  const parsedEmail = signInEmailSchema.safeParse(email);
  if (!parsedEmail.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_EMAIL",
        message: parsedEmail.error.issues[0]?.message ?? INVALID_EMAIL_MESSAGE,
      },
    };
  }

  const parsedCode = signInCodeSchema.safeParse(code);
  if (!parsedCode.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_CODE",
        message: INVALID_CODE_MESSAGE,
      },
    };
  }

  const normalizedEmail = parsedEmail.data;
  const trimmedCode = parsedCode.data;
  const demoEmail = process.env.DEMO_STUDENT_EMAIL?.trim().toLowerCase() ?? "";

  if (!isDomainAllowed(normalizedEmail, demoEmail)) {
    return {
      ok: false,
      error: {
        code: "NOT_ON_LIST",
        message: NOT_ON_LIST_MESSAGE,
      },
    };
  }

  try {
    const student = await getStudentByEmail(normalizedEmail);
    if (!student || student.status !== "active") {
      return {
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: NOT_ON_LIST_MESSAGE,
        },
      };
    }

    const verifyResult = await verifyEmailCode(normalizedEmail, trimmedCode);
    if (!verifyResult.ok) {
      if (verifyResult.error === "rate_limited") {
        return {
          ok: false,
          error: {
            code: "TOO_MANY_TRIES",
            message: TOO_MANY_TRIES_MESSAGE,
          },
        };
      }
      if (verifyResult.error === "invalid_code") {
        return {
          ok: false,
          error: {
            code: "INVALID_CODE",
            message: INVALID_CODE_MESSAGE,
          },
        };
      }
      return {
        ok: false,
        error: {
          code: "SIGN_IN_FAILED",
          message: SIGN_IN_FAILED_MESSAGE,
        },
      };
    }

    const authUser = verifyResult.user;
    const userId = await linkStudentToAuthUser(
      student.id,
      authUser.id,
      student.email,
      authUser.name || student.fullName,
    );

    await createSession(student.id, userId);

    return { ok: true, data: { studentId: student.id } };
  } catch (error) {
    console.error("verifySignInCode failed:", error);
    return {
      ok: false,
      error: {
        code: "SIGN_IN_FAILED",
        message: SIGN_IN_FAILED_MESSAGE,
      },
    };
  }
}

/**
 * Kept for the demo email only; for any other email returns error code "CODE_REQUIRED".
 */
export async function signIn(email: string): Promise<ActionResult<{ studentId: string }>> {
  const parsed = signInEmailSchema.safeParse(email);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_EMAIL",
        message: parsed.error.issues[0]?.message ?? INVALID_EMAIL_MESSAGE,
      },
    };
  }

  const normalizedEmail = parsed.data;
  const demoEmail = process.env.DEMO_STUDENT_EMAIL?.trim().toLowerCase() ?? "";

  if (normalizedEmail !== demoEmail) {
    return {
      ok: false,
      error: {
        code: "CODE_REQUIRED",
        message: CODE_REQUIRED_MESSAGE,
      },
    };
  }

  try {
    const student = await getStudentByEmail(normalizedEmail);
    if (!student || student.status !== "active") {
      return {
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: NOT_ON_LIST_MESSAGE,
        },
      };
    }

    const userId =
      student.userId ?? (await ensureStudentUser(student.id, student.email, student.fullName));

    await createSession(student.id, userId);

    return { ok: true, data: { studentId: student.id } };
  } catch (error) {
    console.error("signIn failed:", error);
    return {
      ok: false,
      error: {
        code: "SIGN_IN_FAILED",
        message: SIGN_IN_FAILED_MESSAGE,
      },
    };
  }
}

export async function signOut(): Promise<void> {
  try {
    const result = await auth.signOut();
    if (result && typeof result === "object" && "error" in result && result.error) {
      const err = result.error as { message?: string; status?: number; code?: string };
      const msg = err.message?.toLowerCase() ?? "";
      if (err.status !== 401 && err.code !== "SESSION_EXPIRED" && !msg.includes("session")) {
        console.error("auth.signOut error:", result.error);
      }
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message.toLowerCase() : "";
    if (!msg.includes("session")) {
      console.error("auth.signOut exception:", error);
    }
  }

  await destroySession();
  redirect("/login");
}
