import "server-only";
import {
  claimPushLog,
  getDue2dCandidates,
  getDueTodayCandidates,
  getNewAssignmentCandidates,
  getStatusMarkedCandidate,
} from "@/lib/db/queries/push";
import { sendPushToStudent, type PushPayload } from "./send";

export const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

/**
 * Calculates start and end of today in Asia/Kolkata (IST).
 */
export function getKolkataTodayRange(referenceDate: Date = new Date()): {
  now: Date;
  startOfToday: Date;
  endOfToday: Date;
} {
  const kolkataTime = new Date(referenceDate.getTime() + IST_OFFSET_MS);

  const year = kolkataTime.getUTCFullYear();
  const month = kolkataTime.getUTCMonth();
  const date = kolkataTime.getUTCDate();

  const startOfToday = new Date(Date.UTC(year, month, date) - IST_OFFSET_MS);
  const endOfToday = new Date(Date.UTC(year, month, date + 1) - IST_OFFSET_MS - 1);

  return {
    now: referenceDate,
    startOfToday,
    endOfToday,
  };
}

export function buildDue2dPayload(
  assignmentId: string,
  assignmentTitle: string,
  subjectName: string,
  dueAt: Date,
): PushPayload {
  const timeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "long",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dueAt);

  return {
    title: `Due in 2 days: ${assignmentTitle}`,
    body: `${subjectName} · due ${timeStr}`,
    url: `/assignments?open=${assignmentId}`,
    tag: `assignment-${assignmentId}`,
  };
}

export function buildDueTodayPayload(
  assignmentId: string,
  assignmentTitle: string,
  subjectName: string,
  dueAt: Date,
): PushPayload {
  const timeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dueAt);

  return {
    title: `Due today: ${assignmentTitle}`,
    body: `${subjectName} · due at ${timeStr}`,
    url: `/assignments?open=${assignmentId}`,
    tag: `assignment-${assignmentId}`,
  };
}

export function buildNewAssignmentPayload(
  assignmentId: string,
  assignmentTitle: string,
  subjectName: string,
  dueAt: Date,
): PushPayload {
  const dateStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
  }).format(dueAt);

  return {
    title: `New assignment: ${assignmentTitle}`,
    body: `${subjectName} · due ${dateStr}`,
    url: `/assignments?open=${assignmentId}`,
    tag: `assignment-${assignmentId}`,
  };
}

export function buildStatusMarkedPayload(
  assignmentId: string,
  assignmentTitle: string,
  status: "submitted" | "late" | "not_submitted",
  marks?: number | null,
  maxMarks?: number | null,
  remark?: string | null,
): PushPayload {
  const statusLabel =
    status === "submitted"
      ? "Submitted"
      : status === "late"
        ? "Late"
        : "Not submitted";

  let body = "";
  if (marks !== null && marks !== undefined) {
    body = maxMarks ? `${marks}/${maxMarks} marks` : `${marks} marks`;
    if (remark) {
      body += ` · ${remark}`;
    }
  } else if (remark) {
    body = remark;
  } else {
    body = `Status updated to ${statusLabel}`;
  }

  return {
    title: `Marked ${statusLabel}: ${assignmentTitle}`,
    body,
    url: `/assignments?open=${assignmentId}`,
    tag: `assignment-${assignmentId}`,
  };
}

/**
 * Finds every reminder that is due now and sends it. Safe to run many times (no duplicates).
 */
export async function runDeadlineReminders(
  now?: Date,
): Promise<{ checked: number; sent: number; failed: number }> {
  const currentNow = now ?? new Date();
  const { endOfToday } = getKolkataTodayRange(currentNow);

  const window2dStart = new Date(currentNow.getTime() + 24 * 60 * 60 * 1000);
  const window2dEnd = new Date(currentNow.getTime() + 48 * 60 * 60 * 1000);

  const [candidates2d, candidatesToday] = await Promise.all([
    getDue2dCandidates(window2dStart, window2dEnd),
    getDueTodayCandidates(currentNow, endOfToday),
  ]);

  let checked = 0;
  let sent = 0;
  let failed = 0;

  for (const c of candidates2d) {
    checked++;
    const claimed = await claimPushLog(c.assignmentId, c.studentId, "due_2d");
    if (!claimed) {
      continue;
    }

    const payload = buildDue2dPayload(
      c.assignmentId,
      c.assignmentTitle,
      c.subjectName,
      c.dueAt,
    );
    const res = await sendPushToStudent(c.studentId, payload);
    sent += res.sent;
    failed += res.failed;
  }

  for (const c of candidatesToday) {
    checked++;
    const claimed = await claimPushLog(c.assignmentId, c.studentId, "due_today");
    if (!claimed) {
      continue;
    }

    const payload = buildDueTodayPayload(
      c.assignmentId,
      c.assignmentTitle,
      c.subjectName,
      c.dueAt,
    );
    const res = await sendPushToStudent(c.studentId, payload);
    sent += res.sent;
    failed += res.failed;
  }

  return { checked, sent, failed };
}

/**
 * Call after an assignment is created (faculty task, later).
 */
export async function notifyNewAssignment(
  assignmentId: string,
): Promise<{ sent: number; failed: number }> {
  const candidates = await getNewAssignmentCandidates(assignmentId);
  let sent = 0;
  let failed = 0;

  for (const c of candidates) {
    const claimed = await claimPushLog(c.assignmentId, c.studentId, "new");
    if (!claimed) {
      continue;
    }

    const payload = buildNewAssignmentPayload(
      c.assignmentId,
      c.assignmentTitle,
      c.subjectName,
      c.dueAt,
    );
    const res = await sendPushToStudent(c.studentId, payload);
    sent += res.sent;
    failed += res.failed;
  }

  return { sent, failed };
}

/**
 * Call after a teacher marks a student (faculty task, later).
 */
export async function notifyStatusMarked(
  assignmentId: string,
  studentId: string,
): Promise<{ sent: number; failed: number }> {
  const candidate = await getStatusMarkedCandidate(assignmentId, studentId);
  if (!candidate) {
    return { sent: 0, failed: 0 };
  }

  const claimed = await claimPushLog(assignmentId, studentId, "status");
  if (!claimed) {
    return { sent: 0, failed: 0 };
  }

  const payload = buildStatusMarkedPayload(
    candidate.assignmentId,
    candidate.assignmentTitle,
    candidate.status,
    candidate.marks,
    candidate.maxMarks,
    candidate.remark,
  );

  return await sendPushToStudent(studentId, payload);
}
