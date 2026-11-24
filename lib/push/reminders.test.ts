import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildDue2dPayload,
  buildDueTodayPayload,
  buildNewAssignmentPayload,
  buildStatusMarkedPayload,
  getKolkataTodayRange,
  notifyNewAssignment,
  notifyStatusMarked,
  runDeadlineReminders,
} from "./reminders";
import { checkCronAuth } from "@/app/api/cron/push-reminders/route";

vi.mock("server-only", () => ({}));

const mockClaimPushLog = vi.fn();
const mockGetDue2dCandidates = vi.fn();
const mockGetDueTodayCandidates = vi.fn();
const mockGetNewAssignmentCandidates = vi.fn();
const mockGetStatusMarkedCandidate = vi.fn();

vi.mock("@/lib/db/queries/push", () => ({
  claimPushLog: (...args: unknown[]) => mockClaimPushLog(...args),
  getDue2dCandidates: (...args: unknown[]) => mockGetDue2dCandidates(...args),
  getDueTodayCandidates: (...args: unknown[]) => mockGetDueTodayCandidates(...args),
  getNewAssignmentCandidates: (...args: unknown[]) => mockGetNewAssignmentCandidates(...args),
  getStatusMarkedCandidate: (...args: unknown[]) => mockGetStatusMarkedCandidate(...args),
}));

const mockSendPushToStudent = vi.fn();
vi.mock("@/lib/push/send", () => ({
  sendPushToStudent: (...args: unknown[]) => mockSendPushToStudent(...args),
}));

const ASSIGNMENT_ID = "11111111-1111-4111-8111-111111111111";
const STUDENT_ID = "22222222-2222-4222-8222-222222222222";

