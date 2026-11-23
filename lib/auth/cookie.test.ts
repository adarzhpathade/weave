import { describe, expect, it } from "vitest";
import {
  hasValidSessionFormat,
  SESSION_MAX_AGE_SECONDS,
  signSessionToken,
  verifySessionToken,
} from "./cookie";

const TEST_SECRET = "test-session-secret-at-least-32-chars-long";
const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";

describe("session cookie token", () => {
  it("signs and verifies a valid token", () => {
    const now = Math.floor(Date.now() / 1000);
    const token = signSessionToken(STUDENT_ID, USER_ID, TEST_SECRET, now);

    expect(hasValidSessionFormat(token)).toBe(true);
    expect(verifySessionToken(token, TEST_SECRET)).toEqual({
      studentId: STUDENT_ID,
      userId: USER_ID,
      expiresAt: now + SESSION_MAX_AGE_SECONDS,
    });
  });

  it("rejects tokens signed with a different secret", () => {
    const token = signSessionToken(STUDENT_ID, USER_ID, TEST_SECRET);
    expect(verifySessionToken(token, "wrong-secret-value-for-testing-1234")).toBeNull();
  });

  it("rejects tampered payloads", () => {
    const token = signSessionToken(STUDENT_ID, USER_ID, TEST_SECRET);
    const tampered = token.replace(STUDENT_ID, "33333333-3333-4333-8333-333333333333");
    expect(verifySessionToken(tampered, TEST_SECRET)).toBeNull();
  });

  it("rejects expired tokens", () => {
    const expiredNow = Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS - 10;
    const token = signSessionToken(STUDENT_ID, USER_ID, TEST_SECRET, expiredNow);
    expect(hasValidSessionFormat(token)).toBe(false);
    expect(verifySessionToken(token, TEST_SECRET)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(verifySessionToken("", TEST_SECRET)).toBeNull();
    expect(verifySessionToken("not-a-valid-token", TEST_SECRET)).toBeNull();
    expect(verifySessionToken("bad.uuid.9999999999.sig", TEST_SECRET)).toBeNull();
  });
});
