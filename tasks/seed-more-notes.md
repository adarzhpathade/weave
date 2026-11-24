---
branch: chore/seed-more-notes
base: origin/feat/p2-home
model: gemini-4-hydrogen-medium
files_allowed: lib/db/seed/demoContent.ts
subagents: not-allowed
shell: no
---

# seed-more-notes — richer demo notes for the demo student

## Goal
The demo student (CSIT-2, sem 5) should look like a real, active student: subject progress around CN ~70%, OS ~50%, TOC ~30%, AI ~85%.

## Steps
1. Read `lib/db/seed/demoContent.ts`, `lib/db/seed/index.ts` and `lib/db/seed/data/units-topics.json` (find the 4 sem-5 subjects the demo student sees: CN, OS, TOC and the AI open elective; use their exact topic titles).
2. Add about 40 more demo notes in `demoContent.ts`, in the same data shape the seed already uses for the existing 5 notes: realistic student-style titles and 3–8 line Markdown bodies (bullets, **bold**, exam tips, formulas in plain text), each linked to 1–2 real topic titles so coverage reaches roughly the targets above (spread across units, not all in unit 1). Add 6 note-to-note links between related notes. Spread `updated` times over the last 30 days (relative to seed time, as the existing notes do). Keep "Round Robin vs priority" as the most recently edited note.
3. Keep the seed idempotent (stable ids via the existing helper). Do not change any other file.
4. REPORT.md, print TASK COMPLETE.
