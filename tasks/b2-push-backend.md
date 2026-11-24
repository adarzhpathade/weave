---
branch: feat/b2-push-backend
base: origin/main
model: gemini-3.8-flash (teammate, Antigravity IDE)
files_allowed: lib/push/**, lib/actions/push.ts, lib/actions/push.test.ts, lib/db/queries/push.ts, lib/db/queries/index.ts, public/sw.js, lib/envSchema.ts, .env.example, package.json, package-lock.json, docs/changes/**, NOTES.md
subagents: not-allowed
shell: yes
---

# b2 — Push notifications: save subscriptions and send a push

## Goal
The backend for Web Push. After this task the app can:
1. save a phone/browser's push subscription for the signed-in student,
2. remove it (when the student turns pushes off or signs out),
3. send a push to every device of one student,
4. show the push on the phone (service worker) and open the right page when it is tapped.

**Backend only.** The "Turn on reminders" button and the permission prompt are a separate UI task.
The UI will call the actions below with the browser's `PushSubscription.toJSON()` object.

## Contract (exact; the UI task depends on it)
`lib/actions/push.ts` (`"use server"`), using `ActionResult` from `lib/actions/types.ts`:

```ts
export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(sub: PushSubscriptionInput, userAgent?: string): Promise<ActionResult<{ saved: true }>>;
export async function removePushSubscription(endpoint: string): Promise<ActionResult<{ removed: true }>>;
export async function getVapidPublicKey(): Promise<ActionResult<{ publicKey: string }>>;
```

`lib/push/send.ts` (`import "server-only";`), used by task b3:

```ts
export type PushPayload = { title: string; body: string; url: string; tag?: string };

// Sends to every saved device of the student's user. Never throws.
// Returns how many devices got it and how many failed.
export async function sendPushToStudent(studentId: string, payload: PushPayload): Promise<{ sent: number; failed: number }>;
```

## References
- `AGENTS.md` §6 (PWA rules: ask for permission only after a tap; iOS only after install)
- `docs/pwa.md` — push section
- `lib/db/schema/push.ts` — `push_subscriptions` table (already exists, **do not change the schema**)
- `lib/auth/session.ts` — use `getSessionStudent()` to get the signed-in student (`userId`)
- `lib/actions/notes.ts` — example of a server action with auth + Zod + `ActionResult`
- `public/sw.js` — hand-written service worker (keep all existing caching code as it is)
- web-push package: https://github.com/web-push-libs/web-push

## Steps
1. Install: `npm install web-push` and `npm install -D @types/web-push`.
2. In `lib/envSchema.ts`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` are optional today.
   Leave them optional (so the app still starts without them) but make `lib/push/config.ts` throw a
   clear error `"Push is not configured: set VAPID_* env vars."` when sending is attempted without them.
3. `lib/push/config.ts`: call `webpush.setVapidDetails(...)` once (lazy, on first use).
4. `lib/db/queries/push.ts`:
   - `upsertPushSubscription({ userId, endpoint, p256dh, auth, userAgent })` — insert, or on conflict
     with `endpoint` update `userId`, keys, userAgent, `updatedAt`.
   - `deletePushSubscription(userId, endpoint)` — delete only if it belongs to that user.
   - `deletePushSubscriptionByEndpoint(endpoint)` — used when the push service says it is gone.
   - `getSubscriptionsForStudent(studentId)` — join `students.user_id` → `push_subscriptions.user_id`.
   - `markPushSuccess(id)` — set `last_success_at = now()`.
   Export them from `lib/db/queries/index.ts`.
5. `lib/actions/push.ts`: every action first calls `getSessionStudent()`; if null return
   `{ ok: false, error: { code: "UNAUTHORIZED", message: "Please sign in again." } }`.
   Validate input with Zod (`endpoint` must be an `https://` URL, max 2000 chars; keys non-empty,
   max 200 chars; userAgent max 300 chars, optional).
6. `lib/push/send.ts`: for each subscription call `webpush.sendNotification(sub, JSON.stringify(payload), { TTL: 60 * 60 * 24 })`.
   - success → `markPushSuccess`
   - status 404 or 410 → `deletePushSubscriptionByEndpoint` (the device unsubscribed)
   - other error → `console.error` with the status code (not the keys), count as failed
   Use `Promise.allSettled` so one bad device does not stop the others.
7. `public/sw.js`: add two listeners **at the end**, do not change existing code:
   - `push`: read `event.data.json()` (`{ title, body, url, tag }`); call
     `self.registration.showNotification(title, { body, tag, icon: "/icon/192", badge: "/icon/192", data: { url } })`
     inside `event.waitUntil`. If the data is not valid JSON, show title "Weave" with the text.
   - `notificationclick`: close the notification; focus an open app window and navigate it to
     `data.url`, or open a new window with `clients.openWindow(data.url)`. Only allow URLs that start with `/`.
   Check the icon paths exist in `app/` (icon routes) before using them; use the real ones.
8. Tests `lib/actions/push.test.ts` (Vitest, mock `lib/db/queries`, `lib/auth/session`, `web-push`):
   not signed in, bad input, save works, remove works, send: 410 removes the device, one failure
   does not stop the others.
9. Manual test: run `npm run dev`. Generate test VAPID keys with `npx web-push generate-vapid-keys`
   and put them in your own `.env.local` only if Adarsh's file has none. Write in the PR how you tested.
10. Do STEP 7–9 of the start-here prompt (checks, change file, PR).

## Done when
- [ ] The three actions and `sendPushToStudent` exist with the exact signatures above
- [ ] Every action checks the session; a student can only add/remove their own devices
- [ ] Dead subscriptions (404/410) are deleted; errors are logged, not hidden
- [ ] `sw.js` shows the push and opens the right page; old caching code unchanged
- [ ] Schema not changed; tests, typecheck, lint, build pass; PR opened (not merged)
