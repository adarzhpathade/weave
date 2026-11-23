# HANDOFF — start here (new Claude Code session)

> Last updated 2026-11-23 after Phase 0.3 + 0.4 (scaffold + Neon) and the scope cut (core app only).
> Read this, then `AGENTS.md`, `CLAUDE.md`, `NOTES.md`, `docs/roadmap.md`. Update this file at the end of each session.

## Where we are
- **App:** **Weave** — student-first PWA that maps the syllabus as a knowledge graph, links private notes, tracks deadlines (push reminders) and has grounded AI. College minor project; goal = department daily use, 100+ students, pixel-perfect, Awwwards-level.
- **Repo:** https://github.com/adarzhpathade/weave (PUBLIC, squash-merge only, auto-delete branches). Local: `E:\Projects\College Projects\weave`.
- Phase 0.1–0.4 done: Next.js 16.4 app scaffolded (Tailwind 4, shadcn Base UI, ESLint/Prettier, Vitest, Playwright) and Neon set up. See `docs/changes/2026-11-23-scaffold-and-neon.md`.
- **Neon:** project `weave` = `proud-sky-40049407` (Singapore, PG 18, branch `main` = `br-raspy-boat-biu51cbq`): pgvector, Managed Neon Auth, private bucket `materials`. Secrets only in git-ignored `.env.local`; names in `.env.example`, validated by `lib/envSchema.ts`.
- The old project `E:\Projects\College Projects\Not Decided` (NODUS) is **abandoned**. Do not reuse its code, design references or docs.

## Decisions already made (don't re-ask)
- **Scope = core only** (user decision 2026-11-23): Login + onboarding · Home · Subjects → Unit → Topic (notes inside topics) · Assignments + push · Profile. Tabs: Home · Subjects · Assignments · Profile. Faculty/admin = Phase 3. AI tutor, quizzes, graph view, offline editing = Phase 4 extras. Streaks, heatmap, note links, notifications page, gap finder, timetable, attendance, results = **cut**. See `docs/PROJECT_OVERVIEW.md`.
- **College structure:** department CSIT → programs CSIT and CY → divisions CSIT-1, CSIT-2, CY per year; years 2–4 (sem 3–8). CY shares most subjects with CSIT, has extra subjects, some in different semesters → subjects defined once + `program_subjects` semester plan. See `docs/database_schema.md`.
- **Sign-in gate = the department's student list** (`students` table), not just the email domain. Minimal personal data only.
- Mobile-first: bottom tab bar on mobile, top bar on desktop, no sidebar.
- One Next.js app, no BE/FE split, no mock gateway. Build one screen at a time, fully finished.
- Stack: see `AGENTS.md` §2 (Next.js, TS strict, Tailwind 4, shadcn/Base UI, Motion/GSAP/Lenis, Neon Postgres+pgvector, Drizzle, Neon Auth, Serwist + Web Push, Vercel).
- AI (Phase 4): **Groq** primary (chat, quizzes), **Gemini** (embeddings, PDF/vision, chat fallback). See `docs/ai.md`.
- Neon: create a **new** project in Singapore (aws-ap-southeast-1) in Phase 0.4 — not the old `nodus-singapore` one.
- Design: **new references are coming from the user** into `design/references/` (naming scheme in `design/README.md`). Phase 1 (design system + `/lab`) cannot start without them, and no screen work happens before the user approves `/lab`.

## User preferences
- Claude = **orchestrator**: plan, write task files, delegate heavy work to Gemini via `agy`, review, merge. Cost-efficient model choice (routing table in `CLAUDE.md`). Top Gemini models may use their own subagents; Claude subagents are fine too.
- Don't ask about implementation details — decide and log in `NOTES.md`. Do ask before public/irreversible actions.
- The user authorized Claude to **merge PRs when the work is good**, but in the 2026-11-23 session the auto-mode classifier blocked `gh pr merge` — open PRs and ask the user to merge.
- Don't run build/lint/tests after every step; once per finished task (see `AGENTS.md` §11).
- Reply in simple English.

## Open items waiting on the user
0. **Merge PRs #4 → #5 → #6** (stacked: scaffold → Neon → scope docs).
1. **Student IDs:** PRN / enrollment no. / roll no. — which ones? Lab batches? (Assumed enrollment_no + roll_no + optional lab_batch.) College email domain (optional extra check).
2. **UI references** for Phase 1.
3. **Real syllabus** (CSIT + CY semester plans) and the student list format — placeholder seed until then.
4. Later: Groq API key (console.groq.com), Gemini API key (aistudio.google.com), real syllabus (CSV), team/guide names for `docs/academic/synopsis.md`.

## Next steps (Phase 0, `docs/roadmap.md`)
- 0.5 Drizzle schema v1 (`docs/database_schema.md`, ~15 tables) + migrations + seed on a Neon **dev branch** — Gemini worker task. Seed script: use `.mts` or `main()` (no top-level await in CJS).
- 0.6 Auth + **student-list gate** + guards + onboarding. Managed Neon Auth can't block account creation, so the gate is in our server code: email not in `students` → sign out with a message.
- 0.7 PWA base — decide Serwist vs hand-written SW, log in NOTES.md.
- 0.8 Vercel project + first preview deploy (ask the user first).

## Machine gotchas (Windows)
- `agy` CLI: `~/AppData/Local/agy/bin` (v1.5.15). Models: `gemini-4-argon-*`, `gemini-4-neon-*`, `gemini-4-hydrogen-*`, `gemini-3.8-flash-*` (`agy models`). Tier order Argon > Neon > Hydrogen is an **unverified assumption**.
- Headless `agy --mode accept-edits -p="..."` works for **file-only** tasks. The auto-mode classifier blocks launching agy with `--dangerously-skip-permissions`; for shell tasks the user runs agy interactively (`spawn.sh` prints the command).
- Headless workers' "completed" notification = launcher exit; real status via `./watch.sh` / `logs/<name>.status`.
- Always review worker output for silent fallbacks and invented APIs (past Gemini bugs: wrong library APIs, undefined vars, duplicated formulas).
- Worktrees: `../weave-wt/<name>`; `node_modules` there is a **junction** — remove only with `cmd /c rmdir`, never `rm -rf` / `Remove-Item -Recurse` / `ln -s` (a wrong delete once wiped the main `node_modules`).
- `gh` is not on Git Bash PATH: use PowerShell and refresh `$env:Path` from Machine + User.
- Neon CLI 8.4.4 login expired (`invalid_grant`); user must run `neon login`. Neon MCP works.
- No `jq`; use `node -e`. Repo enforces LF (`.gitattributes`).
