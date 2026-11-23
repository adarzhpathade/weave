# CSIT syllabus (theory subjects), electives, enrollment number
- Date / tool + model / branch: 2026-11-23 · Claude Code (Opus 5.5) · `docs/csit-syllabus`

## What changed
- `lib/db/seed/data/csit-subjects.json` — new: RGPV B.Tech CSIT theory subjects for semesters 3–8 (core + departmental/open elective groups), from the link the user gave.
- `docs/database_schema.md` — `program_subjects.kind` + `elective_group`; new `student_electives` table (16 tables); `students` keeps only `enrollment_no` (roll no. and lab batch removed); theory-only rule; seed uses the real CSIT list.
- `docs/requirements.md` — FR-1.3 pick electives; FR-4.1 core + picked electives; FR-7 without roll no./lab batch, change electives in Profile.
- `docs/testing.md` — TC-12 (elective filter).
- `NOTES.md`, `HANDOFF.md` — user answers (no 1st year, enrollment number, theory only) and the new open items.

## Design decisions
None.

## Assumptions
Units/topics are drafted (source has none); elective codes normalised; CY = copy of CSIT until its list arrives. See NOTES.md.

## Not done / follow-ups
- CY subject list from the user.
- Official RGPV unit-wise syllabus to check the drafted units/topics.
