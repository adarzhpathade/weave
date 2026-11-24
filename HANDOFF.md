# HANDOFF — start here (new Claude Code session)

> Last updated 2026-11-24 (evening), after real sign-in, push notifications and the pitch deck went live.
> Read this, then `AGENTS.md`, `CLAUDE.md`, `NOTES.md` (decision log) and the newest files in `docs/changes/`. Update this file at the end of each session.

## Where we are
- **App:** **Weave**, a student PWA for the CSIT department (programs CSIT + CY): syllabus with progress, private linked notes, assignments with countdowns, notifications.
- **Live:** https://weave-sigma-sepia.vercel.app (public). Demo sign-in: `demo.student@weave.test` (Aarav Sharma, CSIT-2, sem 5, no code needed). `weave-adarz.vercel.app` is behind Vercel login; share only the sigma-sepia link.
- **Pitch deck (team DevZ):** https://weave-sigma-sepia.vercel.app/deck/index.html · PDF: `/deck/Weave-DevZ.pdf` (source `public/deck/`). 6 light slides: cover, problem, solution, stack, flow, similar apps.
- **Repo:** https://github.com/adarzhpathade/weave (public; squash-merge). `main` = what is live (last: `9fe6a65`, PR #18). Every merge to `main` auto-deploys (Vercel project `weave`, team `adarz`, id `prj_SSBauktKXKIVDSaKLuY2VJ4tapwp`, functions in `sin1`).
- **Built and working:**
  - **Login:** email → 6-digit code by email (Neon Auth email OTP, `lib/actions/auth.ts`: `requestSignInCode` / `verifySignInCode`). Only emails on the `students` list get in. Demo email skips the code. Session = HMAC `weave_session` cookie; `proxy.ts` gates app routes.
  - Home, menu pill + full-screen menu, bell notifications panel, Subjects → units → topics, Assignments (list, calendar, detail sheet), Notes (editor, auto-save, links, backlinks, inline `code`), Profile, Graph (SVG tree).
  - **Push:** VAPID subscriptions saved per device (`lib/actions/push.ts`, `lib/push/send.ts`, `public/sw.js` push + click handlers). UI: "Phone notifications" switch in Profile and "Remind me" on the assignment sheet (`components/pwa/usePush.ts`, `PushToggle.tsx`). Permission only after a tap; iPhone shows the "Add to Home Screen" hint.
  - PWA: manifest, icons, offline page, service worker (registered in production only).
- **Checks at last merge:** typecheck, lint, 55 vitest tests, `next build` pass; Playwright at 390 px locally and on the live site, no errors.

## Data and secrets
- **Neon** project `proud-sky-40049407` (Singapore). Schema in `lib/db/schema/` (incl. `push_subscriptions`, `push_log`). Seed: `npm run db:seed` (idempotent): 44 subjects, 1,100 **drafted** topics, 270 students, demo student data.
- Neon branch **`dev-teammate`** (`br-super-dew-biuw2s7o`) is the teammate's DB. Don't delete it while she is working.
- Secrets only in git-ignored `.env.local` and on Vercel (production + preview). Added this session: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET`. Never print secret values (the auto-mode classifier blocks it; pipe values straight into `vercel env add`).
- The folder is now linked to Vercel (`.vercel/`, git-ignored). Careful: `vercel link` / `vercel env pull` rewrite `.env.local`; check the key names afterwards (it once dropped `AWS_ENDPOINT_URL_S3`).

## Team
- **Teammate:** GitHub **AashiBindal**, uses Antigravity IDE with Gemini 3.8 Flash, does backend tasks. Her entry point: `tasks/BACKEND_START_HERE.md`. She did b1 (sign-in) and b2 (push backend).
- **In progress (hers): `tasks/b3-push-reminders.md`**: `runDeadlineReminders` (2 days / same day, Asia/Kolkata), `notifyNewAssignment`, `notifyStatusMarked`, cron route `app/api/cron/push-reminders/route.ts` (Bearer `CRON_SECRET`). When her PR arrives: review the diff, check it has no `db.transaction` (neon-http has no transactions), run typecheck/lint/tests/build, then merge.

## How we work (user rules — don't re-ask)
- **Claude (Opus) = orchestrator/reviewer** with minimal tokens. **Sonnet workers build everything visible** (`./spawn.sh claude <task>`, `model: sonnet`). **agy/teammate does backend.** Use the cheapest model that fits.
- Launch workers **one at a time ~20 s apart**. Workers have no shell, so the orchestrator runs typecheck/lint/tests and screenshots.
- To preview worker output: copy their files onto a branch in the main folder (Turbopack can't follow the worktree `node_modules` junction). Remove worktrees with `cmd /c rmdir <wt>\node_modules` and then `git worktree remove`.
- `gh` via the PowerShell tool. `gh pr merge` is often blocked by the classifier: open the PR and ask the user to merge.
- Design source of truth = `design/ui-kit/index.html` + `app/globals.css`. Style rules: no dot-matrix numbers, no italic/coloured second words in titles (ink + grey word), no playful shapes, no cards on Home (hairlines), notifications via the bell panel.
- Reference images stay **local only**. Reply in simple English. Decide implementation details yourself, log them in `NOTES.md`. Ask before public or irreversible actions.
- Local dev weirdness (Turbopack panic, "module factory is not available", instant-validation errors) usually means a stale cache: stop the server, `rm -rf .next`, restart.

## Open items / next steps
1. **Review and merge b3** (teammate) when her PR arrives.
2. **Schedule the reminder cron** after b3: add a Vercel Schedule (or `crons`) calling `/api/cron/push-reminders` with `Authorization: Bearer $CRON_SECRET`, e.g. every hour. This isn't in b3's `files_allowed`, so it's our task.
3. **Real-device tests (user):** sign in with a real student email (code arrives?), install the PWA on a phone and turn on Phone notifications, then trigger a test push.
4. **Rich-text editor** (Tiptap) needs the user's OK for a new dependency.
5. **Faculty tools (Phase 3):** add assignments, mark students (fires `notifyStatusMarked`), post notifications, upload materials.
6. **Waiting on the user:** official RGPV unit-wise syllabus (to replace the drafted topics), CY subject differences, real student list format.
7. Vercel CLI is old (64.7 → 66.x); suggest `npm i -g vercel@latest` if CLI issues appear.
8. Remote branch `docs/csit-syllabus` (closed PR #7) was kept; delete it only if the user agrees.
