"use server";

import { revalidatePath } from "next/cache";
import { getSessionStudent } from "@/lib/auth/session";
import { markAllAnnouncementsRead } from "@/lib/db/queries";
import type { ActionResult } from "./types";

export async function markAllRead(): Promise<ActionResult<{ markedCount: number }>> {
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

  try {
    const markedCount = await markAllAnnouncementsRead(student.userId, student.studentId);
    revalidatePath("/home");
    revalidatePath("/(app)", "layout");
    return { ok: true, data: { markedCount } };
  } catch (error) {
    console.error("markAllRead failed:", error);
    return {
      ok: false,
      error: {
        code: "MARK_READ_FAILED",
        message: "Couldn't mark announcements as read. Please try again.",
      },
    };
  }
}
