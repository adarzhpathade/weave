"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { ProfileData } from "@/components/profile/types";
import { getSessionStudent } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { students } from "@/lib/db/schema";
import type { ActionResult } from "./types";

const notifySchema = z.object({
  deadline: z.boolean(),
  newAssignment: z.boolean(),
  status: z.boolean(),
});

export async function updateNotify(
  input: ProfileData["notify"],
): Promise<ActionResult<null>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Please sign in to continue.",
      },
    };
  }

  const parsed = notifySchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: "Invalid notification preferences.",
      },
    };
  }

  try {
    await db
      .update(students)
      .set({
        notifyDeadline: parsed.data.deadline,
        notifyNewAssignment: parsed.data.newAssignment,
        notifyStatus: parsed.data.status,
        updatedAt: new Date(),
      })
      .where(eq(students.id, student.studentId));

    revalidatePath("/profile");
    return { ok: true, data: null };
  } catch (error) {
    console.error("updateNotify failed:", error);
    return {
      ok: false,
      error: {
        code: "UPDATE_FAILED",
        message: "Couldn't update notification preferences. Please try again.",
      },
    };
  }
}
