---
branch: docs/drift-fix
base: origin/main
model: gemini-3.8-flash-medium
files_allowed: AGENTS.md, docs/PROJECT_OVERVIEW.md, docs/design_system.md
subagents: not-allowed
shell: no
---

# docs-drift — Make the docs match what we actually built

## Goal
Three docs still describe old plans. Update them so new workers build the right thing.
**Only change sentences that are wrong.** Keep the structure, headings, tone (simple English) and everything else.

## Source of truth (read these first)
1. `NOTES.md` — the decision log. Newer entries win over older ones and over the docs.
2. `docs/changes/2026-11-24-core-screens.md` — what was built.
3. `HANDOFF.md` — "Built and working" list.
4. The code, when in doubt: `app/(app)/`, `components/`, `lib/db/schema/notes.ts` (has `note_links`).

## Known wrong statements to fix
- **Navigation:** docs say "bottom tab bar on mobile, top bar on desktop". Built: a floating **menu pill**
  that opens a full-screen menu, plus a **bell** that opens the notifications panel. No tab bar. (Still no sidebar.)
- **Notes:** docs say "every note belongs to exactly one topic", "written inside a topic" and
  "no links/backlinks between notes (cut)". Built: notes live in their own Notes section, can **link to topics
  and to other notes** (`[[Note title]]`), and show **backlinks**. A topic counts as covered when a note links to it.
  Remove "note links" from the cut / "Don't" lists.
- **Announcements:** there is no announcements page; teacher notifications appear in the **bell panel**.
- **Graph:** a simple SVG syllabus tree with notes as diamonds is built (not React Flow yet). Keep "no radial view".
- **Design style rules** (from the user, add to `docs/design_system.md` if missing): no dot-matrix numbers;
  no italic or coloured second word in titles (use ink + grey word); no playful shapes; no cards on Home
  (use hairlines); design source of truth is `design/ui-kit/index.html`.
- **Progress formula** in AGENTS.md §4: change "≥1 note on the topic" to "≥1 note linked to the topic".
  Do not change the rest of the formula.

If you find another statement that `NOTES.md` clearly contradicts, fix it too and list it in REPORT.md.
If you are not sure, do NOT change it; list it under "Requests" in REPORT.md.

## Do not touch
- The block at the end of `AGENTS.md` starting with "## This is NOT the Next.js you know" (it is generated).
- Anything about Phase 4 AI rules, tech stack, git rules or commands.

## Steps
1. Read the source-of-truth files.
2. Edit the three docs.
3. Write REPORT.md with, for every change: file, old sentence (short) → new sentence (short), and which NOTES.md entry it comes from.
4. Print TASK COMPLETE.

## Done when
- [ ] No doc mentions a bottom tab bar, topic-bound notes or note links being cut
- [ ] Every change is traceable to NOTES.md / the code in REPORT.md
- [ ] Only the three allowed files changed
