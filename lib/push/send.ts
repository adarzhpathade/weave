import "server-only";
import { sendNotification } from "web-push";
import {
  deletePushSubscriptionByEndpoint,
  getSubscriptionsForStudent,
  markPushSuccess,
} from "@/lib/db/queries/push";
import { ensureVapidConfig } from "./config";

export type PushPayload = {
  title: string;
  body: string;
  url: string;
  tag?: string;
};

/**
 * Sends a push notification to every saved device for the given student.
 * Never throws.
 * Returns how many devices got it and how many failed.
 */
export async function sendPushToStudent(
  studentId: string,
  payload: PushPayload,
): Promise<{ sent: number; failed: number }> {
  try {
    ensureVapidConfig();

    const subscriptions = await getSubscriptionsForStudent(studentId);
    if (!subscriptions || subscriptions.length === 0) {
      return { sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          };

          await sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            { TTL: 60 * 60 * 24 },
          );

          await markPushSuccess(sub.id);
          return { ok: true as const, id: sub.id };
        } catch (error) {
          const statusCode =
            (error as { statusCode?: number; status?: number })?.statusCode ??
            (error as { statusCode?: number; status?: number })?.status;

          if (statusCode === 404 || statusCode === 410) {
            await deletePushSubscriptionByEndpoint(sub.endpoint);
          } else {
            console.error(
              `Push failed for subscription ${sub.id} with status code ${statusCode ?? "unknown"}`,
            );
          }

          return { ok: false as const, id: sub.id, error };
        }
      }),
    );

    for (const res of results) {
      if (res.status === "fulfilled" && res.value.ok) {
        sent++;
      } else {
        failed++;
      }
    }

    return { sent, failed };
  } catch (error) {
    console.error("sendPushToStudent unexpected error:", error);
    return { sent: 0, failed: 0 };
  }
}
