# Roadmap

Rule: one screen at a time, finished completely (UI from reference + real data + all states + motion + mobile + test)
before the next one starts.

## Phase 0 — Foundation
- [x] 0.1 Repo, AGENTS.md, CLAUDE.md, worker rules, orchestration scripts, project + academic docs
- [ ] 0.2 GitHub repo (private) — name chosen: Weave
- [ ] 0.3 Scaffold Next.js + TS strict + Tailwind 4 + shadcn + ESLint/Prettier + Vitest/Playwright; scripts from AGENTS.md §11
- [ ] 0.4 New Neon project (Singapore): Postgres + pgvector, Auth, storage; `.env.example`; env validation (`lib/env.ts`)
- [ ] 0.5 Drizzle schema v1 + migrations + seed (1 branch, 8 semesters, Sem current filled, 3 sections × ~30 students, ~60 days of activity)
- [ ] 0.6 Auth with college-domain restriction, guards, onboarding data flow
- [ ] 0.7 PWA base: manifest, icons, service worker, offline page, install prompt
- [ ] 0.8 Vercel project + first preview deploy

## Phase 1 — Design system (needs references)
- [ ] 1.1 Reference index in `design/README.md`; measurements into `docs/design_system.md`
- [ ] 1.2 Tokens (color, type, spacing, radius, motion) + fonts
- [ ] 1.3 Core components on `/lab` (see design_system.md list)
- [ ] 1.4 App shell: top bar (desktop), bottom tab bar (mobile), page transitions
- [ ] 1.5 **User approval of `/lab` on phone + desktop**

## Phase 2 — Core student screens
- [ ] 2.1 Login + onboarding
- [ ] 2.2 Dashboard
- [ ] 2.3 Subjects list + Unit page
- [ ] 2.4 Notes list + editor (links, backlinks, search, auto-save)
- [ ] 2.5 Assignments (countdown, status)
- [ ] 2.6 Graph view (tree, card, unit sheet)
- [ ] 2.7 Profile + notifications list

## Phase 3 — Intelligence + app power
- [ ] 3.1 Progress engine (`lib/progress`) wired everywhere + tests
- [ ] 3.2 Material ingestion (seeded PDFs → chunks → embeddings)
- [ ] 3.3 AI tutor (RAG, streaming, citations, quotas)
- [ ] 3.4 Practice quizzes
- [ ] 3.5 Analyze note + gap finder
- [ ] 3.6 Web push reminders (cron) + preferences
- [ ] 3.7 Offline notes (IndexedDB queue + sync)

## Phase 4 — Department-ready
- [ ] 4.1 Admin CSV import (students, curriculum)
- [ ] 4.2 Faculty web panel: upload material, create assignments, mark status, class progress
- [ ] 4.3 Hardening: security review, rate limits, error logging, backups
- [ ] 4.4 Load test (k6, 200 VUs) + Lighthouse + a11y pass
- [ ] 4.5 Pilot with one section; collect feedback

## Phase 5 — Academic deliverables
- [ ] 5.1 Report (from `academic/report_outline.md`) with diagrams and test results
- [ ] 5.2 PPT + demo script + viva prep
