"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, destroySession } from "@/lib/auth/session";
import { ensureStudentUser, getStudentByEmail } from "@/lib/db/queries";
import { env } from "@/lib/env";
import type { ActionResult } from "./types";

const NOT_ON_LIST_MESSAGE = "This email isn't on the CSIT student list.";

const signInEmailSchema = z.string().trim().toLowerCase().email("Enter your college email.");

export async function signIn(email: string): Promise<ActionResult<{ studentId: string }>> {
  const parsed = signInEmailSchema.safeParse(email);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_EMAIL",
        message: parsed.error.issues[0]?.message ?? "Enter your college email.",
      },
    };
  }

  const normalizedEmail = parsed.data;
  const demoEmail = process.env.DEMO_STUDENT_EMAIL?.trim().toLowerCase() ?? "";

  if (env.ALLOWED_EMAIL_DOMAINS.length > 0 && normalizedEmail !== demoEmail) {
    const domain = normalizedEmail.split("@")[1] ?? "";
    if (!env.ALLOWED_EMAIL_DOMAINS.includes(domain)) {
      return {
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: NOT_ON_LIST_MESSAGE,
        },
      };
    }
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
        message: "Couldn't sign you in right now. Please try again.",
      },
    };
  }
}

export async function signOut(): Promise<void> {
  await destroySession();
  redirect("/login");
}
