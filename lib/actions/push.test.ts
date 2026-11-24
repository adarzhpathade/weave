import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getVapidPublicKey,
  removePushSubscription,
  savePushSubscription,
} from "./push";
import { sendPushToStudent } from "@/lib/push/send";

vi.mock("server-only", () => ({}));

const mockGetSessionStudent = vi.fn();
vi.mock("@/lib/auth/session", () => ({
  getSessionStudent: () => mockGetSessionStudent(),
}));

const mockUpsertPushSubscription = vi.fn();
const mockDeletePushSubscription = vi.fn();
const mockDeletePushSubscriptionByEndpoint = vi.fn();
const mockGetSubscriptionsForStudent = vi.fn();
const mockMarkPushSuccess = vi.fn();

vi.mock("@/lib/db/queries/push", () => ({
  upsertPushSubscription: (input: unknown) => mockUpsertPushSubscription(input),
  deletePushSubscription: (userId: string, endpoint: string) =>
    mockDeletePushSubscription(userId, endpoint),
  deletePushSubscriptionByEndpoint: (endpoint: string) =>
    mockDeletePushSubscriptionByEndpoint(endpoint),
  getSubscriptionsForStudent: (studentId: string) =>
    mockGetSubscriptionsForStudent(studentId),
  markPushSuccess: (id: string) => mockMarkPushSuccess(id),
}));

const mockSendNotification = vi.fn();
const mockSetVapidDetails = vi.fn();

vi.mock("web-push", () => ({
  default: {
    sendNotification: (...args: unknown[]) => mockSendNotification(...args),
    setVapidDetails: (...args: unknown[]) => mockSetVapidDetails(...args),
  },
}));

const STUDENT_ID = "11111111-1111-4111-8111-111111111111";
const USER_ID = "22222222-2222-4222-8222-222222222222";
const VALID_ENDPOINT = "https://fcm.googleapis.com/fcm/send/sample-endpoint-123";
const VALID_KEYS = {
  p256dh: "BMc7k4...sample-p256dh-key",
  auth: "sample-auth-key-123",
};

