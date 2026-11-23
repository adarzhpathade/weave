# Roadmap

Rule: one screen at a time, finished completely (UI from reference + real data + all states + motion + mobile + test)
before the next one starts. Scope is the **core** in `PROJECT_OVERVIEW.md`; extras wait for Phase 4.

## Phase 0 — Foundation
- [x] 0.1 Repo, AGENTS.md, CLAUDE.md, worker rules, orchestration scripts, project + academic docs
- [x] 0.2 GitHub repo: https://github.com/adarzhpathade/weave (public, squash-merge only)
- [x] 0.3 Scaffold Next.js + TS strict + Tailwind 4 + shadcn + ESLint/Prettier + Vitest/Playwright; scripts from AGENTS.md §11
- [x] 0.4 New Neon project (Singapore): Postgres + pgvector, Auth, storage; `.env.example`; env validation (`lib/env.ts`)
- [ ] 0.5 Drizzle schema v1 + migrations + seed (`database_schema.md`: CSIT department, CSIT + CY programs, divisions for years 2–4, placeholder syllabus, ~30 students per division, ~60 days of notes + marks, 2–3 demo logins) on a Neon dev branch
- [ ] 0.6 Auth: Neon Auth sign-in + student-list gate, guards (`requireStudent()`), onboarding data flow
- [ ] 0.7 PWA base: manifest, icons, service worker, offline page, install prompt
- [ ] 0.8 Vercel project + first preview deploy

## Phase 1 — Design system (needs references)
- [ ] 1.1 Reference index in `design/README.md`; measurements into `docs/design_system.md`
- [ ] 1.2 Tokens (color, type, spacing, radius, motion) + fonts
- [ ] 1.3 Core components on `/lab` (see design_system.md list)
- [ ] 1.4 App shell: top bar (desktop), bottom tab bar (mobile: Home · Subjects · Assignments · Profile), page transitions
- [ ] 1.5 **User approval of `/lab` on phone + desktop**

## Phase 2 — Core student app
- [ ] 2.1 Login + onboarding
- [ ] 2.2 Home (deadlines + semester / subject progress) with the progress engine (`lib/progress`) + tests
- [ ] 2.3 Subjects → Unit → Topic
- [ ] 2.4 Notes inside topics: editor, auto-save, delete with undo, search
- [ ] 2.5 Assignments (list, detail, countdown, status, marks)
- [ ] 2.6 Web push reminders (cron) + on/off settings
- [ ] 2.7 Profile (details, semester switch, install, sign out)

## Phase 3 — Department-ready
- [ ] 3.1 Admin CSV import (student list, syllabus + program semester plan); move divisions to the next semester
- [ ] 3.2 Faculty web panel: create assignments, mark status + marks, upload material, class progress
- [ ] 3.3 Hardening: security review, rate limits, error logging, backups
- [ ] 3.4 Load test (k6, 200 VUs) + Lighthouse + a11y pass
- [ ] 3.5 Pilot with one division; collect feedback

## Phase 4 — Extras (only if Phases 2–3 are finished)
- [ ] 4.1 Material ingestion (faculty PDFs → chunks → embeddings)
- [ ] 4.2 AI tutor (RAG, streaming, citations, quotas)
- [ ] 4.3 Practice quizzes (feed into progress)
- [ ] 4.4 Graph view
- [ ] 4.5 Offline note editing (IndexedDB queue + sync)

## Phase 5 — Academic deliverables
- [ ] 5.1 Report (from `academic/report_outline.md`) with diagrams and test results
- [ ] 5.2 PPT + demo script + viva prep
