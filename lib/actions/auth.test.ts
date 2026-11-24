import { beforeEach, describe, expect, it, vi } from "vitest";
import { requestSignInCode, signIn, signOut, verifySignInCode } from "./auth";

vi.mock("server-only", () => ({}));

const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

const mockSendEmailCode = vi.fn();
const mockVerifyEmailCode = vi.fn();
const mockAuthSignOut = vi.fn();

vi.mock("@/lib/auth/server", () => ({
  auth: {
    signOut: () => mockAuthSignOut(),
  },
  sendEmailCode: (email: string) => mockSendEmailCode(email),
  verifyEmailCode: (email: string, code: string) => mockVerifyEmailCode(email, code),
}));

const mockCreateSession = vi.fn();
const mockDestroySession = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  createSession: (studentId: string, userId: string) => mockCreateSession(studentId, userId),
  destroySession: () => mockDestroySession(),
}));

const mockGetStudentByEmail = vi.fn();
const mockEnsureStudentUser = vi.fn();

vi.mock("@/lib/db/queries", () => ({
  getStudentByEmail: (email: string) => mockGetStudentByEmail(email),
  ensureStudentUser: (studentId: string, email: string, name: string) =>
    mockEnsureStudentUser(studentId, email, name),
}));

const mockLinkStudentToAuthUser = vi.fn();

vi.mock("@/lib/db/queries/students", () => ({
  linkStudentToAuthUser: (studentId: string, authUserId: string, email: string, name: string) =>
    mockLinkStudentToAuthUser(studentId, authUserId, email, name),
}));

vi.mock("@/lib/env", () => ({
  env: {
    ALLOWED_EMAIL_DOMAINS: [],
  },
}));

const DEMO_EMAIL = "demo.student@weave.test";
const ACTIVE_STUDENT_EMAIL = "student@example.com";
const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const AUTH_USER_ID = "33333333-3333-4333-8333-333333333333";

