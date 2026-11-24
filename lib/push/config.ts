import "server-only";
import { setVapidDetails } from "web-push";

let vapidConfigured = false;

export function getVapidKeys(): { subject: string; publicKey: string; privateKey: string } {
  const subject = process.env.VAPID_SUBJECT?.trim();
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();

  if (!subject || !publicKey || !privateKey) {
    throw new Error("Push is not configured: set VAPID_* env vars.");
  }

  return { subject, publicKey, privateKey };
}

export function ensureVapidConfig(): void {
  if (vapidConfigured) {
    return;
  }

  const { subject, publicKey, privateKey } = getVapidKeys();
  setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}
