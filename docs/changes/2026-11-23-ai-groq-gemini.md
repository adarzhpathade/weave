# AI providers: Groq + Gemini
- Date / tool + model / branch: 2026-11-23 / Claude Code (Opus 5.5) / docs/ai-groq-gemini

## What changed
- `AGENTS.md` — stack table AI row and §9: Groq primary (chat, quizzes, analysis), Gemini (embeddings, PDF/vision, fallback), routing only in `lib/ai/config.ts`
- `docs/ai.md` — new "Providers" table, fallback rule, fixed embedding model, env vars
- `docs/architecture.md` — diagram has Groq + Gemini nodes; decision row updated
- `docs/scalability.md` — AI quota row and cost line mention both providers + fallback
- `docs/PROJECT_OVERVIEW.md`, `docs/academic/synopsis.md` — tech summary
- `NOTES.md` — decision logged

## Design decisions
- None (no UI).

## Assumptions
- Groq offers no embedding models; check current free-tier limits of both before Phase 3.

## Not done / follow-ups
- `.env.example` gets `GROQ_API_KEY` + `GOOGLE_GENERATIVE_AI_API_KEY` during Phase 0 scaffold.
