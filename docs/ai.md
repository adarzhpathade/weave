# AI features

## Providers (two, via the Vercel AI SDK)
| Job | Primary | Fallback | Why |
|---|---|---|---|
| Tutor chat (streaming) | **Groq** | Gemini | Groq streams very fast, so the tutor feels instant |
| Quiz generation, analyze note, gap finder (structured output) | **Groq** | Gemini | Fast + good structured output; Zod validates either way |
| Embeddings (notes + faculty material) | **Gemini** | — (fixed) | Groq has no embedding models; one fixed embedding model keeps stored vectors comparable |
| PDF/slide text cleanup, image → note (vision), very long context | **Gemini** | — | Strong vision + large context window |

- Fallback is automatic: on a rate-limit (429), timeout or 5xx from the primary, retry once on the fallback, then show a friendly "AI is busy, try again" message.
- Changing the embedding model means re-embedding every chunk — avoid it; if needed, do it with a script (`scripts/reembed.ts`).
- Free-tier limits change often: check the current Groq and Gemini limits before Phase 3 and set the per-student caps from them.
- Env: `GROQ_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY` (server only).

## Rules
- Provider routing, model IDs and the embedding dimension live only in `lib/ai/config.ts` (one `getModel(task)` helper; the rest of the code never names a provider).
- Prompts only in `lib/ai/prompts/`. Structured outputs validated by Zod (`lib/ai/schemas.ts`).
- Grounding: answers come **only** from retrieved sources — faculty material for the student's sections + the student's own notes. Never another student's data.
- Quotas: per-student daily limits in `ai_usage` (e.g. 30 tutor messages, 10 quizzes, 20 analyses — tune later). Friendly limit message, never a crash.
- Caching: quizzes per (unit/topic, material hash); note analysis per note content hash.

## Ingestion (faculty material)
```
PDF/PPT upload → extract text per page/slide → chunk (~600 tokens, ~80 overlap)
→ embed → resource_chunks (content, page_or_slide, embedding)
```
Student notes are chunked and embedded the same way into `note_chunks` after save (debounced, background).

## Tutor (RAG)
```
question → guard + quota → embed → vector search (resource_chunks for own sections
+ own note_chunks, filtered by scope) → top-k (k≈8) above a similarity threshold
→ prompt with numbered sources → streamed answer with [source] citations → save message
```
- Answer style: short explanation → example → key points.
- No relevant sources → "Not covered in your material" + suggested unit/topic.

## Practice quiz
Output: `{ question, options[4], correctIndex, explanation, topicId }[]` (5–10), generated only from the unit/topic's faculty material. Score saved to `quiz_attempts` → progress updates.

## Analyze note
Output: `summary`, `suggestedTitle`, `tags[]`, `todos[]`, `suggestedLinks[]` (topics/notes mentioned).

## Gap finder
Topic coverage from `lib/progress` is the primary signal; AI adds a one-line reason and what to study for each missing/weak topic.

## Viva talking points
Why RAG instead of fine-tuning (cheap, updatable, citable) · why pgvector (one DB, permission filters in SQL) · how hallucination is reduced (grounding + threshold + citations) · quota/caching for free-tier limits.
