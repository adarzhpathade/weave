# Deadline reminders and event pushes
- Date / tool + model / branch: 2026-11-24 / Antigravity IDE (Gemini 3.8 Flash) / `feat/b3-push-reminders`

## What changed
- `lib/db/queries/push.ts` — added `claimPushLog`, `getDue2dCandidates`, `getDueTodayCandidates`, `getNewAssignmentCandidates`, and `getStatusMarkedCandidate` (transaction-free, neon-http safe).
- `lib/db/queries/index.ts` — re-exported the new push query helpers and types.
- `lib/push/reminders.ts` — implemented `runDeadlineReminders(now)`, `notifyNewAssignment(assignmentId)`, `notifyStatusMarked(assignmentId, studentId)`, pure payload builders for all 4 push kinds, and Asia/Kolkata date range logic.
- `app/api/cron/push-reminders/route.ts` — GET endpoint with `Authorization: Bearer <CRON_SECRET>` authentication triggering `runDeadlineReminders()`.
- `lib/push/reminders.test.ts` — unit test suite covering payload text formatting, Asia/Kolkata midnight boundary calculations, duplicate push prevention, and cron auth verification.

## Design decisions
- `claimPushLog` uses atomic insert-on-conflict on `(assignment_id, student_id, kind)` returning the inserted ID to guarantee exactly-once delivery without database transactions.
- Asia/Kolkata (UTC+5:30) timezone calculations ensure accurate "today" boundaries for students in India.
- Single query per reminder kind avoids N+1 queries.
- Notification tag `assignment-<id>` allows newer updates to cleanly replace older notifications on the student's device.

## Assumptions (also in NOTES.md)
- Deadline reminders and event pushes (b3): claimPushLog insert-on-conflict ensures exactly-once push delivery without transactions (neon-http safe); Asia/Kolkata timezone used for due-today and 2-day windows; tag format "assignment-<id>" replaces previous pushes on device.

## Not done / follow-ups
- Set up Vercel Cron schedule (every 30 minutes) calling `/api/cron/push-reminders`.
- Wire `notifyNewAssignment` and `notifyStatusMarked` into future faculty management screens when built.
