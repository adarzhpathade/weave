import "server-only";
import { and, asc, desc, eq, gte, isNotNull, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  announcementReads,
  announcements,
  assignmentDivisions,
  assignmentMarks,
  assignments,
  divisions,
  noteLinks,
  notes,
  students,
  subjects,
  topics,
  units,
} from "@/lib/db/schema";
import { getVisibleSubjectIds } from "./visibleSubjects";

export type HomeStudentSummary = {
  firstName: string;
  divisionCode: string;
  semester: number;
};

export type HomeDueNext = {
  title: string;
  subjectName: string;
  subjectCode: string;
  dueAt: Date;
};

export type HomeWeekItem = {
  dueAt: Date;
  label: string;
};

export type HomeLastNote = {
  id: string;
  title: string;
  subjectShort: string | null;
  unitOrder: number | null;
  updatedAt: Date;
};

export type HomeData = {
  student: HomeStudentSummary;
  dueNext: HomeDueNext | null;
  thisWeek: HomeWeekItem[];
  lastNote: HomeLastNote | null;
  unreadCount: number;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Loads all data needed for the student Home screen scoped strictly to the
 * given student (their division, open semesters, picked electives, own notes,
 * and unread announcements).
 */
export async function getHomeData(studentId: string): Promise<HomeData | null> {
  const [studentRow] = await db
    .select({
      id: students.id,
      userId: students.userId,
      fullName: students.fullName,
      divisionId: divisions.id,
      divisionName: divisions.name,
      currentSemester: divisions.currentSemester,
      programId: divisions.programId,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .where(eq(students.id, studentId))
    .limit(1);

  if (!studentRow) {
    return null;
  }

  const now = new Date();
  const weekEnd = new Date(now.getTime() + SEVEN_DAYS_MS);

  const [visibleSubjectIds, upcomingAssignments, lastNoteRows, divisionAnnouncements] =
    await Promise.all([
      getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
      db
        .select({
          title: assignments.title,
          dueAt: assignments.dueAt,
          subjectId: subjects.id,
          subjectName: subjects.name,
          subjectCode: subjects.code,
          subjectShort: subjects.shortName,
          markId: assignmentMarks.id,
        })
        .from(assignments)
        .innerJoin(assignmentDivisions, eq(assignmentDivisions.assignmentId, assignments.id))
        .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
        .leftJoin(
          assignmentMarks,
          and(
            eq(assignmentMarks.assignmentId, assignments.id),
            eq(assignmentMarks.studentId, studentRow.id),
          ),
        )
        .where(
          and(
            eq(assignmentDivisions.divisionId, studentRow.divisionId),
            gte(assignments.dueAt, now),
            isNull(assignmentMarks.id),
          ),
        )
        .orderBy(asc(assignments.dueAt)),
      studentRow.userId
        ? db
            .select({
              id: notes.id,
              title: notes.title,
              updatedAt: notes.updatedAt,
              subjectShort: subjects.shortName,
              unitOrder: units.order,
            })
            .from(notes)
            .leftJoin(
              noteLinks,
              and(eq(noteLinks.noteId, notes.id), isNotNull(noteLinks.topicId)),
            )
            .leftJoin(topics, eq(noteLinks.topicId, topics.id))
            .leftJoin(units, eq(topics.unitId, units.id))
            .leftJoin(subjects, eq(units.subjectId, subjects.id))
            .where(eq(notes.ownerId, studentRow.userId))
            .orderBy(desc(notes.updatedAt), asc(noteLinks.createdAt))
            .limit(1)
        : Promise.resolve([]),
      studentRow.userId
        ? db
            .select({
              id: announcements.id,
              subjectId: announcements.subjectId,
              readId: announcementReads.id,
            })
            .from(announcements)
            .leftJoin(
              announcementReads,
              and(
                eq(announcementReads.announcementId, announcements.id),
                eq(announcementReads.userId, studentRow.userId),
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
            )
        : db
            .select({
              id: announcements.id,
              subjectId: announcements.subjectId,
            })
            .from(announcements)
            .where(
              or(
                isNull(announcements.divisionId),
                eq(announcements.divisionId, studentRow.divisionId),
              ),
            ),
    ]);

  const scopedUpcoming = upcomingAssignments.filter((item) =>
    visibleSubjectIds.has(item.subjectId),
  );

  const firstDue = scopedUpcoming[0];
  const dueNext: HomeDueNext | null = firstDue
    ? {
        title: firstDue.title,
        subjectName: firstDue.subjectName,
        subjectCode: firstDue.subjectCode,
        dueAt: firstDue.dueAt,
      }
    : null;

  const thisWeek: HomeWeekItem[] = scopedUpcoming
    .filter((item) => item.dueAt.getTime() <= weekEnd.getTime())
    .map((item) => ({
      dueAt: item.dueAt,
      label: `${item.subjectShort} · ${item.title}`,
    }));

  const rawLastNote = lastNoteRows[0];
  const lastNote: HomeLastNote | null = rawLastNote
    ? {
        id: rawLastNote.id,
        title: rawLastNote.title,
        subjectShort: rawLastNote.subjectShort ?? null,
        unitOrder: rawLastNote.unitOrder ?? null,
        updatedAt: rawLastNote.updatedAt,
      }
    : null;

  const unreadCount = divisionAnnouncements.filter(
    (ann) => ann.subjectId === null || visibleSubjectIds.has(ann.subjectId),
  ).length;

  const firstName = studentRow.fullName.trim().split(/\s+/)[0] ?? studentRow.fullName;

  return {
    student: {
      firstName,
      divisionCode: studentRow.divisionName,
      semester: studentRow.currentSemester,
    },
    dueNext,
    thisWeek,
    lastNote,
    unreadCount,
  };
}
