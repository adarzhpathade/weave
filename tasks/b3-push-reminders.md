---
branch: feat/b3-push-reminders
base: origin/main   # start only after b2 is merged
model: gemini-3.8-flash (teammate, Antigravity IDE)
files_allowed: lib/push/**, lib/db/queries/push.ts, lib/db/queries/index.ts, app/api/cron/push-reminders/route.ts, lib/push/*.test.ts, docs/changes/**, NOTES.md
subagents: not-allowed
shell: yes
---

# b3 — Deadline reminders and event pushes

## Goal
Students get a push:
- **2 days before** an assignment is due (`due_2d`),
- **on the day** it is due (`due_today`),
- when a **new assignment** is posted for their division (`new`),
- when a teacher **marks their status** (`status`).

Each student gets each kind **only once per assignment** (the `push_log` table has a unique index on
assignment + student + kind). Students who turned a kind off in Profile do not get it.

The faculty screens that post assignments and mark students do not exist yet, so for `new` and
`status` this task only builds the **helper functions**; the faculty task will call them later.

## Contract (exact)
`lib/push/reminders.ts` (`import "server-only";`):

```ts
// Finds every reminder that is due now and sends it. Safe to run many times (no duplicates).
export async function runDeadlineReminders(now?: Date): Promise<{ checked: number; sent: number; failed: number }>;

// Call after an assignment is created (faculty task, later).
export async function notifyNewAssignment(assignmentId: string): Promise<{ sent: number; failed: number }>;

// Call after a teacher marks a student (faculty task, later).
export async function notifyStatusMarked(assignmentId: string, studentId: string): Promise<{ sent: number; failed: number }>;
```

Route `app/api/cron/push-reminders/route.ts`: `GET` only. It must check the header
`Authorization: Bearer <CRON_SECRET>`; wrong or missing → `401`. If `CRON_SECRET` is not set → `500`
with a clear message. On success return JSON `{ checked, sent, failed }`.

## Rules for each kind
Time zone for "today" and "2 days": **Asia/Kolkata** (all students are in India).
| kind | who | when | setting (students table) | text |
|---|---|---|---|---|
| `due_2d` | active students in the assignment's divisions (`assignment_divisions`) | due in 24–48 h from now, and not marked `submitted`/`late` | `notify_deadline` | "Due in 2 days: <title>" / "<subject name> · due <weekday, time>" |
| `due_today` | same | due later today (Asia/Kolkata), not passed yet, not marked | `notify_deadline` | "Due today: <title>" / "<subject name> · due at <time>" |
| `new` | same students | when `notifyNewAssignment` is called | `notify_new_assignment` | "New assignment: <title>" / "<subject name> · due <date>" |
| `status` | that one student | when `notifyStatusMarked` is called | `notify_status` | "Marked <Submitted / Late / Not submitted>: <title>" / marks if any |

Tap URL for all: the assignments page with that assignment open. Check how the assignments screen opens
a detail sheet (look in `app/(app)/assignments/` and `components/assignments/`) and use the same URL.
Use `tag: "assignment-<id>"` so a newer push replaces an older one for the same assignment.

## How to avoid duplicates (important)
For each (assignment, student, kind): **first** insert into `push_log` with `onConflictDoNothing()`
and `.returning()`. Only if a row came back, call `sendPushToStudent` (from b2). If nothing came back,
it was already sent: skip. Find all candidates with **one query per kind** (no query inside a loop
per student).

## References
- `lib/db/schema/push.ts` (`push_log`, `push_kind`), `lib/db/schema/assignments.ts`, `lib/db/schema/people.ts`
- `lib/push/send.ts` — `sendPushToStudent` (from task b2)
- `lib/db/queries/assignments.ts` — how assignments are joined to divisions and subjects
- Next.js route handlers: `node_modules/next/dist/docs/` (search "route handlers")

## Steps
1. Read the references and the b2 code.
2. In `lib/db/queries/push.ts` add the candidate queries (one per kind) and `claimPushLog(assignmentId, studentId, kind)`
   (insert with `onConflictDoNothing().returning()`; returns `true` if this call claimed it).
3. Write `lib/push/reminders.ts` following the contract and the rules table. Put the text building in
   small pure functions (`buildDue2dPayload`, etc.) so they are easy to test.
4. Write the cron route. Do not add a schedule config file; Adarsh adds the Vercel schedule
   (every 30 minutes) when merging. Write this under "Requests" in the PR.
5. Tests `lib/push/reminders.test.ts` (Vitest): text builders; Asia/Kolkata "today" around midnight
   (e.g. 23:30 and 00:30 IST); a second run sends nothing (claim returns false); students with the
   setting off are skipped; the route returns 401 without the secret (test the auth check as a pure function).
6. Manual test: `npm run dev`, then
   `curl -H "Authorization: Bearer <your CRON_SECRET>" http://localhost:3000/api/cron/push-reminders`
   twice. The second call must report `sent: 0`. Paste both outputs (without the secret) in the PR.
7. Do STEP 6–8 of the start-here prompt (checks, change file, PR).

## Done when
- [ ] The three functions and the cron route exist with the exact contract
- [ ] Running twice never sends the same push twice
- [ ] Profile notification settings are respected; marked students get no deadline reminders
- [ ] "Today" uses Asia/Kolkata; no N+1 queries
- [ ] Tests, typecheck, lint, build pass; only `files_allowed` touched; PR opened (not merged)