describe("push actions and sender", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.VAPID_SUBJECT = "mailto:admin@example.com";
    process.env.VAPID_PUBLIC_KEY = "test-public-key";
    process.env.VAPID_PRIVATE_KEY = "test-private-key";
  });

  describe("savePushSubscription", () => {
    it("rejects unauthenticated calls", async () => {
      mockGetSessionStudent.mockResolvedValueOnce(null);

      const res = await savePushSubscription({
        endpoint: VALID_ENDPOINT,
        keys: VALID_KEYS,
      });

      expect(res).toEqual({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in again." },
      });
      expect(mockUpsertPushSubscription).not.toHaveBeenCalled();
    });

    it("rejects non-https or invalid endpoints", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });

      const res = await savePushSubscription({
        endpoint: "http://insecure.endpoint.com",
        keys: VALID_KEYS,
      });

      expect(res).toEqual({
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Push endpoint must be an https:// URL.",
        },
      });
      expect(mockUpsertPushSubscription).not.toHaveBeenCalled();
    });

    it("rejects empty keys", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });

      const res = await savePushSubscription({
        endpoint: VALID_ENDPOINT,
        keys: { p256dh: "", auth: "" },
      });

      expect(res.ok).toBe(false);
      if (!res.ok) {
        expect(res.error.code).toBe("INVALID_INPUT");
      }
      expect(mockUpsertPushSubscription).not.toHaveBeenCalled();
    });

    it("saves valid subscription for signed-in student", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });
      mockUpsertPushSubscription.mockResolvedValueOnce({ id: "sub-1" });

      const res = await savePushSubscription(
        { endpoint: VALID_ENDPOINT, keys: VALID_KEYS },
        "Chrome/Android",
      );

      expect(res).toEqual({ ok: true, data: { saved: true } });
      expect(mockUpsertPushSubscription).toHaveBeenCalledWith({
        userId: USER_ID,
        endpoint: VALID_ENDPOINT,
        p256dh: VALID_KEYS.p256dh,
        auth: VALID_KEYS.auth,
        userAgent: "Chrome/Android",
      });
    });
  });

  describe("removePushSubscription", () => {
    it("rejects unauthenticated calls", async () => {
      mockGetSessionStudent.mockResolvedValueOnce(null);

      const res = await removePushSubscription(VALID_ENDPOINT);
      expect(res).toEqual({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in again." },
      });
      expect(mockDeletePushSubscription).not.toHaveBeenCalled();
    });

    it("rejects invalid endpoints", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });

      const res = await removePushSubscription("not-a-valid-url");
      expect(res).toEqual({
        ok: false,
        error: {
          code: "INVALID_INPUT",
          message: "Invalid push endpoint URL.",
        },
      });
      expect(mockDeletePushSubscription).not.toHaveBeenCalled();
    });

    it("removes subscription for signed-in student", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });
      mockDeletePushSubscription.mockResolvedValueOnce({ deleted: true });

      const res = await removePushSubscription(VALID_ENDPOINT);
      expect(res).toEqual({ ok: true, data: { removed: true } });
      expect(mockDeletePushSubscription).toHaveBeenCalledWith(USER_ID, VALID_ENDPOINT);
    });
  });

  describe("getVapidPublicKey", () => {
    it("rejects unauthenticated calls", async () => {
      mockGetSessionStudent.mockResolvedValueOnce(null);

      const res = await getVapidPublicKey();
      expect(res).toEqual({
        ok: false,
        error: { code: "UNAUTHORIZED", message: "Please sign in again." },
      });
    });

    it("returns public key when configured", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });

      const res = await getVapidPublicKey();
      expect(res).toEqual({
        ok: true,
        data: { publicKey: "test-public-key" },
      });
    });

    it("returns error when VAPID is not configured", async () => {
      mockGetSessionStudent.mockResolvedValueOnce({
        studentId: STUDENT_ID,
        userId: USER_ID,
      });
      delete process.env.VAPID_PUBLIC_KEY;

      const res = await getVapidPublicKey();
      expect(res).toEqual({
        ok: false,
        error: { code: "NOT_CONFIGURED", message: "Push is not configured." },
      });
    });
  });

  describe("sendPushToStudent", () => {
    const payload = {
      title: "Assignment Due",
      body: "CSIT-501 assignment is due in 2 days",
      url: "/assignments",
      tag: "due-csit-501",
    };

    it("returns { sent: 0, failed: 0 } when student has no devices", async () => {
      mockGetSubscriptionsForStudent.mockResolvedValueOnce([]);

      const result = await sendPushToStudent(STUDENT_ID, payload);
      expect(result).toEqual({ sent: 0, failed: 0 });
      expect(mockSendNotification).not.toHaveBeenCalled();
    });

    it("sends to saved devices and marks success", async () => {
      mockGetSubscriptionsForStudent.mockResolvedValueOnce([
        {
          id: "sub-1",
          endpoint: VALID_ENDPOINT,
          p256dh: VALID_KEYS.p256dh,
          auth: VALID_KEYS.auth,
        },
      ]);
      mockSendNotification.mockResolvedValueOnce({});

      const result = await sendPushToStudent(STUDENT_ID, payload);
      expect(result).toEqual({ sent: 1, failed: 0 });
      expect(mockSendNotification).toHaveBeenCalledWith(
        {
          endpoint: VALID_ENDPOINT,
          keys: {
            p256dh: VALID_KEYS.p256dh,
            auth: VALID_KEYS.auth,
          },
        },
        JSON.stringify(payload),
        { TTL: 86400 },
      );
      expect(mockMarkPushSuccess).toHaveBeenCalledWith("sub-1");
    });

    it("deletes subscription on 410 Gone / 404 Not Found", async () => {
      mockGetSubscriptionsForStudent.mockResolvedValueOnce([
        {
          id: "sub-gone",
          endpoint: VALID_ENDPOINT,
          p256dh: VALID_KEYS.p256dh,
          auth: VALID_KEYS.auth,
        },
      ]);
      const error410 = new Error("Subscription expired");
      (error410 as unknown as { statusCode: number }).statusCode = 410;
      mockSendNotification.mockRejectedValueOnce(error410);

      const result = await sendPushToStudent(STUDENT_ID, payload);
      expect(result).toEqual({ sent: 0, failed: 1 });
      expect(mockDeletePushSubscriptionByEndpoint).toHaveBeenCalledWith(VALID_ENDPOINT);
      expect(mockMarkPushSuccess).not.toHaveBeenCalled();
    });

    it("one device failure does not stop others from sending", async () => {
      mockGetSubscriptionsForStudent.mockResolvedValueOnce([
        {
          id: "sub-bad",
          endpoint: "https://bad.endpoint.com",
          p256dh: "key1",
          auth: "auth1",
        },
        {
          id: "sub-good",
          endpoint: "https://good.endpoint.com",
          p256dh: "key2",
          auth: "auth2",
        },
      ]);

      const error500 = new Error("Internal push service error");
      (error500 as unknown as { statusCode: number }).statusCode = 500;
      mockSendNotification
        .mockRejectedValueOnce(error500)
        .mockResolvedValueOnce({});

      const result = await sendPushToStudent(STUDENT_ID, payload);
      expect(result).toEqual({ sent: 1, failed: 1 });
      expect(mockMarkPushSuccess).toHaveBeenCalledWith("sub-good");
      expect(mockDeletePushSubscriptionByEndpoint).not.toHaveBeenCalled();
    });
  });
});
