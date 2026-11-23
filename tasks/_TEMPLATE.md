---
branch: feat/<id>-<slug>
base: origin/main
model: gemini-4-neon-medium        # see CLAUDE.md "Model routing"
files_allowed: app/(app)/example/**, components/example/**
subagents: not-allowed             # or: allowed (worker may delegate sub-parts to cheaper models)
shell: no                          # yes = needs interactive agy run by the user
---

# <id> — <title>

## Goal
One paragraph: what the user can do when this is finished.

## References
- design/references/<file>.png — what to copy from it
- docs/<doc>.md §<section>

## Steps
1. ...
2. ...
3. Write REPORT.md, print TASK COMPLETE.

## Done when
- [ ] Matches the reference at <width> px (layout, spacing, type, color, motion)
- [ ] Mobile 390 px layout
- [ ] Loading / empty / error states
- [ ] Reduced-motion fallback
- [ ] No hex / arbitrary values, no `any`, only files_allowed touched
