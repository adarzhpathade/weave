import "server-only";
import { and, asc, eq } from "drizzle-orm";
import type { AssignmentItem, AssignmentsPageData } from "@/components/assignments/types";
import { db } from "@/lib/db";
import {
  assignmentDivisions,
  assignmentMarks,
  assignments,
  divisions,
  students,
  subjects,
  units,
  users,
} from "@/lib/db/schema";
import { getVisibleSubjectIds } from "./visibleSubjects";

/**
 * Loads all assignments visible to the signed-in student (assigned to their
 * division and belonging to a subject in their open semesters / picked
 * electives), left-joined with their own mark row (absent mark → "pending").
 */
export async function getAssignmentsPage(studentId: string): Promise<AssignmentsPageData | null> {
  const [studentRow] = await db
    .select({
      id: students.id,
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

  const [visibleSubjectIds, rows] = await Promise.all([
    getVisibleSubjectIds(studentRow.id, studentRow.programId, studentRow.currentSemester),
    db
      .select({
        id: assignments.id,
        title: assignments.title,
        description: assignments.description,
        dueAt: assignments.dueAt,
        maxMarks: assignments.maxMarks,
        subjectId: subjects.id,
        subjectCode: subjects.code,
        subjectName: subjects.name,
        subjectShort: subjects.shortName,
        unitOrder: units.order,
        unitTitle: units.title,
        givenBy: users.name,
        markStatus: assignmentMarks.status,
        marks: assignmentMarks.marks,
        remark: assignmentMarks.remark,
      })
      .from(assignments)
      .innerJoin(assignmentDivisions, eq(assignmentDivisions.assignmentId, assignments.id))
      .innerJoin(subjects, eq(assignments.subjectId, subjects.id))
      .leftJoin(units, eq(assignments.unitId, units.id))
      .leftJoin(users, eq(assignments.createdBy, users.id))
      .leftJoin(
        assignmentMarks,
        and(
          eq(assignmentMarks.assignmentId, assignments.id),
          eq(assignmentMarks.studentId, studentRow.id),
        ),
      )
      .where(eq(assignmentDivisions.divisionId, studentRow.divisionId))
      .orderBy(asc(assignments.dueAt), asc(assignments.createdAt)),
  ]);

  const items: AssignmentItem[] = rows
    .filter((row) => visibleSubjectIds.has(row.subjectId))
    .map((row) => ({
      id: row.id,
      title: row.title,
      subjectCode: row.subjectCode,
      subjectName: row.subjectName,
      subjectShort: row.subjectShort,
      unitLabel:
        row.unitOrder !== null && row.unitTitle !== null
          ? `${row.unitOrder} · ${row.unitTitle}`
          : null,
      givenBy: row.givenBy ?? null,
      dueAt: row.dueAt.toISOString(),
      maxMarks: row.maxMarks ?? null,
      marks: row.marks ?? null,
      remark: row.remark ?? null,
      description: row.description.trim().length > 0 ? row.description : null,
      status: row.markStatus ?? "pending",
    }));

  return {
    divisionCode: studentRow.divisionName,
    semester: studentRow.currentSemester,
    now: now.toISOString(),
    items,
  };
}
