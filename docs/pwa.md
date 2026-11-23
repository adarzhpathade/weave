# PWA plan

## Goals
Installs like an app on Android and iOS, opens instantly, stays readable offline, and reminds students about deadlines with push notifications.

## 1. Manifest (`app/manifest.ts`)
- `name: "Weave"`, `short_name: "Weave"`, `id: "/"`, `start_url: "/dashboard?source=pwa"`, `scope: "/"`
- `display: "standalone"`, `orientation: "portrait"`, `theme_color` / `background_color` from tokens
- Icons: 192, 512, 512 maskable (+ monochrome for Android themed icons); `apple-touch-icon` 180
- `shortcuts`: New note, Assignments, AI tutor · `screenshots` (mobile + desktop) for the rich install dialog
- iOS: `apple-mobile-web-app-capable`, status-bar style, splash images per device size

## 2. Service worker
- Tool: **Serwist** if it supports the current Next.js bundler; otherwise a small hand-written `public/sw.js` (decide in Phase 0, log in NOTES.md).
- Strategies:
  | Request | Strategy |
  |---|---|
  | App shell, JS/CSS chunks | Precache (versioned) |
  | Fonts, icons, images | Cache-first, 30 days |
  | Page navigations | Network-first (3 s timeout) → cached page → `/offline` |
  | Read APIs / RSC payloads for dashboard, notes, assignments | Stale-while-revalidate |
  | AI, auth, mutations | Network-only |
- Update flow: new SW waits; a toast "New version available — Refresh" calls `skipWaiting`.

## 3. Offline
- `/offline` page in the app's style.
- Phase 3: notes editable offline — edits stored in IndexedDB (`idb-keyval` or similar), replayed on reconnect; conflict rule: last write wins, but if the server copy is newer, keep both (create "conflict copy").
- Offline banner when `navigator.onLine` is false.

## 4. Push notifications
- VAPID keys in env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`).
- Permission asked from a clear button ("Remind me about deadlines"), never on load.
- Subscription saved in `push_subscriptions`; removed when the push service returns 404/410.
- Triggers: deadline in 2 days, deadline today (cron, 8 AM IST), new assignment, status marked.
- iOS: push only works for the **installed** app (iOS 16.4+) — the UI explains this and shows install steps.

## 5. App feel
- `viewport-fit=cover`, safe-area padding for the bottom tab bar, `overscroll-behavior-y: none` on the shell
- `-webkit-tap-highlight-color: transparent`, no text selection on navigation chrome
- View transitions between tabs; skeletons appear within 100 ms
- Custom install prompt (`beforeinstallprompt` on Android; instructions sheet on iOS)

## 6. Checks
- Lighthouse PWA/installability + performance on a throttled mobile profile
- Real devices: one Android (Chrome), one iPhone (Safari) — install, offline, push
