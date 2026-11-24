---
branch: feat/pitch-deck-build
base: origin/feat/pitch-deck
model: sonnet
files_allowed: public/deck/index.html
subagents: not-allowed
shell: no
---

# pitch-deck — 5-slide GSAP web presentation for Weave

## Goal
One self-contained file `public/deck/index.html` (opens at `/deck/index.html`), presented full-screen on a
laptop/projector (16:9, 1440×810 design size, scales to any screen). Exactly **5 slides**, in this order.
It must look like the Weave app and feel premium: smooth, confident GSAP motion, no gimmicks.

## Look (copy from the app; read `design/ui-kit/index.html` and `app/globals.css` first)
- Fonts: Urbanist (titles/body, 800–900 for titles) + JetBrains Mono (small uppercase labels, wide tracking),
  from Google Fonts. Colors: copy the `--c-*` values from `app/globals.css` into `:root` (bg, app, ink, muted,
  line, lime, accent, late, missing, night, on-night, sub-1..6). Define every value once as a CSS variable.
- Titles: two-tone — first words in grey (`--c-muted`), last word in ink (like "Afternoon, / Aarav" on Home).
  **Never** italic or coloured second words. **No** dot-matrix numbers, **no** playful shapes/stickers/emoji,
  **no** card grids — separate content with 1px hairlines (`--c-line`) and space. Mono labels like "01 — PROBLEM".
- Light slides on `--c-app`; slide 4 (flow) may use the dark night surface for contrast.
- Phone frame for screenshots: simple rounded rect, ink bezel, no notch art. Screenshots are in
  `public/deck/img/` (home, subjects, notes, assignments, graph — 780×1688 PNG, phone width 390).

## Slides and content
**1 — Problem statement.** Label "01 — PROBLEM". Title "Students are / losing the thread".
Four problems as rows divided by hairlines, each: mono number, bold line, one grey sentence:
1. Syllabus nobody follows — RGPV syllabus is a PDF; students can't see what they've covered.
2. Notes scattered everywhere — notebooks, WhatsApp, Drive; nothing tied to the syllabus.
3. Deadlines lost in chats — assignments posted in WhatsApp groups get buried; submissions are missed.
4. No picture of progress — students and teachers can't see how far a class really is.
Visual: on the right, four horizontal SVG "threads" (thin lines) that each snap/fray as its row appears.

**2 — Solution.** Label "02 — SOLUTION". Title "One app that / weaves it together". Subline:
"Weave connects your syllabus, your notes and your deadlines — and shows what you know and what you're missing."
Left: five pillars as hairline rows (name + one line):
- Syllabus progress — Semester → Subject → Unit → Topic, with % and status bands.
- Linked notes — private notes linked to topics and to each other, with backlinks; a linked topic turns green.
- Assignments — live countdown, teacher marks, push reminders 2 days before and on the day.
- Graph view — the whole syllabus as a tree, your notes as diamonds; gaps are obvious.
- AI study help — tutor that answers only from your notes and teacher material, with citations; topic quizzes; gap finder.
Right: phone frame that auto-cycles home → subjects → notes → assignments → graph (crossfade + slight slide, 2.2 s each).
Footer strip in mono: "INSTALLABLE PWA · WORKS OFFLINE · DEPARTMENT-ONLY SIGN-IN · 100+ STUDENTS".
Motion: the frayed threads from slide 1 come back in and tie into a single line that leads to the pillars.

**3 — Tech stack.** Label "03 — TECH STACK". Title "Built on a / modern stack". Six horizontal layers stacked
bottom-up (hairline-separated bands, layer name in mono on the left, tech in bold, one-line "why" in grey):
- HOSTING — Vercel (Singapore region) · Fluid compute — fast for Indian students, auto-deploy from GitHub.
- DATABASE — Neon Postgres + pgvector · Drizzle ORM — one database for data and AI search.
- AUTH — Neon Auth (email code) — only emails on the department student list get in.
- BACKEND — Next.js server actions · Zod — every input validated, every query scoped to the student.
- FRONTEND — Next.js 16 · React 19 · Tailwind 4 · GSAP / Motion — app-like, animated, installable PWA with Web Push.
- AI — Groq (fast chat, quizzes) · Gemini (embeddings, fallback) · Vercel AI SDK — answers only from your material.
Motion: layers build from the bottom up, each sliding in with its text.

