# NOTES.md — assumptions and decisions log

Newest at the bottom. Format: `- YYYY-MM-DD — decision/assumption — why`.

- 2026-11-23 — Fresh restart in `E:\Projects\College Projects\nodus`; nothing reused from the old NODUS repo (code, design references, docs). — user request.
- 2026-11-23 — App name **Weave** (chosen by the user from a shortlist): the app weaves syllabus, notes and deadlines together. Folder stays `nodus`; GitHub repo name follows the app name. — user decision.
- 2026-11-23 — Student PWA first; faculty/admin tools in Phase 4. Until then curriculum, students and assignments come from seed data + an admin CSV import script. — user request.
- 2026-11-23 — Mobile-first (360–430 px primary). Bottom tab bar on mobile, top bar on desktop, no sidebar. — PWA is used on phones.
- 2026-11-23 — One Next.js app, no BE/FE split and no mock gateway layer; screens are built vertically (UI + data + states) one at a time. — the old split produced lots of code that was never seen running.
- 2026-11-23 — Model tier assumption: Argon = top, Neon = strong, Hydrogen = light (from `agy models`: "Orchestrator (Argon)" is the g1-pro orchestrator; hydrogen is the lightest element). Verify on the first tasks and update CLAUDE.md. — no official tier list found.
- 2026-11-23 — Keep Neon (Postgres + pgvector + Auth + Object Storage, Singapore region) and Vercel; a NEW Neon project will be created in Phase 0 (not the old nodus-singapore one). — clean start, low latency from India.
- 2026-11-23 — Sign-in restricted to college email domains via `ALLOWED_EMAIL_DOMAINS` (domain not known yet). — department use.
- 2026-11-23 — Web Push (deadline reminders) is in scope because the app is a PWA; old "no push" rule dropped. — user asked for a PWA.
- 2026-11-23 — AI providers: Groq primary for chat/quizzes/analysis (fast streaming), Gemini for embeddings + PDF/vision + chat fallback; automatic one-retry fallback between them. — user agreed; Groq has no embeddings, two providers spread free-tier rate limits.
- 2026-11-23 — Scaffold: Next.js 16.4.6, React 19.3, Tailwind 4.3 through the `@tailwindcss/turbopack` loader (create-next-app default; no PostCSS config), `cacheComponents` + `partialPrefetching` on (create-next-app defaults). — latest stable at scaffold time.
- 2026-11-23 — shadcn initialised with **Base UI** (`base-nova` style, neutral). Its colours/radius in `globals.css` are **placeholders** until the Phase 1 tokens replace them. `cn()` comes from the `cn` package (new shadcn default), re-exported by `lib/utils.ts`; components import it from `@/lib/utils`. — AGENTS.md §2.
- 2026-11-23 — No web fonts yet (system stack placeholder); Geist from Google removed because AGENTS.md wants `next/font/local` and the fonts come from the references. — Phase 1 decides fonts.
- 2026-11-23 — Vitest runs in `node` environment without `@vitejs/plugin-react` (peer conflict with Babel 8; we only unit-test logic). Add it later if component tests are needed. `@types/node` pinned to ^24 to match Node 24. — avoid `--legacy-peer-deps`.
- 2026-11-23 — Playwright specs live in a top-level `e2e/` folder (standard place; no other folder fits AGENTS.md §3). Projects: mobile 390×844, desktop 1440×900. — docs/testing.md.
- 2026-11-23 — `next dev` adds a managed "nextjs-agent-rules" block to AGENTS.md; we commit it so the tree stays clean. — Next.js 16 behaviour.
- 2026-11-23 — `typecheck` = `next typegen && tsc --noEmit` (route types like `LayoutProps` need typegen first). — Next.js 16.
