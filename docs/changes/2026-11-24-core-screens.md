# Core student screens (login → home → subjects → assignments → notes → profile → graph)
- Date / tool + model / branch: 2026-11-24 / Claude Code (Opus orchestrator) + Sonnet workers (all visible UI) + agy gemini-4-neon (backend), gemini-4-hydrogen (seed notes) / `feat/p2-home`

## What changed
- `app/globals.css` — kit tokens (light/dark), fonts, motion, per-screen utilities (subjects stack, sheet, notes, graph).
- `app/layout.tsx`, `app/manifest.ts`, `app/icon.tsx`, `app/apple-icon.tsx`, `public/sw.js`, `components/pwa/*`, `app/offline/page.tsx` — PWA shell (installable, offline page, service worker in production).
- `app/(public)/login/*`, `components/auth/LoginForm.tsx` — login screen from the kit with pending/error states.
- `lib/db/schema/**`, `lib/db/migrations/0000_*`, `lib/db/seed/**` — schema v1 (incl. `note_links`, `announcements`, `announcement_reads`), idempotent seed: 44 subjects with drafted RGPV units/topics, 270 students, demo student data (6 assignments, 4 announcements, 45 notes).
- `lib/auth/*`, `lib/actions/auth.ts`, `proxy.ts`, `app/page.tsx` — demo sign-in against the students list, signed session cookie, route gate.
- `components/nav/*`, `app/(app)/layout.tsx` — floating pill, full-screen menu, notifications panel (mark all read).
- `components/home/*`, `app/(app)/home/*`, `lib/db/queries/home.ts`, `notifications.ts` — Home (due next + countdown, this week, keep writing).
- `components/subjects/*`, `app/(app)/subjects/**`, `lib/db/queries/subjects.ts`, `lib/progress/*` — subjects stack, subject → units → topics, progress formula (+ tests).
- `components/assignments/*`, `app/(app)/assignments/*`, `lib/db/queries/assignments.ts` — list, calendar, detail sheet.
- `components/notes/*`, `app/(app)/notes/**`, `lib/db/queries/notes.ts`, `lib/actions/notes.ts` — notes list, editor (auto-save, links to topics/notes, backlinks, delete).
- `components/profile/*`, `components/graph/*`, `app/(app)/profile/*`, `app/(app)/graph/*`, `lib/db/queries/profile.ts`, `graph.ts`, `lib/actions/profile.ts` — profile with notification switches, graph view (SVG port of the kit generator).
- `app/(app)/[...soon]/page.tsx` — "Coming next" page for menu items not built yet.
- `.gitignore`, `design/references/` — reference images kept local only.

## Design decisions
- Navigation is the kit's floating pill + full-screen menu (replaces the bottom tab bar in AGENTS.md §5).
- Two-tone titles use ink + grey (like the Home greeting), never italic/colored second words (user rule).
- Profile has no kit phone: built from the kit's hairline sections, mono labels and `.kv` rows.
- Note editor: Markdown textarea with Write/Preview (existing notes open in Preview); no rich-text library yet.

## Assumptions (also in NOTES.md)
- Demo sign-in (email on the students list → signed cookie) until Neon Auth email OTP is wired.
- Topic covered = ≥1 own note linked to it (no quizzes yet).
- Units/topics in the seed are drafts (`"draft": true`) to be checked against the official RGPV syllabus.

## Not done / follow-ups
- Real Neon Auth (email OTP), push notifications, faculty tools, materials, search, AI.
- Vercel deploy (needs the user's OK) — required for installing the PWA on a phone.
- AGENTS.md / PROJECT_OVERVIEW / design_system docs still describe the old bottom tab bar and topic-bound notes.
- Markdown preview doesn't render inline `code` yet.
