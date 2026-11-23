# Scaffold the app and set up Neon (Phase 0.3 + 0.4)
- Date / tool + model / branch: 2026-11-23 · Claude Code (Opus 5.5), done directly (setup needs a shell) · `chore/scaffold`, `chore/neon-setup`

## What changed
**0.3 — scaffold (`chore/scaffold`)**
- `package.json`, `package-lock.json` — Next.js 16.4.6, React 19.3, Tailwind 4.3, shadcn (Base UI), Drizzle, Neon serverless driver, Zod; dev tools: Prettier (+ Tailwind plugin), eslint-config-prettier, Vitest, Playwright, drizzle-kit, tsx. Scripts from AGENTS.md §11 plus `format`, `format:check`, `db:studio`, `test:watch`.
- `next.config.ts`, `tsconfig.json` — create-next-app defaults (Tailwind via the Turbopack loader, `cacheComponents`, strict TS).
- `eslint.config.mjs` — Next core-web-vitals + TS rules, Prettier, `no-explicit-any` and `consistent-type-imports` as errors.
- `.prettierrc.json`, `.prettierignore` — LF, width 100, Tailwind class sorting; Markdown is left hand-formatted.
- `components.json`, `components/ui/button.tsx`, `lib/utils.ts` — shadcn init (`base-nova`); button imports `cn` from `@/lib/utils`.
- `app/globals.css` — shadcn placeholder tokens; system font stack placeholder (fonts come in Phase 1).
- `app/layout.tsx` — Weave metadata, `viewport-fit=cover`, Google fonts removed.
- `app/page.tsx` — placeholder home ("Weave").
- `vitest.config.ts`, `lib/utils.test.ts` — node-env unit tests.
- `playwright.config.ts`, `e2e/smoke.spec.ts` — mobile 390×844 + desktop 1440×900 projects; smoke test.
- `AGENTS.md` — Next.js-managed "agent rules" block appended by `next dev` (kept so the tree stays clean).

**0.4 — Neon (`chore/neon-setup`)**
- Neon (cloud): project `weave` (`proud-sky-40049407`, Singapore, PG 18), pgvector 0.8.7, Managed Neon Auth (Better Auth), private bucket `materials`, storage credential `weave-app-local`.
- `.env.local` (git-ignored, not committed) — real values for the above.
- `.env.example` — every variable, with where to get it.
- `lib/envSchema.ts` + `lib/envSchema.test.ts` — Zod schema for server env; clear error listing every bad variable.
- `lib/env.ts` — `server-only` validated `env` export.
- `drizzle.config.ts` — unpooled URL, schema `lib/db/schema`, migrations `lib/db/migrations`, `public` schema only.
- `lib/db/index.ts` — Drizzle over the Neon HTTP driver (pooled URL).
- `docs/roadmap.md` — 0.3 and 0.4 ticked. `NOTES.md` — decisions below. `HANDOFF.md` — updated.

## Design decisions
None. Colours and radius are shadcn placeholders until the Phase 1 tokens from the references.

## Assumptions
See NOTES.md entries dated 2026-11-23 (scaffold versions, Base UI, no web fonts yet, Vitest without the React plugin, `e2e/` folder, Neon IDs and free-plan limits, env names, Drizzle driver, `.mts` for top-level await, the sign-up domain-restriction risk).

## Verified
- `npm run typecheck`, `npm run lint`, `npm test` (6 tests), `npm run build`, `npm run e2e` (mobile + desktop) all pass.
- Pooled and unpooled connections answer (PostgreSQL 18.7, vector 0.8.7, 9 `neon_auth` tables); `.env.local` passes the schema.
- Not verified: an actual S3 call with the storage credential (no S3 client installed yet; it's checked when uploads are built).

## Not done / follow-ups
- Neon CLI login expired — the user should run `neon login` once.
- 0.6: college-domain restriction can't block sign-up in Managed Auth (see NOTES.md); decide with the user.
- 0.5 next: Drizzle schema v1 + migrations + seed.
