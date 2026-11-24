import "server-only";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  announcementReads,
  announcements,
  assignmentMarks,
  assignments,
  divisions,
  students,
  subjects,
} from "@/lib/db/schema";
import { getVisibleSubjectIds } from "./visibleSubjects";

export type AnnouncementNotification = {
  type: "announcement";
  id: string;
  kind: "exam" | "material" | "class" | "assignment";
  title: string;
  body: string;
  fileKey: string | null;
  subjectCode: string | null;
  subjectName: string | null;
  subjectShort: string | null;
  createdAt: Date;
  read: boolean;
  readAt: Date | null;
};

export type AssignmentMarkNotification = {
  type: "assignment_mark";
  id: string;
  assignmentId: string;
  title: string;
  subjectCode: string;
  subjectName: string;
  subjectShort: string;
  status: "submitted" | "late" | "not_submitted";
  marks: number | null;
  maxMarks: number | null;
  remark: string | null;
  createdAt: Date;
  read: boolean;
};

export type NotificationItem = AnnouncementNotification | AssignmentMarkNotification;

const MAX_ANNOUNCEMENTS = 30;
const MAX_RECENT_MARKS = 15;

/**
 * Returns the student's bell-panel feed: announcements targeted to their
 * division / visible subjects plus recent assignment marks, merged and sorted
 * newest first with read flags. Enforces that `userId` owns `studentId`.
 */
export async function getNotifications(
  userId: string,
  studentId: string,
): Promise<NotificationItem[]> {
  const [studentRow] = await db
    .select({
      id: students.id,
      userId: students.userId,
      divisionId: divisions.id,
      programId: divisions.programId,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(and(eq(students.id, studentId), eq(students.userId, userId)))
    .limit(1);

  if (!studentRow) {
    return [];
  }

  const [visibleSubjectIds, announcementRows, markRows] = await Promise.all([
    getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
    db
      .select({
        id: announcements.id,
        kind: announcements.kind,
        title: announcements.title,
        body: announcements.body,
        fileKey: announcements.fileKey,
        subjectId: announcements.subjectId,
        subjectCode: subjects.code,
        subjectName: subjects.name,
        subjectShort: subjects.shortName,
        createdAt: announcements.createdAt,
        readAt: announcementReads.readAt,
      })
      .from(announcements)
      .leftJoin(subjects, eq(announcements.subjectId, subjects.id))
      .leftJoin(
        announcementReads,
        and(
          eq(announcementReads.announcementId, announcements.id),
          eq(announcementReads.userId, userId),
        ),
      )
      .where(
        or(
          isNull(announcements.divisionId),
          eq(announcements.divisionId, studentRow.divisionId),
        ),
      )
      .orderBy(desc(announcements.createdAt))
      .limit(MAX_ANNOUNCEMENTS),
    db
      .select({
        id: assignmentMarks.id,
        assignmentId: assignments.id,
        title: assignments.title,
        subjectCode: subjects.code,
        subjectName: subjects.name,
        subjectShort: subjects.shortName,
        status: assignmentMarks.status,
        marks: assignmentMarks.marks,
        maxMarks: assignments.maxMarks,
        remark: assignmentMarks.remark,
        markedAt: assignmentMarks.markedAt,
      })
      .from(assignmentMarks)
      .innerJoin(assignments, eq(assignmentMarks.assignmentId, assignments.id))
      .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
      .where(eq(assignmentMarks.studentId, studentRow.id))
      .orderBy(desc(assignmentMarks.markedAt))
      .limit(MAX_RECENT_MARKS),
  ]);

  const announcementItems: AnnouncementNotification[] = announcementRows
    .filter((row) => row.subjectId === null || visibleSubjectIds.has(row.subjectId))
    .map((row) => ({
      type: "announcement",
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      fileKey: row.fileKey,
      subjectCode: row.subjectCode ?? null,
      subjectName: row.subjectName ?? null,
      subjectShort: row.subjectShort ?? null,
      createdAt: row.createdAt,
      read: row.readAt !== null,
      readAt: row.readAt ?? null,
    }));

  const markItems: AssignmentMarkNotification[] = markRows.map((row) => ({
    type: "assignment_mark",
    id: row.id,
    assignmentId: row.assignmentId,
    title: row.title,
    subjectCode: row.subjectCode,
    subjectName: row.subjectName,
    subjectShort: row.subjectShort,
    status: row.status,
    marks: row.marks,
    maxMarks: row.maxMarks,
    remark: row.remark,
    createdAt: row.markedAt,
    // Marks do not have a dedicated read-receipt table in v1, so keeping them
    // read=true keeps unreadCount (unread announcements) aligned with the UI.
    read: true,
  }));

  return [...announcementItems, ...markItems].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

/**
 * Inserts `announcement_reads` rows for every unread announcement visible to
 * the given student (department-wide or their division, and either general or
 * for one of their visible subjects). Idempotent via ON CONFLICT DO NOTHING.
 */
export async function markAllAnnouncementsRead(
  userId: string,
  studentId: string,
): Promise<number> {
  const [studentRow] = await db
    .select({
      id: students.id,
      divisionId: divisions.id,
      programId: divisions.programId,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(and(eq(students.id, studentId), eq(students.userId, userId)))
    .limit(1);

  if (!studentRow) {
    return 0;
  }

  const [visibleSubjectIds, unreadRows] = await Promise.all([
    getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
    db
      .select({
        id: announcements.id,
        subjectId: announcements.subjectId,
      })
      .from(announcements)
      .leftJoin(
        announcementReads,
        and(
          eq(announcementReads.announcementId, announcements.id),
          eq(announcementReads.userId, userId),
        ),
      )
      .where(
        and(
          or(
            isNull(announcements.divisionId),
            eq(announcements.divisionId, studentRow.divisionId),
          ),
          isNull(announcementReads.id),
        ),
      ),
  ]);

  const unreadIds = unreadRows
    .filter((row) => row.subjectId === null || visibleSubjectIds.has(row.subjectId))
    .map((row) => row.id);

  if (unreadIds.length === 0) {
    return 0;
  }

  const now = new Date();
  await db
    .insert(announcementReads)
    .values(
      unreadIds.map((announcementId) => ({
        userId,
        announcementId,
        readAt: now,
      })),
    )
    .onConflictDoNothing({
      target: [announcementReads.userId, announcementReads.announcementId],
    });

  return unreadIds.length;
}
