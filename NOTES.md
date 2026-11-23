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
