# AGENTS.md — Weave

> Rules for every AI agent working in this repo (Claude Code, Gemini/agy, Codex, subagents).
> Read this file fully before changing anything. If it conflicts with a direct instruction from the user, the user wins.
> App name: **Weave** — it weaves the syllabus, your notes and your deadlines into one fabric.

---

## 1. What we are building

**Weave** is an installable PWA for the students of the CSIT department (programs CSIT and CY, 2nd–4th year).
It shows their syllabus (Semester → Subject → Unit → Topic) with progress, lets them write private notes under each topic,
and keeps their assignments and deadlines in front of them with push reminders.
AI features (tutor, quizzes) and the graph view are **later extras** (Phase 4), not part of the core.

> *"Weave connects your syllabus, your notes and your deadlines into one fabric, and shows you what you know and what you're missing."*

- **Build order:** the **core student PWA first** (Phase 2). Faculty/admin tools in Phase 3. Extras only in Phase 4.
- **Core screens only:** Login + onboarding · Home · Subjects → Unit → Topic (notes inside topics) · Assignments (+ push) · Profile. See `docs/PROJECT_OVERVIEW.md` for what is core, later and cut.
- **Goal:** a college minor project that is good enough for the department to **use every day** (100+ students).
- **Quality bar:** pixel-perfect to the user's references, Awwwards-level motion, native-app feel on phones.
- **Rule:** few features, each one finished completely (real data, all states, motion, mobile, tested). Never many half-built features.

Read `docs/PROJECT_OVERVIEW.md` for the product story and `docs/roadmap.md` for the current phase.

---

## 2. Tech stack

| Area | Choice | Notes |
|---|---|---|
| Framework | **Next.js (App Router, latest stable)** + React 19 | This Next.js has breaking changes vs. training data. Read `node_modules/next/dist/docs/` before using an API |
| Language | **TypeScript strict** | No `any`; use `unknown` + narrowing |
| Styling | **Tailwind CSS 4** | All tokens as CSS variables in `app/globals.css` (no tailwind.config) |
| UI primitives | **shadcn/ui** (Base UI) | Fully restyled to the references; `cn()` from `@/lib/utils` |
| Motion | **Motion** (UI), **GSAP** (timelines/scroll), **Lenis** (smooth scroll, desktop only) | See §8 |
| PWA | `app/manifest.ts` + service worker (**Serwist**, or hand-written `public/sw.js` if Serwist does not support the bundler) + **Web Push** (`web-push`, VAPID) | See `docs/pwa.md` |
| Database | **Neon Postgres** + **pgvector**, **Drizzle ORM** | Pooled URL for the app, unpooled for migrations |
| Auth | **Neon Auth** (Managed Better Auth) | Only students on the department list (`students` table) get in; `ALLOWED_EMAIL_DOMAINS` as an extra check |
| AI (Phase 4) | **Vercel AI SDK** + **Groq** (chat, quizzes — fast) + **Google Gemini** (embeddings, PDF/vision, fallback chat) | Provider routing and model IDs only in `lib/ai/config.ts`; see `docs/ai.md` |
| Files | Neon Object Storage (private, presigned URLs) | Faculty uploads only |
| Validation | **Zod** | Every input, every AI structured output |
| Client data | **TanStack Query** (only where needed) + **Zustand** (small UI state) | |
| Editor | **Tiptap** (stored as Markdown) | |
| Graph (Phase 4) | **React Flow** + dagre | Tree layout, no radial view |
| Charts | Recharts / visx (decide per reference) | |
| Hosting | **Vercel** (Fluid Compute, Node runtime) | No Edge runtime |
| Testing | **Vitest** (logic), **Playwright** (E2E + visual), **k6** (load) | |

Adding a major library needs the user's OK. Small utilities are fine if they clearly save effort; mention them in the report.

---

## 3. Architecture (one app, no mock layer)

```
app/                     routes (Server Components by default)
  (public)/              landing, login
  (app)/                 student PWA screens (bottom tab bar on mobile, top bar on desktop)
  api/                   streaming AI, uploads, push, cron
components/
  ui/                    restyled primitives (Button, Card, Sheet, ...)
  motion/                motion wrappers + tokens.ts
  <feature>/             feature components (home/, subjects/, notes/, assignments/, profile/)
lib/
  db/                    schema/, queries/, migrations/, seed/
  auth/                  session, guards (role + scope checks)
  actions/               server actions (validate with Zod → call lib/)
  progress/              the ONLY place the progress formula lives
  ai/                    config.ts, prompts/, rag/, schemas.ts
  push/                  web push helpers
  utils.ts               cn()
design/references/       the user's reference images (source of truth for UI)
docs/                    project + academic docs
tasks/                   orchestration task files
```