**4 — Tech flow.** Label "04 — HOW IT FLOWS". Title "From sign-in / to progress". The centerpiece: an SVG flowchart
(rounded rects = steps, diamonds = decisions, arrows with heads). Top row:
Open app → ◇ Signed in? (yes → Home) → College email → ◇ On student list? (no → "Access denied") → Code by email → Home.
Home branches into four lanes (left→right rows):
- Subjects → Topic → See progress
- Notes → Write note → Link to topic → Topic covered → Progress rises → Shows on graph
- Assignments → Live countdown → Reminder push → Teacher marks → Status push
- AI tutor → Ask question → Search your notes + teacher material → Cited answer → Quiz → Progress
Under it, a thin system strip: Phone (PWA) ⇄ Vercel (Next.js) ⇄ Neon Postgres, with branches to Neon Auth,
Push service, AI models.
Motion: draw the path step by step with DrawSVG (lines draw, then the node fades/scales in, decision diamonds
rotate in from 45°), lanes draw one after another; then small dots travel along the system strip both ways
with MotionPath on a loop. Total build ≤ 7 s; pressing → during the build skips to the end state.

**5 — Similar apps (study).** Label "05 — SIMILAR APPS". Title "What others do, / what Weave adds".
Table, hairline rows. Rows: Google Classroom, Notion, Obsidian, MyStudyLife, College portal (ERP), **Weave** (last, highlighted
with a lime band). Columns: Knows the syllabus · Notes linked to topics · Deadlines + push · Graph of gaps ·
AI from your own material · Department-only sign-in. Use ✓ (ink), – (muted) and "partial" (mono small).
Values: Classroom ✓ – ✓ – – ✓ (deadlines ✓, sign-in ✓ via school account, syllabus –); Notion – partial – – partial –;
Obsidian – ✓ – ✓ – –; MyStudyLife – – ✓ – – –; ERP partial – partial – – ✓; Weave all ✓.
Bottom line: "Weave is the only one built around **your syllabus**."
Motion: rows slide in, then ticks pop column by column, Weave's band sweeps in last.

## Deck mechanics
- GSAP 3.13.0 from jsDelivr (exact versions): `gsap.min.js`, `SplitText.min.js`, `DrawSVGPlugin.min.js`,
  `MotionPathPlugin.min.js` (all free in 3.13). Register plugins.
- Navigation: → / Space / PageDown / click right half = next; ← / PageUp / click left half = back; F = fullscreen;
  number keys 1–5 jump. Touch swipe works. Hash `#3` deep-links.
- Transition between slides: masked wipe (clip-path inset) of the incoming slide + outgoing slide drifts up and
  fades, ~0.9 s, ease "power3.inOut". Titles reveal by word with SplitText (y 100% → 0 inside overflow-hidden lines,
  stagger 0.06). Each slide has its own build timeline that plays on enter and resets on leave.
- Persistent chrome: top-left "WEAVE" wordmark in mono, top-right "0N / 05", bottom hairline progress bar.
- Scale: design at 1440×810 inside a stage that `transform: scale()`s to fit the window, letterboxed on `--c-bg`.
- `prefers-reduced-motion`: no wipes or draws, simple 0.2 s fades, everything visible immediately.
- No console errors. No external images besides `img/*.png`. Keep it under ~900 lines, readable code with a few comments.

## Steps
1. Read `design/ui-kit/index.html` (skim for type, labels, hairlines, phone and pill styles) and `app/globals.css` tokens.
2. Look at the 5 screenshots in `public/deck/img/`.
3. Write `public/deck/index.html`.
4. Write REPORT.md, print TASK COMPLETE.

## Done when
- [ ] Exactly 5 slides in the order above, all content present, both graph view and AI features shown
- [ ] Matches the app's look; follows every style rule above
- [ ] Flowchart on slide 4 draws step by step and is readable from the back of a classroom (min 16 px text at 1440 wide)
- [ ] Keyboard, click, swipe, fullscreen, hash work; reduced-motion fallback
