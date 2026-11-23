# PPT and viva preparation

## Slide outline (12–15 slides)
1. Title · 2. Problem (scattered material, missed deadlines, disconnected notes, ungrounded AI) · 3. Objectives ·
4. Solution: three layers · 5. Live demo plan · 6. Architecture · 7. Database / ER · 8. Progress formula ·
9. RAG pipeline · 10. PWA + push · 11. Scalability + load test results · 12. Testing summary ·
13. Screens (mobile + desktop) · 14. Future scope · 15. Thank you / Q&A

## Demo script (5 minutes)
1. Install the app on a phone from the link (show the home-screen icon).
2. Login as the demo student → dashboard (stats animate in).
3. Graph view → open a weak unit → see missing topics.
4. Write a short note under a missing topic → topic turns ✅ → % rises.
5. Ask the AI tutor a question → answer with citation → tap the citation.
6. Take a 5-question practice quiz.
7. Show assignment countdown + a push notification.
8. Turn on airplane mode → app still opens with last data.

## Likely viva questions
| Question | Key points |
|---|---|
| Why a PWA and not a native app? | One codebase, installable, offline, push, no store approval, cheaper |
| How does RAG work here? | Embeddings in pgvector, permission-filtered similarity search, sources in prompt, citations |
| How do you stop the AI from making things up? | Grounding-only prompt, similarity threshold, "not covered" response, citations |
| How is progress calculated? | Formula in `AGENTS.md` §4 with a worked example |
| How do you keep notes private? | Owner check on every query/action; faculty see aggregates; AI context limited to own notes |
| How does it handle 100+ students? | Pooled connections, indexes, caching, quotas; k6 results |
| How do push notifications work? | VAPID keys, push subscription, cron, service worker shows the notification |
| What happens offline? | Service worker caching strategies; IndexedDB queue for note edits |
| Why Postgres and not MongoDB? | Relational curriculum data, joins, transactions, pgvector in the same DB |
| What would you add next? | Faculty analytics, ERP/attendance integration, multilingual, native wrappers |
