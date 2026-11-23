import "server-only";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { divisions, programs, students } from "@/lib/db/schema";
import {
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
  type SessionPayload,
} from "./cookie";

export type { SessionPayload };

export type SessionStudent = {
  studentId: string;
  userId: string;
  email: string;
  firstName: string;
  fullName: string;
  divisionCode: string;
  programCode: string;
  semester: number;
};

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is required.");
  }
  return secret;
}

function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/**
 * Sets the signed httpOnly `weave_session` cookie for 30 days.
 */
export async function createSession(studentId: string, userId: string): Promise<void> {
  const token = signSessionToken(studentId, userId, getSessionSecret());
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(SESSION_MAX_AGE_SECONDS));
}

/**
 * Reads and verifies the `weave_session` cookie. Returns null if missing,
 * expired, malformed, or tampered with.
 */
export async function readSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }

  return verifySessionToken(raw, getSessionSecret());
}

/**
 * Clears the `weave_session` cookie.
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", sessionCookieOptions(0));
}

/**
 * Resolves the signed-in active student in a single query. Memoized per request
 * so the layout and page share one database round-trip.
 */
export const getSessionStudent = cache(async (): Promise<SessionStudent | null> => {
  const session = await readSession();
  if (!session) {
    return null;
  }

  const [row] = await db
    .select({
      studentId: students.id,
      email: students.email,
      fullName: students.fullName,
      divisionName: divisions.name,
      programCode: programs.code,
      currentSemester: divisions.currentSemester,
    })
    .from(students)
    .innerJoin(divisions, eq(students.divisionId, divisions.id))
    .innerJoin(programs, eq(divisions.programId, programs.id))
    .where(
      and(
        eq(students.id, session.studentId),
        eq(students.userId, session.userId),
        eq(students.status, "active"),
      ),
    )
    .limit(1);

  if (!row) {
    return null;
  }

  const firstName = row.fullName.trim().split(/\s+/)[0] ?? row.fullName;

  return {
    studentId: row.studentId,
    userId: session.userId,
    email: row.email,
    firstName,
    fullName: row.fullName,
    divisionCode: row.divisionName,
    programCode: row.programCode,
    semester: row.currentSemester,
  };
});
