"use client";

import { useCallback, useEffect, useState } from "react";
import { getVapidPublicKey, removePushSubscription, savePushSubscription } from "@/lib/actions/push";

export type PushState = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on";

type IosNavigator = Navigator & { standalone?: boolean };

function isUnsupported(): boolean {
  return !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window);
}

// iPhone/iPad (iPadOS reports as Mac with touch) outside the installed app: push only works after "Add to Home Screen".
function needsIosInstall(): boolean {
  const ua = navigator.userAgent;
  const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
  if (!isIos) return false;
  const standalone =
    (navigator as IosNavigator).standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  return !standalone;
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function readState(): Promise<PushState> {
  if (isUnsupported()) return "unsupported";
  if (needsIosInstall()) return "ios-install";
  if (Notification.permission === "denied") return "denied";
  // getRegistration() (not .ready): in dev the worker is never registered and .ready would wait forever.
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = registration ? await registration.pushManager.getSubscription() : null;
  return subscription !== null ? "on" : "off";
}

export type UsePush = {
  state: PushState;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  error: string | null;
};

/** Web Push on/off for this device. Permission is only requested from `enable()`, which must be called from a tap. */
export function usePush(): UsePush {
  const [state, setState] = useState<PushState>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    readState()
      .then((next) => {
        if (active) setState(next);
      })
      .catch((cause: unknown) => {
        console.error("Reading push state failed:", cause);
        if (!active) return;
        setState("off");
        setError("Couldn't check your notification status. Try again later.");
      });
    return () => {
      active = false;
    };
  }, []);

  const enable = useCallback(async () => {
    setError(null);
    let subscription: PushSubscription | null = null;
    try {
      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setState("denied");
        return;
      }
      if (permission !== "granted") {
        setError("Notifications weren't allowed. Tap again to allow them.");
        return;
      }

      const key = await getVapidPublicKey();
      if (!key.ok) {
        setError(
          key.error.code === "NOT_CONFIGURED"
            ? "Notifications aren't available yet. Please try again later."
            : key.error.message,
        );
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: base64UrlToBytes(key.data.publicKey),
      });

      const json = subscription.toJSON();
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (json.endpoint === undefined || p256dh === undefined || auth === undefined) {
        throw new Error("Subscription is missing its endpoint or keys.");
      }

      const saved = await savePushSubscription({ endpoint: json.endpoint, keys: { p256dh, auth } }, navigator.userAgent);
      if (!saved.ok) {
        await subscription.unsubscribe();
        setError(saved.error.message);
        return;
      }
      setState("on");
    } catch (cause) {
      console.error("Enabling push failed:", cause);
      if (subscription !== null) {
        await subscription.unsubscribe().catch((undoCause: unknown) => {
          console.error("Undoing push subscription failed:", undoCause);
        });
      }
      setError("Couldn't turn on notifications. Check your connection and try again.");
    }
  }, []);

  const disable = useCallback(async () => {
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription === null) {
        setState("off");
        return;
      }
      const removed = await removePushSubscription(subscription.endpoint);
      if (!removed.ok) {
        setError(removed.error.message);
        return;
      }
      await subscription.unsubscribe();
      setState("off");
    } catch (cause) {
      console.error("Disabling push failed:", cause);
      setError("Couldn't turn off notifications. Check your connection and try again.");
    }
  }, []);

  return { state, enable, disable, error };
}

export const PUSH_HELP: Record<"unsupported" | "ios-install" | "denied", string> = {
  unsupported: "Not supported on this browser",
  "ios-install": "On iPhone: Share → Add to Home Screen, then open Weave from there",
  denied: "Blocked in browser settings",
};
