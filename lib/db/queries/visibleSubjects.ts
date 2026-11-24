import "server-only";
import { and, eq, lte } from "drizzle-orm";
import { db } from "@/lib/db";
import { programSubjects, studentElectives } from "@/lib/db/schema";

/**
 * Returns the set of subject IDs visible to a student across their open
 * semesters (3 .. currentSemester): all core subjects of their program plus
 * the elective options they picked in student_electives.
 */
export async function getVisibleSubjectIds(
  studentId: string,
  programId: string,
  currentSemester: number,
): Promise<Set<string>> {
  const [coreRows, electiveRows] = await Promise.all([
    db
      .select({ subjectId: programSubjects.subjectId })
      .from(programSubjects)
      .where(
        and(
          eq(programSubjects.programId, programId),
          eq(programSubjects.kind, "core"),
          lte(programSubjects.semester, currentSemester),
        ),
      ),
    db
      .select({ subjectId: studentElectives.subjectId })
      .from(studentElectives)
      .where(
        and(
          eq(studentElectives.studentId, studentId),
          eq(studentElectives.programId, programId),
        ),
      ),
  ]);

  const ids = new Set<string>();
  for (const row of coreRows) {
    ids.add(row.subjectId);
  }
  for (const row of electiveRows) {
    ids.add(row.subjectId);
  }
  return ids;
}