describe("auth actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.DEMO_STUDENT_EMAIL = DEMO_EMAIL;
  });

  describe("requestSignInCode", () => {
    it("rejects invalid email formats", async () => {
      const res = await requestSignInCode("not-an-email");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "INVALID_EMAIL",
          message: "Enter your college email.",
        },
      });
      expect(mockSendEmailCode).not.toHaveBeenCalled();
    });

    it("rejects email not found on the student list", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce(null);

      const res = await requestSignInCode("unknown@example.com");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: "This email isn't on the CSIT student list.",
        },
      });
      expect(mockSendEmailCode).not.toHaveBeenCalled();
    });

    it("rejects inactive students", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: "inactive@example.com",
        fullName: "Inactive Student",
        status: "inactive",
      });

      const res = await requestSignInCode("inactive@example.com");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: "This email isn't on the CSIT student list.",
        },
      });
      expect(mockSendEmailCode).not.toHaveBeenCalled();
    });

    it("demo email skips the code and creates a session directly", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        userId: USER_ID,
        email: DEMO_EMAIL,
        fullName: "Demo Student",
        status: "active",
      });

      const res = await requestSignInCode(DEMO_EMAIL);
      expect(res).toEqual({
        ok: true,
        data: { demo: true },
      });
      expect(mockSendEmailCode).not.toHaveBeenCalled();
      expect(mockCreateSession).toHaveBeenCalledWith(STUDENT_ID, USER_ID);
    });

    it("sends a code for an active listed student", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: ACTIVE_STUDENT_EMAIL,
        fullName: "Active Student",
        status: "active",
      });
      mockSendEmailCode.mockResolvedValueOnce({ ok: true });

      const res = await requestSignInCode(ACTIVE_STUDENT_EMAIL);
      expect(res).toEqual({
        ok: true,
        data: { demo: false },
      });
      expect(mockSendEmailCode).toHaveBeenCalledWith(ACTIVE_STUDENT_EMAIL);
    });

    it("handles rate limiting when sending code", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: ACTIVE_STUDENT_EMAIL,
        fullName: "Active Student",
        status: "active",
      });
      mockSendEmailCode.mockResolvedValueOnce({ ok: false, error: "rate_limited" });

      const res = await requestSignInCode(ACTIVE_STUDENT_EMAIL);
      expect(res).toEqual({
        ok: false,
        error: {
          code: "TOO_MANY_TRIES",
          message: "Too many tries. Wait a minute and try again.",
        },
      });
    });

    it("handles generic failure when sending code", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: ACTIVE_STUDENT_EMAIL,
        fullName: "Active Student",
        status: "active",
      });
      mockSendEmailCode.mockResolvedValueOnce({ ok: false, error: "failed" });

      const res = await requestSignInCode(ACTIVE_STUDENT_EMAIL);
      expect(res).toEqual({
        ok: false,
        error: {
          code: "SIGN_IN_FAILED",
          message: "Couldn't sign you in right now. Please try again.",
        },
      });
    });
  });

  describe("verifySignInCode", () => {
    it("rejects invalid email formats", async () => {
      const res = await verifySignInCode("invalid", "123456");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "INVALID_EMAIL",
          message: "Enter your college email.",
        },
      });
    });

    it("rejects invalid code formats (not 6 digits)", async () => {
      const res1 = await verifySignInCode(ACTIVE_STUDENT_EMAIL, "12345");
      expect(res1).toEqual({
        ok: false,
        error: {
          code: "INVALID_CODE",
          message: "That code is wrong or has expired. Try again.",
        },
      });

      const res2 = await verifySignInCode(ACTIVE_STUDENT_EMAIL, "abcdef");
      expect(res2).toEqual({
        ok: false,
        error: {
          code: "INVALID_CODE",
          message: "That code is wrong or has expired. Try again.",
        },
      });
    });

    it("rejects when student is not on the active list", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce(null);

      const res = await verifySignInCode(ACTIVE_STUDENT_EMAIL, "123456");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "NOT_ON_LIST",
          message: "This email isn't on the CSIT student list.",
        },
      });
      expect(mockVerifyEmailCode).not.toHaveBeenCalled();
    });

    it("returns INVALID_CODE when verifyEmailCode returns invalid_code", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: ACTIVE_STUDENT_EMAIL,
        fullName: "Active Student",
        status: "active",
      });
      mockVerifyEmailCode.mockResolvedValueOnce({ ok: false, error: "invalid_code" });

      const res = await verifySignInCode(ACTIVE_STUDENT_EMAIL, "123456");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "INVALID_CODE",
          message: "That code is wrong or has expired. Try again.",
        },
      });
    });

    it("returns TOO_MANY_TRIES when verifyEmailCode is rate limited", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: ACTIVE_STUDENT_EMAIL,
        fullName: "Active Student",
        status: "active",
      });
      mockVerifyEmailCode.mockResolvedValueOnce({ ok: false, error: "rate_limited" });

      const res = await verifySignInCode(ACTIVE_STUDENT_EMAIL, "123456");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "TOO_MANY_TRIES",
          message: "Too many tries. Wait a minute and try again.",
        },
      });
    });

    it("links user and creates session on valid code", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        email: ACTIVE_STUDENT_EMAIL,
        fullName: "Active Student",
        status: "active",
      });
      mockVerifyEmailCode.mockResolvedValueOnce({
        ok: true,
        user: { id: AUTH_USER_ID, email: ACTIVE_STUDENT_EMAIL, name: "Active Student" },
      });
      mockLinkStudentToAuthUser.mockResolvedValueOnce(USER_ID);

      const res = await verifySignInCode(ACTIVE_STUDENT_EMAIL, "123456");
      expect(res).toEqual({
        ok: true,
        data: { studentId: STUDENT_ID },
      });
      expect(mockLinkStudentToAuthUser).toHaveBeenCalledWith(
        STUDENT_ID,
        AUTH_USER_ID,
        ACTIVE_STUDENT_EMAIL,
        "Active Student",
      );
      expect(mockCreateSession).toHaveBeenCalledWith(STUDENT_ID, USER_ID);
    });
  });

  describe("signIn", () => {
    it("rejects non-demo email with CODE_REQUIRED", async () => {
      const res = await signIn(ACTIVE_STUDENT_EMAIL);
      expect(res).toEqual({
        ok: false,
        error: {
          code: "CODE_REQUIRED",
          message: "We've moved to email codes. Request a code to sign in.",
        },
      });
    });

    it("rejects invalid email formats", async () => {
      const res = await signIn("bad-email");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "INVALID_EMAIL",
          message: "Enter your college email.",
        },
      });
    });

    it("signs in demo student successfully", async () => {
      mockGetStudentByEmail.mockResolvedValueOnce({
        id: STUDENT_ID,
        userId: USER_ID,
        email: DEMO_EMAIL,
        fullName: "Demo Student",
        status: "active",
      });

      const res = await signIn(DEMO_EMAIL);
      expect(res).toEqual({
        ok: true,
        data: { studentId: STUDENT_ID },
      });
      expect(mockCreateSession).toHaveBeenCalledWith(STUDENT_ID, USER_ID);
    });
  });

  describe("signOut", () => {
    it("calls auth.signOut, destroySession, and redirects to /login", async () => {
      mockAuthSignOut.mockResolvedValueOnce({});
      await signOut();
      expect(mockAuthSignOut).toHaveBeenCalled();
      expect(mockDestroySession).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
  });
});
