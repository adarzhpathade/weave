import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions, students } from "@/lib/db/schema";

export type UpsertPushSubscriptionInput = {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
};

export async function upsertPushSubscription(
  input: UpsertPushSubscriptionInput,
): Promise<{ id: string }> {
  const now = new Date();
  const [row] = await db
    .insert(pushSubscriptions)
    .values({
      userId: input.userId,
      endpoint: input.endpoint,
      p256dh: input.p256dh,
      auth: input.auth,
      userAgent: input.userAgent ?? null,
    })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: {
        userId: input.userId,
        p256dh: input.p256dh,
        auth: input.auth,
        userAgent: input.userAgent ?? null,
        updatedAt: now,
      },
    })
    .returning({ id: pushSubscriptions.id });

  if (!row) {
    throw new Error("Failed to upsert push subscription.");
  }

  return { id: row.id };
}

export async function deletePushSubscription(
  userId: string,
  endpoint: string,
): Promise<{ deleted: boolean }> {
  const result = await db
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.userId, userId), eq(pushSubscriptions.endpoint, endpoint)))
    .returning({ id: pushSubscriptions.id });

  return { deleted: result.length > 0 };
}

export async function deletePushSubscriptionByEndpoint(
  endpoint: string,
): Promise<{ deleted: boolean }> {
  const result = await db
    .delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint))
    .returning({ id: pushSubscriptions.id });

  return { deleted: result.length > 0 };
}

export type StudentPushSubscription = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
};

export async function getSubscriptionsForStudent(
  studentId: string,
): Promise<StudentPushSubscription[]> {
  const rows = await db
    .select({
      id: pushSubscriptions.id,
      endpoint: pushSubscriptions.endpoint,
      p256dh: pushSubscriptions.p256dh,
      auth: pushSubscriptions.auth,
    })
    .from(pushSubscriptions)
    .innerJoin(students, eq(students.userId, pushSubscriptions.userId))
    .where(eq(students.id, studentId));

  return rows;
}

export async function markPushSuccess(id: string): Promise<void> {
  const now = new Date();
  await db
    .update(pushSubscriptions)
    .set({
      lastSuccessAt: now,
      updatedAt: now,
    })
    .where(eq(pushSubscriptions.id, id));
}
