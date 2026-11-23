import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "weave_session";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type SessionPayload = {
  studentId: string;
  userId: string;
  /** Unix timestamp in seconds when the session expires. */
  expiresAt: number;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXPIRY_PATTERN = /^\d+$/;

function computeSignature(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function parseUnverifiedToken(
  token: string,
): { payload: string; parsed: SessionPayload; signature: string } | null {
  const parts = token.split(".");
  if (parts.length !== 4) {
    return null;
  }

  const [studentId, userId, expiryStr, signature] = parts;
  if (!studentId || !userId || !expiryStr || !signature) {
    return null;
  }

  if (
    !UUID_PATTERN.test(studentId) ||
    !UUID_PATTERN.test(userId) ||
    !EXPIRY_PATTERN.test(expiryStr)
  ) {
    return null;
  }

  const expiresAt = Number.parseInt(expiryStr, 10);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return {
    payload: `${studentId}.${userId}.${expiryStr}`,
    parsed: { studentId, userId, expiresAt },
    signature,
  };
}

/**
 * Signs `studentId.userId.expiry` with HMAC-SHA256 using `secret`.
 */
export function signSessionToken(
  studentId: string,
  userId: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): string {
  const expiresAt = nowSeconds + SESSION_MAX_AGE_SECONDS;
  const payload = `${studentId}.${userId}.${expiresAt}`;
  const signature = computeSignature(payload, secret);
  return `${payload}.${signature}`;
}

/**
 * Verifies the cookie format, expiry, and HMAC-SHA256 signature in constant time.
 */
export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  if (!secret) {
    return null;
  }

  const unverified = parseUnverifiedToken(token);
  if (!unverified) {
    return null;
  }

  const expectedSig = computeSignature(unverified.payload, secret);
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  const actualBuf = Buffer.from(unverified.signature, "utf8");

  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return null;
  }

  return unverified.parsed;
}

/**
 * Lightweight format + expiry check (used by proxy when no secret is configured).
 */
export function hasValidSessionFormat(token: string): boolean {
  return parseUnverifiedToken(token) !== null;
}
