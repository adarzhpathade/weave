import "server-only";
import { and, eq } from "drizzle-orm";
import type { ProfileData } from "@/components/profile/types";
import { db } from "@/lib/db";
import { divisions, programs, students } from "@/lib/db/schema";

/**
 * Loads the signed-in student's profile details and notification preferences
 * in a single query.
 */
export async function getProfile(studentId: string): Promise<ProfileData | null> {
  const [row] = await db
    .select({
      fullName: students.fullName,
      email: students.email,
      enrollmentNo: students.enrollmentNo,
      programCode: programs.code,
      divisionCode: divisions.name,
      semester: divisions.currentSemester,
      phone: students.phone,
      notifyDeadline: students.notifyDeadline,
      notifyNewAssignment: students.notifyNewAssignment,
      notifyStatus: students.notifyStatus,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .innerJoin(programs, eq(divisions.programId, programs.id))
    .where(and(eq(students.id, studentId), eq(students.status, "active")))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    fullName: row.fullName,
    email: row.email,
    enrollmentNo: row.enrollmentNo,
    programCode: row.programCode,
    divisionCode: row.divisionCode,
    semester: row.semester,
    phone: row.phone,
    notify: {
      deadline: row.notifyDeadline,
      newAssignment: row.notifyNewAssignment,
      status: row.notifyStatus,
    },
  };
}
