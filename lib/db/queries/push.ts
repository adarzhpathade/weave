import "server-only";
import { and, eq, gt, gte, isNull, lte, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  assignmentDivisions,
  assignmentMarks,
  assignments,
  pushLog,
  pushSubscriptions,
  students,
  subjects,
} from "@/lib/db/schema";

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

/**
 * Attempts to claim a push_log entry for (assignmentId, studentId, kind).
 * Uses onConflictDoNothing().
 * Returns true if claimed (inserted), false if already sent.
 */
export async function claimPushLog(
  assignmentId: string,
  studentId: string,
  kind: "due_2d" | "due_today" | "new" | "status",
): Promise<boolean> {
  const [row] = await db
    .insert(pushLog)
    .values({
      assignmentId,
      studentId,
      kind,
    })
    .onConflictDoNothing({
      target: [pushLog.assignmentId, pushLog.studentId, pushLog.kind],
    })
    .returning({ id: pushLog.id });

  return Boolean(row);
}

export type AssignmentReminderCandidate = {
  assignmentId: string;
  assignmentTitle: string;
  subjectName: string;
  dueAt: Date;
  studentId: string;
};

/**
 * Finds all active students in divisions of assignments due between windowStart and windowEnd
 * who have notifyDeadline turned on and have not yet submitted / submitted late.
 */
export async function getDue2dCandidates(
  windowStart: Date,
  windowEnd: Date,
): Promise<AssignmentReminderCandidate[]> {
  const rows = await db
    .select({
      assignmentId: assignments.id,
      assignmentTitle: assignments.title,
      subjectName: subjects.name,
      dueAt: assignments.dueAt,
      studentId: students.id,
    })
    .from(assignments)
    .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
    .innerJoin(assignmentDivisions, eq(assignmentDivisions.assignmentId, assignments.id))
    .innerJoin(students, eq(students.divisionId, assignmentDivisions.divisionId))
    .leftJoin(
      assignmentMarks,
      and(
        eq(assignmentMarks.assignmentId, assignments.id),
        eq(assignmentMarks.studentId, students.id),
      ),
    )
    .where(
      and(
        gte(assignments.dueAt, windowStart),
        lte(assignments.dueAt, windowEnd),
        eq(students.status, "active"),
        eq(students.notifyDeadline, true),
        or(
          isNull(assignmentMarks.status),
          eq(assignmentMarks.status, "not_submitted"),
        ),
      ),
    );

  return rows;
}

/**
 * Finds all active students in divisions of assignments due later today (up to endOfToday)
 * who have notifyDeadline turned on and have not yet submitted / submitted late.
 */
export async function getDueTodayCandidates(
  now: Date,
  endOfToday: Date,
): Promise<AssignmentReminderCandidate[]> {
  const rows = await db
    .select({
      assignmentId: assignments.id,
      assignmentTitle: assignments.title,
      subjectName: subjects.name,
      dueAt: assignments.dueAt,
      studentId: students.id,
    })
    .from(assignments)
    .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
    .innerJoin(assignmentDivisions, eq(assignmentDivisions.assignmentId, assignments.id))
    .innerJoin(students, eq(students.divisionId, assignmentDivisions.divisionId))
    .leftJoin(
      assignmentMarks,
      and(
        eq(assignmentMarks.assignmentId, assignments.id),
        eq(assignmentMarks.studentId, students.id),
      ),
    )
    .where(
      and(
        gt(assignments.dueAt, now),
        lte(assignments.dueAt, endOfToday),
        eq(students.status, "active"),
        eq(students.notifyDeadline, true),
        or(
          isNull(assignmentMarks.status),
          eq(assignmentMarks.status, "not_submitted"),
        ),
      ),
    );

  return rows;
}

/**
 * Finds all active students in the divisions of a newly created assignment
 * who have notifyNewAssignment turned on.
 */
export async function getNewAssignmentCandidates(
  assignmentId: string,
): Promise<AssignmentReminderCandidate[]> {
  const rows = await db
    .select({
      assignmentId: assignments.id,
      assignmentTitle: assignments.title,
      subjectName: subjects.name,
      dueAt: assignments.dueAt,
      studentId: students.id,
    })
    .from(assignments)
    .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
    .innerJoin(assignmentDivisions, eq(assignmentDivisions.assignmentId, assignments.id))
    .innerJoin(students, eq(students.divisionId, assignmentDivisions.divisionId))
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(students.status, "active"),
        eq(students.notifyNewAssignment, true),
      ),
    );

  return rows;
}

export type StatusMarkedCandidate = {
  assignmentId: string;
  assignmentTitle: string;
  subjectName: string;
  studentId: string;
  status: "submitted" | "late" | "not_submitted";
  marks: number | null;
  maxMarks: number | null;
  remark: string | null;
};

/**
 * Finds the marked student's details for status notification.
 * Returns null if the student has notifyStatus disabled or is inactive.
 */
export async function getStatusMarkedCandidate(
  assignmentId: string,
  studentId: string,
): Promise<StatusMarkedCandidate | null> {
  const [row] = await db
    .select({
      assignmentId: assignments.id,
      assignmentTitle: assignments.title,
      subjectName: subjects.name,
      studentId: students.id,
      status: assignmentMarks.status,
      marks: assignmentMarks.marks,
      maxMarks: assignments.maxMarks,
      remark: assignmentMarks.remark,
    })
    .from(assignments)
    .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
    .innerJoin(
      assignmentMarks,
      and(
        eq(assignmentMarks.assignmentId, assignments.id),
        eq(assignmentMarks.studentId, studentId),
      ),
    )
    .innerJoin(students, eq(students.id, studentId))
    .where(
      and(
        eq(assignments.id, assignmentId),
        eq(students.status, "active"),
        eq(students.notifyStatus, true),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  return row;
}
