import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { departments, divisions, programs, students } from "@/lib/db/schema";

export type StudentByEmail = {
  id: string;
  userId: string | null;
  email: string;
  fullName: string;
  enrollmentNo: string;
  phone: string | null;
  status: "active" | "inactive";
  notifyDeadline: boolean;
  notifyNewAssignment: boolean;
  notifyStatus: boolean;
  division: {
    id: string;
    name: string;
    admissionYear: number;
    currentSemester: number;
  };
  program: {
    id: string;
    code: string;
    name: string;
  };
  department: {
    id: string;
    code: string;
    name: string;
  };
};

/**
 * Looks up a student on the department list by email (normalized lowercase).
 * Used by the sign-in gate and server session resolution.
 */
export async function getStudentByEmail(email: string): Promise<StudentByEmail | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  const [row] = await db
    .select({
      id: students.id,
      userId: students.userId,
      email: students.email,
      fullName: students.fullName,
      enrollmentNo: students.enrollmentNo,
      phone: students.phone,
      status: students.status,
      notifyDeadline: students.notifyDeadline,
      notifyNewAssignment: students.notifyNewAssignment,
      notifyStatus: students.notifyStatus,
      divisionId: divisions.id,
      divisionName: divisions.name,
      admissionYear: divisions.admissionYear,
      currentSemester: divisions.currentSemester,
      programId: programs.id,
      programCode: programs.code,
      programName: programs.name,
      departmentId: departments.id,
      departmentCode: departments.code,
      departmentName: departments.name,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .innerJoin(programs, eq(divisions.programId, programs.id))
    .innerJoin(departments, eq(programs.departmentId, departments.id))
    .where(eq(students.email, normalized))
    .limit(1);

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    userId: row.userId,
    email: row.email,
    fullName: row.fullName,
    enrollmentNo: row.enrollmentNo,
    phone: row.phone,
    status: row.status,
    notifyDeadline: row.notifyDeadline,
    notifyNewAssignment: row.notifyNewAssignment,
    notifyStatus: row.notifyStatus,
    division: {
      id: row.divisionId,
      name: row.divisionName,
      admissionYear: row.admissionYear,
      currentSemester: row.currentSemester,
    },
    program: {
      id: row.programId,
      code: row.programCode,
      name: row.programName,
    },
    department: {
      id: row.departmentId,
      code: row.departmentCode,
      name: row.departmentName,
    },
  };
}
