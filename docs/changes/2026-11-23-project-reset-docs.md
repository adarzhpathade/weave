# Project reset: agent rules, orchestration and project docs
- Date / tool + model / branch: 2026-11-23 / Claude Code (Opus 5.5) / main (initial commit)

## What changed
- `AGENTS.md` — new project rules (stack, architecture, domain, pixel-perfect design, PWA, scale, motion, AI, conventions)
- `CLAUDE.md` — orchestrator role, model routing (Gemini 4 Argon/Neon/Hydrogen, Flash, Claude subagents), task loop, review checklist
- `WORKER_RULES.md`, `tasks/_TEMPLATE.md`, `spawn.sh`, `watch.sh` — worker workflow (worktrees in `../sutra-wt/`, model per task)
- `README.md`, `NOTES.md`, `.gitignore`, `design/README.md`
- `docs/` — PROJECT_OVERVIEW, requirements (SRS), architecture, database_schema, design_system (template), pwa, ai, scalability, testing, roadmap
- `docs/academic/` — synopsis, report_outline, viva_prep

## Design decisions
- None yet; design system waits for the user's references.

## Assumptions
- See NOTES.md entries dated 2026-11-23 (working name Sutra, model tiers, mobile-first, new Neon project).

## Not done / follow-ups
- Final name + GitHub repo; Phase 0.3+ (scaffold, Neon, auth, PWA base); references from the user.
