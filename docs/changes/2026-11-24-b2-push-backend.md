# Push notifications: save subscriptions and send a push
- Date / tool + model / branch: 2026-11-24 / Antigravity IDE (Gemini 3.8 Flash) / `feat/b2-push-backend`

## What changed
- `package.json`, `package-lock.json` — added `web-push` and `@types/web-push` dependencies.
- `lib/push/config.ts` — lazy VAPID configuration initialization and validation.
- `lib/push/send.ts` — `sendPushToStudent` helper sending notifications to student devices and pruning expired ones.
- `lib/db/queries/push.ts` — queries for upserting, removing, querying student subscriptions and marking success (transaction-free for `neon-http`).
- `lib/db/queries/index.ts` — re-exported push queries and types.
- `lib/actions/push.ts` — server actions `savePushSubscription`, `removePushSubscription`, `getVapidPublicKey`.
- `public/sw.js` — added `push` and `notificationclick` event listeners at the end of the service worker.
- `lib/actions/push.test.ts` — 14 unit tests covering actions, validation, and sending logic.

## Design decisions
- Transaction-free database queries to maintain compatibility with `neon-http` driver.
- `sendPushToStudent` uses `Promise.allSettled` and never throws, returning `{ sent, failed }`.
- Automatically prunes dead endpoints on HTTP 404 or 410.

## Assumptions (also in NOTES.md)
- Web push backend (b2): subscriptions upserted/deleted without transactions (neon-http safe); 404/410 status automatically deletes expired subscriptions; notifications displayed via service worker with fallback for malformed payload.

## Not done / follow-ups
- UI prompt and toggle buttons to subscribe/unsubscribe devices (separate UI task).
- Cron job / event-driven triggers for assignments (task b3).