describe("push reminders and event pushes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("payload builders", () => {
    it("builds due_2d payload with weekday and time in IST", () => {
      // 2026-11-26T11:30:00.000Z = 2026-11-26 17:00:00 (Thursday 5:00 PM IST)
      const dueAt = new Date("2026-11-26T11:30:00.000Z");
      const payload = buildDue2dPayload(
        ASSIGNMENT_ID,
        "Network Protocol Analysis",
        "Computer Networks",
        dueAt,
      );

      expect(payload.title).toBe("Due in 2 days: Network Protocol Analysis");
      expect(payload.body).toContain("Computer Networks · due Thursday");
      expect(payload.body).toContain("5:00 PM");
      expect(payload.url).toBe(`/assignments?open=${ASSIGNMENT_ID}`);
      expect(payload.tag).toBe(`assignment-${ASSIGNMENT_ID}`);
    });

    it("builds due_today payload with time in IST", () => {
      // 2026-11-24T18:00:00.000Z = 2026-11-24 23:30:00 (11:30 PM IST)
      const dueAt = new Date("2026-11-24T18:00:00.000Z");
      const payload = buildDueTodayPayload(
        ASSIGNMENT_ID,
        "DBMS Normalization",
        "Database Systems",
        dueAt,
      );

      expect(payload.title).toBe("Due today: DBMS Normalization");
      expect(payload.body).toContain("Database Systems · due at 11:30 PM");
      expect(payload.url).toBe(`/assignments?open=${ASSIGNMENT_ID}`);
      expect(payload.tag).toBe(`assignment-${ASSIGNMENT_ID}`);
    });

    it("builds new assignment payload with month and day in IST", () => {
      const dueAt = new Date("2026-11-30T18:29:59.000Z");
      const payload = buildNewAssignmentPayload(
        ASSIGNMENT_ID,
        "OS Scheduling Lab",
        "Operating Systems",
        dueAt,
      );

      expect(payload.title).toBe("New assignment: OS Scheduling Lab");
      expect(payload.body).toContain("Operating Systems · due Nov 30");
      expect(payload.url).toBe(`/assignments?open=${ASSIGNMENT_ID}`);
      expect(payload.tag).toBe(`assignment-${ASSIGNMENT_ID}`);
    });

    it("builds status marked payload with formatted status and marks", () => {
      const payload = buildStatusMarkedPayload(
        ASSIGNMENT_ID,
        "Compiler Design",
        "submitted",
        18,
        20,
        "Good work",
      );

      expect(payload.title).toBe("Marked Submitted: Compiler Design");
      expect(payload.body).toBe("18/20 marks · Good work");
      expect(payload.url).toBe(`/assignments?open=${ASSIGNMENT_ID}`);
      expect(payload.tag).toBe(`assignment-${ASSIGNMENT_ID}`);
    });

    it("builds status marked payload for not submitted without marks", () => {
      const payload = buildStatusMarkedPayload(
        ASSIGNMENT_ID,
        "Compiler Design",
        "not_submitted",
      );

      expect(payload.title).toBe("Marked Not submitted: Compiler Design");
      expect(payload.body).toBe("Status updated to Not submitted");
    });
  });

  describe("Asia/Kolkata date handling around midnight", () => {
    it("correctly identifies end of today at 23:30 IST", () => {
      // 2026-11-24T18:00:00.000Z is 23:30 IST on 2026-11-24
      const now = new Date("2026-11-24T18:00:00.000Z");
      const { endOfToday } = getKolkataTodayRange(now);

      // End of today in IST is 2026-11-24 23:59:59.999 IST = 2026-11-24T18:29:59.999Z
      expect(endOfToday.toISOString()).toBe("2026-11-24T18:29:59.999Z");

      // Due at 23:45 IST (18:15 UTC) is later today
      const dueSoon = new Date("2026-11-24T18:15:00.000Z");
      expect(dueSoon.getTime()).toBeGreaterThan(now.getTime());
      expect(dueSoon.getTime()).toBeLessThanOrEqual(endOfToday.getTime());

      // Due at 00:15 IST next day (18:45 UTC) is tomorrow, NOT today
      const dueTomorrow = new Date("2026-11-24T18:45:00.000Z");
      expect(dueTomorrow.getTime()).toBeGreaterThan(endOfToday.getTime());
    });

    it("correctly starts a new day at 00:30 IST", () => {
      // 2026-11-24T19:00:00.000Z is 00:30 IST on 2026-11-25
      const now = new Date("2026-11-24T19:00:00.000Z");
      const { startOfToday, endOfToday } = getKolkataTodayRange(now);

      // Start of 2026-11-25 IST is 2026-11-24T18:30:00.000Z
      expect(startOfToday.toISOString()).toBe("2026-11-24T18:30:00.000Z");
      // End of 2026-11-25 IST is 2026-11-25T18:29:59.999Z
      expect(endOfToday.toISOString()).toBe("2026-11-25T18:29:59.999Z");
    });
  });

  describe("runDeadlineReminders", () => {
    it("claims and sends deadline pushes, skipping already claimed on second run", async () => {
      const candidate = {
        assignmentId: ASSIGNMENT_ID,
        assignmentTitle: "Data Structures Lab",
        subjectName: "Data Structures",
        dueAt: new Date("2026-11-26T12:00:00.000Z"),
        studentId: STUDENT_ID,
      };

      mockGetDue2dCandidates.mockResolvedValue([candidate]);
      mockGetDueTodayCandidates.mockResolvedValue([]);
      mockSendPushToStudent.mockResolvedValue({ sent: 1, failed: 0 });

      // First run: claim succeeds
      mockClaimPushLog.mockResolvedValueOnce(true);
      const res1 = await runDeadlineReminders(new Date("2026-11-24T12:00:00.000Z"));

      expect(res1).toEqual({ checked: 1, sent: 1, failed: 0 });
      expect(mockClaimPushLog).toHaveBeenCalledWith(ASSIGNMENT_ID, STUDENT_ID, "due_2d");
      expect(mockSendPushToStudent).toHaveBeenCalledTimes(1);

      // Second run: claim returns false (already claimed)
      mockClaimPushLog.mockResolvedValueOnce(false);
      const res2 = await runDeadlineReminders(new Date("2026-11-24T12:00:00.000Z"));

      expect(res2).toEqual({ checked: 1, sent: 0, failed: 0 });
      expect(mockSendPushToStudent).toHaveBeenCalledTimes(1); // not called again
    });
  });

  describe("notifyNewAssignment", () => {
    it("claims and sends new assignment notification", async () => {
      mockGetNewAssignmentCandidates.mockResolvedValueOnce([
        {
          assignmentId: ASSIGNMENT_ID,
          assignmentTitle: "AI Assignment 1",
          subjectName: "Artificial Intelligence",
          dueAt: new Date("2026-12-01T12:00:00.000Z"),
          studentId: STUDENT_ID,
        },
      ]);
      mockClaimPushLog.mockResolvedValueOnce(true);
      mockSendPushToStudent.mockResolvedValueOnce({ sent: 1, failed: 0 });

      const res = await notifyNewAssignment(ASSIGNMENT_ID);
      expect(res).toEqual({ sent: 1, failed: 0 });
      expect(mockClaimPushLog).toHaveBeenCalledWith(ASSIGNMENT_ID, STUDENT_ID, "new");
      expect(mockSendPushToStudent).toHaveBeenCalledTimes(1);
    });

    it("skips if already claimed", async () => {
      mockGetNewAssignmentCandidates.mockResolvedValueOnce([
        {
          assignmentId: ASSIGNMENT_ID,
          assignmentTitle: "AI Assignment 1",
          subjectName: "Artificial Intelligence",
          dueAt: new Date("2026-12-01T12:00:00.000Z"),
          studentId: STUDENT_ID,
        },
      ]);
      mockClaimPushLog.mockResolvedValueOnce(false);

      const res = await notifyNewAssignment(ASSIGNMENT_ID);
      expect(res).toEqual({ sent: 0, failed: 0 });
      expect(mockSendPushToStudent).not.toHaveBeenCalled();
    });
  });

  describe("notifyStatusMarked", () => {
    it("returns { sent: 0, failed: 0 } if candidate is null (setting off or inactive)", async () => {
      mockGetStatusMarkedCandidate.mockResolvedValueOnce(null);

      const res = await notifyStatusMarked(ASSIGNMENT_ID, STUDENT_ID);
      expect(res).toEqual({ sent: 0, failed: 0 });
      expect(mockClaimPushLog).not.toHaveBeenCalled();
      expect(mockSendPushToStudent).not.toHaveBeenCalled();
    });

    it("claims and sends status notification when candidate exists", async () => {
      mockGetStatusMarkedCandidate.mockResolvedValueOnce({
        assignmentId: ASSIGNMENT_ID,
        assignmentTitle: "Compiler Project",
        subjectName: "Compiler Design",
        studentId: STUDENT_ID,
        status: "submitted",
        marks: 25,
        maxMarks: 25,
        remark: "Full marks",
      });
      mockClaimPushLog.mockResolvedValueOnce(true);
      mockSendPushToStudent.mockResolvedValueOnce({ sent: 1, failed: 0 });

      const res = await notifyStatusMarked(ASSIGNMENT_ID, STUDENT_ID);
      expect(res).toEqual({ sent: 1, failed: 0 });
      expect(mockClaimPushLog).toHaveBeenCalledWith(ASSIGNMENT_ID, STUDENT_ID, "status");
      expect(mockSendPushToStudent).toHaveBeenCalledTimes(1);
    });
  });

  describe("checkCronAuth (pure function)", () => {
    it("returns 500 when CRON_SECRET is not configured", () => {
      const result = checkCronAuth("Bearer secret123", undefined);
      expect(result).toEqual({
        ok: false,
        status: 500,
        message: "CRON_SECRET is not configured on the server.",
      });
    });

    it("returns 401 when Authorization header is missing or wrong", () => {
      expect(checkCronAuth(null, "secret123")).toEqual({
        ok: false,
        status: 401,
        message: "Unauthorized: Invalid or missing authorization header.",
      });

      expect(checkCronAuth("Bearer wrong", "secret123")).toEqual({
        ok: false,
        status: 401,
        message: "Unauthorized: Invalid or missing authorization header.",
      });
    });

    it("returns ok: true when Authorization matches Bearer CRON_SECRET", () => {
      const result = checkCronAuth("Bearer my-secret-token", "my-secret-token");
      expect(result).toEqual({ ok: true });
    });
  });
});
