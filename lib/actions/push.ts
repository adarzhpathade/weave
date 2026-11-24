"use server";

import { z } from "zod";
import { getSessionStudent } from "@/lib/auth/session";
import {
  deletePushSubscription,
  upsertPushSubscription,
} from "@/lib/db/queries/push";
import { getVapidKeys } from "@/lib/push/config";
import type { ActionResult } from "./types";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const pushSubscriptionSchema = z.object({
  endpoint: z
    .string()
    .trim()
    .url("Invalid push endpoint URL.")
    .refine((url) => url.startsWith("https://"), {
      message: "Push endpoint must be an https:// URL.",
    })
    .max(2000, "Push endpoint URL is too long."),
  keys: z.object({
    p256dh: z
      .string()
      .trim()
      .min(1, "p256dh key is required.")
      .max(200, "p256dh key is too long."),
    auth: z
      .string()
      .trim()
      .min(1, "auth key is required.")
      .max(200, "auth key is too long."),
  }),
});

const userAgentSchema = z.string().trim().max(300, "User agent is too long.").optional();

const endpointSchema = z
  .string()
  .trim()
  .url("Invalid push endpoint URL.")
  .refine((url) => url.startsWith("https://"), {
    message: "Push endpoint must be an https:// URL.",
  })
  .max(2000, "Push endpoint URL is too long.");

export async function savePushSubscription(
  sub: PushSubscriptionInput,
  userAgent?: string,
): Promise<ActionResult<{ saved: true }>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Please sign in again." },
    };
  }

  const parsedSub = pushSubscriptionSchema.safeParse(sub);
  if (!parsedSub.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsedSub.error.issues[0]?.message ?? "Invalid push subscription input.",
      },
    };
  }

  const parsedUa = userAgentSchema.safeParse(userAgent);
  if (!parsedUa.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsedUa.error.issues[0]?.message ?? "Invalid user agent.",
      },
    };
  }

  try {
    await upsertPushSubscription({
      userId: student.userId,
      endpoint: parsedSub.data.endpoint,
      p256dh: parsedSub.data.keys.p256dh,
      auth: parsedSub.data.keys.auth,
      userAgent: parsedUa.data,
    });

    return { ok: true, data: { saved: true } };
  } catch (error) {
    console.error("savePushSubscription failed:", error);
    return {
      ok: false,
      error: { code: "PUSH_ERROR", message: "Couldn't save push subscription." },
    };
  }
}

export async function removePushSubscription(
  endpoint: string,
): Promise<ActionResult<{ removed: true }>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Please sign in again." },
    };
  }

  const parsedEndpoint = endpointSchema.safeParse(endpoint);
  if (!parsedEndpoint.success) {
    return {
      ok: false,
      error: {
        code: "INVALID_INPUT",
        message: parsedEndpoint.error.issues[0]?.message ?? "Invalid push endpoint URL.",
      },
    };
  }

  try {
    await deletePushSubscription(student.userId, parsedEndpoint.data);
    return { ok: true, data: { removed: true } };
  } catch (error) {
    console.error("removePushSubscription failed:", error);
    return {
      ok: false,
      error: { code: "PUSH_ERROR", message: "Couldn't remove push subscription." },
    };
  }
}

export async function getVapidPublicKey(): Promise<ActionResult<{ publicKey: string }>> {
  const student = await getSessionStudent();
  if (!student) {
    return {
      ok: false,
      error: { code: "UNAUTHORIZED", message: "Please sign in again." },
    };
  }

  try {
    const { publicKey } = getVapidKeys();
    return { ok: true, data: { publicKey } };
  } catch (error) {
    console.error("getVapidPublicKey failed:", error);
    return {
      ok: false,
      error: { code: "NOT_CONFIGURED", message: "Push is not configured." },
    };
  }
}
