---
branch: feat/p2-home-ui
base: origin/feat/p2-home
model: sonnet
files_allowed: components/**, app/globals.css, app/(app)/[...soon]/**
subagents: not-allowed
shell: no
---

# p2-home-ui — Home screen, floating menu pill, notifications panel (visible UI only)

## Goal
The signed-in student sees the kit's Home screen, the floating pill that opens the full-screen menu, and the bell notifications panel — pixel-matched to `design/ui-kit/index.html`, phone first, good on laptop.
A parallel backend worker writes the pages that fetch data and render your components. Do NOT write `app/(app)/layout.tsx`, `app/(app)/home/page.tsx`, `lib/**` or actions. Keep to the contract below exactly.

## Source of truth
`design/ui-kit/index.html`: HOME phone (`.hm2`, `.hm-s` hairline sections, greeting, bell with badge, avatar, Due next with live countdown, This week day columns, Keep writing row), the pill (`.navpill`, `.where`, `.nb.search`, `.nb.menu`), the menu overlay (`.mpanel`, `MENU` array in the script: main items + vertical sub-option lists with arrows, "later" items dimmed, semester switcher with future semesters locked, clip-path circle reveal from the pill button), the notifications panel (`.npanel`: big title, New/Earlier groups, hairlines, time column, lime unread dots, "Mark all read", pill becomes "Notifications · Close"). Copy sizes/spacing/motion exactly. Tokens already exist in `app/globals.css` (from the login task); add any missing ones there. Reuse `components/ui/*`.
No hex / arbitrary values in components. Reduced motion respected. Keyboard: Esc closes menu/panel, focus trapped while open, focus returns to the pill.

## Contract (the backend worker codes against this — do not change names)
```ts
// components/nav/types.ts
export type ShellStudent = { firstName: string; fullName: string; divisionCode: string; programCode: string; semester: number };

// components/nav/AppShell.tsx  ("use client")
export function AppShell(props: {
  student: ShellStudent;
  notifications: NotificationItem[];          // import type { NotificationItem } from "@/lib/db/queries"
  markAllReadAction: () => Promise<void>;
  signOutAction: () => Promise<void>;
  children: React.ReactNode;
}): JSX.Element
// Renders children + the floating pill + menu overlay + notifications panel.
// Exposes useShell() (context) with openNotifications(), unreadCount.

// components/home/HomeScreen.tsx
export function HomeScreen(props: { home: HomeData; now: string /* ISO server time */ }): JSX.Element
// import type { HomeData } from "@/lib/db/queries". Bell button calls useShell().openNotifications().
```
Use `import type` only from `@/lib/db/queries` (never import runtime code from lib/db in client files).

## Details
- Pill label = current section from the pathname (`/home` Home, `/subjects` Study, `/notes` Notes, `/assignments` Assignments, `/profile` Profile). Menu links: Home `/home`; Study → Subjects & progress `/subjects`, Graph `/graph`, Materials `/materials` (later: Quizzes, AI tutor dimmed, not links); Notes `/notes`; Assignments `/assignments`; Profile `/profile` + Sign out (calls `signOutAction`). Search button: no-op for now (aria-label "Search, coming soon").
- Semester switcher: semesters 3..8, current = `student.semester`, future locked (visual only for now).
- Home sections: date line + bell (badge = unreadCount from context, hidden at 0) + avatar initials; "Morning/Afternoon/Evening, {firstName}" (greeting word grey, based on local time); Due next (subject label + status, big title, live countdown updating every minute, from `now`); This week (day columns for the next days that have items, from `home.thisWeek`); Keep writing (`home.lastNote` row, links to `/notes/{id}`).
- Empty states: no due item → "Nothing due. Enjoy the quiet." style line in the kit's type; no notes → "Start your first note" row linking `/notes`; no notifications → short line in the panel. Dates formatted with `Intl` (en-IN).
- Notification rows: announcement (kind label, title, body 2 lines, subject short) and assignment_mark (title, status Submitted/Late/Not submitted + marks if any). Relative time column ("2h", "Mon").
- Laptop (≥ 1024px): content in a centered column (max ~720px), same pill centered at bottom; menu/panel full-screen with content max-width.
- `app/(app)/[...soon]/page.tsx`: a calm "Coming next" screen in the kit style for pages not built yet (title from the path, link back Home).
- Login form: also update `components/auth/LoginForm.tsx` so `onContinue: (email: string) => Promise<{ ok: true } | { ok: false; message: string }>`: show a pending state on the button (spinner/“Checking…”), disable while pending, show `message` in the existing inline error slot on failure.
- Write REPORT.md (kit measurements you used), print TASK COMPLETE.

## Done when
- [ ] Home, menu-open and notifications-open match the kit phones at 390×844
- [ ] Laptop 1440×900 intentional; no horizontal scroll
- [ ] Contract names/props exactly as above; no runtime imports from lib/
- [ ] Empty states, reduced motion, Esc/focus handling
