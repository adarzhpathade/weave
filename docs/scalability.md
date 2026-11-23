# Scalability — 100+ students

## Target
Pilot: one department, 100–300 students, peak ~150 concurrent (e.g. the night before an exam or a deadline).
Must stay fast (p95 < 800 ms) and within free/low-cost tiers.

## Where the limits really are
| Area | Risk | Plan |
|---|---|---|
| Database connections | Serverless functions opening too many connections | Neon **pooled** URL (PgBouncer) for the app; `attachDatabasePool` on Vercel; unpooled only for migrations |
| Slow queries | Home/Subjects progress aggregates over notes (later quizzes) | Indexes (see `database_schema.md`), one aggregated query per widget, no N+1; `EXPLAIN ANALYZE` the top 10 queries |
| Repeated reads | Every tab switch re-queries | Next.js caching per user (tag `user:<id>`), revalidate on write; SW stale-while-revalidate on the client |
| AI quota | Free-tier rate limits of Groq and Gemini (requests/tokens per minute and per day, shared by all students on one key) | Two providers with automatic chat fallback (Groq ⇄ Gemini), per-student daily caps, quiz/analysis caching, embeddings queued in background, clear "try again" UX, optional paid key |
| Embedding backlog | Many notes saved at once | Debounced embedding, batched calls, retry with backoff |
| Push fan-out | Reminder cron for all students | Batch sends (e.g. 50 at a time), drop dead subscriptions |
| Client performance | Mid-range Android phones | Route JS budget < 200 KB, lazy editor/charts, transform/opacity animations only |
| Cold starts | First request after idle | Vercel Fluid Compute; Neon autoscaling with a short suspend timeout on production |

## Load test (before release)
- Tool: **k6**, scripts in `tests/load/`.
- Seed 300 students on a Neon test branch.
- Scenario: 200 virtual students, ramp 0→200 over 2 min, hold 5 min. Each: login → home → subjects → open unit → open topic → edit note (save every 5 s) → assignments → profile.
- Pass: p95 < 800 ms for pages/actions, error rate < 1%, DB CPU < 70%.
- Record results (charts + numbers) in `docs/testing.md` — good material for the report and viva.

## Cost estimate (pilot)
Vercel Hobby/Pro, Neon free/launch tier, Groq + Gemini free tiers with caps → ~₹0–2,000/month for 300 students. Update with real numbers after the pilot.
