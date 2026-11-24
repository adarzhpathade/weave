# HANDOFF — start here (new Claude Code session)

> Last updated 2026-11-24, after the core student screens shipped and went live on Vercel.
> Read this, then `AGENTS.md`, `CLAUDE.md`, `NOTES.md` (decision log), `docs/changes/2026-11-24-core-screens.md`. Update this file at the end of each session.

## Where we are
- **App:** **Weave**, a student PWA for the CSIT department (programs CSIT + CY): syllabus with progress, private linked notes, assignments with countdowns, teacher notifications.
- **Live:** https://weave-sigma-sepia.vercel.app (public). Demo sign-in: `demo.student@weave.test` (Aarav Sharma, CSIT-2, sem 5). `weave-adarz.vercel.app` is behind Vercel login; share only the sigma-sepia link.
- **Repo:** https://github.com/adarzhpathade/weave (public; squash-merge). `main` = what is live; every merge to `main` auto-deploys (Vercel project `weave`, team `adarz`, id `prj_SSBauktKXKIVDSaKLuY2VJ4tapwp`).
- **Built and working (real data, phone 390 px + laptop 1440 px):**
  - Login (demo sign-in: email must be on the `students` list → HMAC-signed `weave_session` cookie; `proxy.ts` gates app routes).
  - Home (due next + live countdown, this week, keep writing), floating **menu pill** + full-screen menu, **bell notifications panel** (mark all read).
  - Subjects (stacked colour cards with %), Subject → units → topics (topic green when a note links to it).
  - Assignments (list, calendar, detail sheet with marks/remarks).
  - Notes (list, search, filters; editor with auto-save, links to topics/notes, backlinks, delete). Markdown textarea + Write/Preview.
  - Profile (account rows, notification switches, sign out), Graph (SVG syllabus tree + notes as diamonds, tap to highlight).
  - PWA: manifest, icons, offline page, hand-written `public/sw.js` (installable on HTTPS).
  - "Coming next" page for menu items not built (`app/(app)/[...soon]`).
- **Checks at last merge:** `tsc`, `eslint`, `vitest` (24 tests), `next build` all pass; Playwright screenshots of every screen, no console errors.

## Data
- **Neon** project `proud-sky-40049407` (Singapore). Schema v1 in `lib/db/schema/` (19 tables incl. `note_links`, `announcements`, `announcement_reads`); migration `lib/db/migrations/0000_*`.
- Seed (`npm run db:seed`, idempotent): 44 subjects, 1,100 **drafted** RGPV topics (`lib/db/seed/data/units-topics.json`, `"draft": true`), 270 students, demo student with 6 assignments, 4 announcements, 45 notes (CN 72%, OS 52%, TOC 32%, AI 84%).
- Secrets only in git-ignored `.env.local` (also set on Vercel). `DEMO_STUDENT_EMAIL` and `SESSION_SECRET` were added this session.

## How we work (user rules — don't re-ask)
- **Claude (Opus) = orchestrator/reviewer** with minimal tokens. **Sonnet workers build everything visible** (`spawn.sh claude`, task `model: sonnet`). **agy (Gemini) builds backend + data wiring**; cheapest model that fits (Neon-medium for normal backend, Hydrogen for seed/simple, Argon only for genuinely hard work).
- Parallel UI/data pairs work well: the task file fixes a **contract** (types in `components/<feature>/types.ts`, owned by the UI worker; the data worker imports them). Launch spawns **one at a time ~20 s apart** (parallel `git worktree add` races on `.git/config`).
- Worktree previews: Turbopack can't follow the `node_modules` junction, so preview by merging into a branch checked out in the main folder.
- Git Bash rewrites `/paths` for node scripts: prefix with `MSYS_NO_PATHCONV=1`.
- `globals.css` conflicts are frequent when merging parallel UI branches: keep both sides, then check for duplicate `@utility` names and brace balance.
- Design source of truth = `design/ui-kit/index.html`. User style rules: no dot-matrix numbers, no italic/coloured second words in titles (use ink + grey word), no playful shapes, no cards on Home (hairlines), notifications via bell panel (no announcements page).
- Reference images stay **local only** (`design/references/` is git-ignored).
- Reply in simple English. Decide implementation details yourself and log them in `NOTES.md`. Ask before public/irreversible actions. The user has allowed Claude to merge PRs on their behalf when the work is good.

## Open items / next steps
1. **Speed:** Vercel functions run in `iad1` (US) while the DB is in Singapore → set Function Region to `sin1` (Vercel → Project → Settings → Functions).
2. **Real sign-in:** Neon Auth email OTP + the student-list gate (replace the demo cookie sign-in; keep `lib/auth/session.ts` API).
3. **Push notifications** (Web Push, VAPID keys exist): deadline 2 days / same day, new assignment, status marked; "Remind me" button on the assignment sheet.
4. **Docs drift:** `AGENTS.md` §4–5, `docs/PROJECT_OVERVIEW.md`, `docs/design_system.md` still describe the bottom tab bar, topic-bound notes and "note links cut". Update them to the decisions in `NOTES.md`.
5. **Rich-text editor** (Tiptap) needs the user's OK for a new dependency; inline `code` isn't rendered in note preview yet.
6. Faculty tools (Phase 3): post announcements, add assignments, mark students, upload materials.
7. Waiting on the user: official RGPV unit-wise syllabus (to replace drafted topics), CY subject differences, real student list format.
8. Clean up: old worktrees in `../weave-wt/` (remove `node_modules` junctions with `cmd /c rmdir`, never `rm -rf`), and old remote design branches (`docs/ui-kit-v0/v2/v3`) that still contain the reference images.