- **Data flow:** Server Component → `lib/db/queries` (read) · Client → server action in `lib/actions` → `lib/` (write).
- Client components never import `lib/db`, `lib/ai`, `lib/auth/server` or secrets.
- Every query is scoped to the current user (owner / program / division / semester). Role and scope are checked **on the server** in every action and route.
- Keep new files inside this structure. No new top-level folders without the user's OK.

---

## 4. Domain rules (non-negotiable)

**Structure.** Department (CSIT) → Programs (CSIT, CY) → Divisions (CSIT-1, CSIT-2, CY — one per program per year, each with a current semester 3–8).
A subject (with its units and topics) is defined **once**; each program's semester plan (`program_subjects`) places it in a semester.
CY shares most subjects with CSIT, has extra subjects, and some shared subjects sit in a different semester. 1st year is not in the app.

**Users.** `student` (a row in the department's student list, linked to a login on first sign-in) and later `faculty` / `admin`.
Sign-in only for emails on the student list. Store only the personal fields listed in `docs/database_schema.md`.

**Semesters.** Switched from the top bar / profile, never inside the graph. Current + past semesters are open; future ones are visible but locked.

**Curriculum.** Subject → Unit → Topic (ordered, faculty/admin-defined). Every note belongs to exactly one topic.

**Notes.** Private to the owner — never visible to other students or to faculty (faculty only ever see aggregated progress).
Stored as Markdown, written inside a topic. Debounced auto-save. No links/backlinks between notes (cut).

**Assignments.** Submission is **offline, on paper**. Never build online submission or student file upload.
Faculty marks each student: Submitted / Late / Not submitted (+ optional marks, remark). Students see details, live countdown, status.

**Progress formula** (lives only in `lib/progress/`):
```
Topic covered = ≥1 note on the topic AND (no quiz attempted OR best quiz score ≥ 50%)
Unit %        = 0.7 × (covered topics / total topics) + 0.3 × unit quiz average
                (no quiz attempted in the unit → Unit % = covered topics / total topics)
Subject %     = average of its units' %       Semester % = average of its subjects' %
```
Status bands: Not started 0% · Low 1–39% · In progress 40–75% · Mastered > 75%. Never show progress by color alone.

---

## 5. Design rules — pixel-perfect

- **Source of truth = `design/references/`** (images/videos the user provides) + `docs/design_system.md`.
- Never invent a visual style. If a state is missing from the references (hover, empty, error, mobile), choose the option most consistent with the references and list it in your report.
- **Every visual value is a token** (color, font, size, spacing, radius, border, shadow, blur, duration, easing) in `app/globals.css` / `components/motion/tokens.ts`. No hex codes or arbitrary `[...]` values in components.
- **Pixel-perfect workflow per screen:**
  1. Read the reference; write down measurements (grid, spacing, font sizes) in the task's report.
  2. Build at the reference's exact viewport width first, then adapt to the other breakpoints.
  3. The orchestrator compares a Playwright screenshot with the reference side by side before accepting.
- **Breakpoints:** mobile 360–430 px (primary, PWA), tablet 768 px, desktop 1280/1440 px.
- **Navigation:** bottom tab bar on mobile, top bar on desktop. No sidebar.
- Every data view has **loading (skeleton), empty and error states**.
- Fonts via `next/font/local` (files in `public/fonts/`); images via `next/image`.

---

## 6. PWA rules

- Installable on Android + iOS: `app/manifest.ts` (name, short_name, icons 192/512 + maskable, `display: "standalone"`, theme/background colors from tokens), Apple touch icon and splash meta.
- Service worker: precache the app shell, network-first for pages and data, cache-first for fonts/images, a branded **offline page**.
- Offline: the last-seen dashboard, notes list and assignments stay readable offline. Note edits made offline are queued and synced (later phase; see `docs/pwa.md`).
- **Web Push** for deadlines (2 days, same day), new assignment, status marked. Ask for permission only after a user action, never on first load. iOS push works only after install (explain this in the UI).
- Feel like an app: `viewport-fit=cover` + safe-area insets, no 300 ms tap delay, no text selection on chrome, `overscroll-behavior` set, tap highlight removed, view transitions between screens.

---

## 7. Performance and scale (100+ students)

- Budgets (mid-range Android, 4G): LCP < 2.5 s, INP < 200 ms, CLS < 0.05, first-load JS per route < 200 KB gzip.
- Lazy-load heavy parts (graph, editor, charts, GSAP plugins, Lottie). Never ship Three.js to app screens.
- DB: pooled connections, indexes for every hot query, paginate lists, no N+1 queries (one query per screen section where possible).
- Cache per-user reads with Next.js caching + tag revalidation after writes.
- AI: per-student daily limits, cache quizzes/analyses, friendly rate-limit messages, never crash on quota errors.
- Before release: k6 load test with 200 virtual students (see `docs/scalability.md`).

---

## 8. Motion

- **Motion** for components (enter/exit, layout, gestures, springs). **GSAP** for timelines and scroll stories. Never both on the same element.
- Timings, easings and springs live in `components/motion/tokens.ts`. Replicate any motion shown in the references exactly.
- Animate only `transform` and `opacity` where possible; 60 fps on a mid-range phone.
- Respect `prefers-reduced-motion` everywhere. Animation never blocks input or delays content by more than ~300 ms.
- Clean up GSAP (`useGSAP` / `gsap.context()`), no leaking ScrollTriggers.

---

## 9. AI rules

- Two providers: **Groq** = primary for chat, quizzes and note analysis (speed); **Gemini** = embeddings, PDF/vision, and chat fallback. On 429/timeout/5xx the primary falls back once to the other, then a friendly message.
- Provider routing and model IDs **only** in `lib/ai/config.ts` (`getModel(task)`); no other file names a provider. Prompts **only** in `lib/ai/prompts/`.
- The embedding model is fixed (changing it means re-embedding everything).
- Answer **only** from retrieved sources (faculty material for the student's sections + the student's own notes). Cite every claim. If nothing relevant is found, say "Not covered in your material" and suggest a unit/topic.
- Never send another student's data to a model. RAG retrieval applies the same permission filters as normal queries.
- Structured outputs (quiz, note analysis, gap finder) are validated with Zod schemas from `lib/ai/schemas.ts`.
- Details: `docs/ai.md`.

---

## 10. Coding conventions

- Server Components by default; `"use client"` only for interactivity, motion, browser APIs.
- Components `PascalCase.tsx`, hooks `useCamelCase.ts`, utilities `camelCase.ts`, server actions verb-first (`createNote`), tables `snake_case` plural, env vars `SCREAMING_SNAKE_CASE`.
- Server actions return `{ ok: true, data } | { ok: false, error: { code, message } }`. User-friendly messages; details logged server-side.
- Small functions, early returns, comments only where logic is not obvious. Code must be explainable in a viva.
- UUID primary keys; `created_at` / `updated_at` on every table. Deleting a topic never silently deletes notes.
- Never hardcode secrets, model IDs, prompts in components, or colors.

---

## 11. Commands and verification

```bash
npm run dev          # dev server (port 3000)
npm run build        # production build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run test         # vitest
npm run e2e          # playwright
npm run db:generate  # drizzle migrations
npm run db:migrate
npm run db:seed
```

- **Workers:** do not run build/lint/tests after every step. Run `typecheck` once at the end of a task if your tool allows shell; otherwise the orchestrator runs it.
- **Orchestrator:** runs typecheck + lint + tests and a Playwright screenshot check once per finished task, before merging.
- Do not install dependencies inside feature tasks; dependency changes are their own `chore/` task.

---

## 12. Git

- `main` is always runnable. Never commit directly to `main`; one branch per task: `feat/<id>-<slug>`, `fix/<slug>`, `chore/<slug>`, `docs/<slug>`.
- Conventional commits with a scope: `feat(dashboard): add coverage rings`. Squash-merge PRs.
- Never commit `.env*` (except `.env.example`), secrets or large binaries.

---

## 13. Change file (every session that changes files)

Write `docs/changes/YYYY-MM-DD-<slug>.md` before ending (suffix `-2` if it exists):
```
# <title>
- Date / tool + model / branch:
## What changed      (every file, one line each: what and why; UI tweaks: component, property, old → new)
## Design decisions  (tokens added/changed, spacing, type, motion)
## Assumptions       (also appended to NOTES.md)
## Not done / follow-ups
```

---

## 14. Don't

- ❌ Online assignment submission or student uploads.
- ❌ Radial graph view; semester switcher inside the graph; a sidebar.
- ❌ Building "later" or "cut" features from `docs/PROJECT_OVERVIEW.md` before the core is finished (streaks, heatmaps, note links, timetable, attendance, ...).
- ❌ Collecting personal data beyond `docs/database_schema.md` (address, parents, DOB, Aadhaar, caste).
- ❌ Showing a student's notes to anyone else.
- ❌ AI answers from outside the provided material.
- ❌ Hex colors / arbitrary values in components; hardcoded model IDs, prompts or secrets.
- ❌ Inventing a visual style when the references don't cover it — follow the closest reference.
- ❌ Marking a screen "done" without loading/empty/error states, mobile layout and reduced-motion fallback.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
