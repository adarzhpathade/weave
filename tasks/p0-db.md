---
branch: feat/p0-5-schema-seed
base: origin/docs/csit-syllabus
model: gemini-4-neon-high
files_allowed: lib/db/schema/**, lib/db/seed/**, lib/db/queries/**, docs/database_schema.md
subagents: not-allowed
shell: no
---

# p0-db — Drizzle schema v1 + seed + first queries (backend only, nothing visible)

## Goal
The Neon database gets all v1 tables and realistic CSIT data so the frontend pages can show real data.
You write files only; the orchestrator runs `db:generate`, `db:migrate` and `db:seed` afterwards.

## Read first
AGENTS.md §3, §4, §10. `docs/database_schema.md` (the table list). `lib/db/index.ts`, `drizzle.config.ts`, `lib/db/seed/data/csit-subjects.json`.
Drizzle with `neon-http`. UUID primary keys, `created_at`/`updated_at` everywhere, snake_case plural tables, indexes from the doc.

## Changes to the doc decided by the user (apply them in the schema AND update docs/database_schema.md)
1. **Notes are free.** `notes.topic_id` is removed. New table `note_links`: id, note_id (→ notes, cascade), topic_id (nullable → topics), target_note_id (nullable → notes, cascade), check exactly one of the two is set, unique (note_id, topic_id) and (note_id, target_note_id). A topic is "covered" when at least one of the student's notes links to it.
2. **Announcements** (shown in the bell panel): `announcements`: id, author_user_id (nullable → users), division_id (nullable), subject_id (nullable), kind enum (`exam` `material` `class` `assignment`), title, body, file_key (nullable), created_at. `announcement_reads`: user_id, announcement_id, read_at, unique pair.
3. Everything else as in the doc (departments, programs, divisions, subjects, program_subjects, units, topics, users, students, student_electives, assignments, assignment_divisions, assignment_marks, push_subscriptions, push_log).

## Steps
1. Schema in `lib/db/schema/` (one file per area + `index.ts` re-export), with relations.
2. Seed `lib/db/seed/index.ts` (+ helpers), idempotent (safe to run twice: upsert or wipe-then-insert inside the seed only):
   - Department CSIT; programs CSIT and CY; divisions CSIT-1, CSIT-2 (current sem 5), CY (sem 5), plus 2nd and 4th year divisions (sem 3, sem 7).
   - Subjects + program_subjects from `csit-subjects.json`; CY = copy of the CSIT plan.
   - **Units and topics:** for every subject, 5 units with 4–6 topics each, drafted from the standard RGPV syllabus for that subject (real topic names, not "Topic 1"). Put the drafted list in `lib/db/seed/data/units-topics.json` (big file is fine) and mark it `"draft": true`.
   - 30 students per division with realistic Indian names, `enrollment_no` like `0827CI231001`, emails `firstname.lastname@college.ac.in`. **Demo student:** if env `DEMO_STUDENT_EMAIL` is set, add a CSIT-2 student "Aarav Sharma" with that email (never hardcode a real email).
   - Electives picked for each student (spread across options).
   - CSIT-2 sem 5: 6 assignments (some due in the next 7 days relative to the seed time, some past and marked with mixed statuses/marks for the demo student), 4 announcements (the kit's examples: CN class test moved to Friday, Unit 3 slides uploaded, No lectures on Monday, Assignment 3 posted), and 5 notes for the demo student with note_links (to topics and one note-to-note), e.g. "Round Robin vs priority".
3. Queries in `lib/db/queries/` (server-only, typed return types exported):
   - `getStudentByEmail(email)`
   - `getHomeData(studentId)` → `{ student: { firstName, divisionCode, semester }, dueNext: { title, subjectName, subjectCode, dueAt } | null, thisWeek: Array<{ dueAt, label }>, lastNote: { id, title, subjectShort, unitOrder, updatedAt } | null, unreadCount }`
   - `getNotifications(userId, studentId)` → announcements for the student's division/subjects + recent marks, newest first, with `read` flags.
4. Update `docs/database_schema.md` for the changes above.
5. Write REPORT.md, print TASK COMPLETE.

## Done when
- [ ] All tables with keys, checks, indexes; types compile (no `any`)
- [ ] Seed covers every theory subject with drafted units/topics; demo data for CSIT-2 sem 5
- [ ] No real personal data or secrets in files; only files_allowed touched
