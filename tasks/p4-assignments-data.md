---
branch: feat/p4-assignments-data
base: origin/feat/p2-home
model: gemini-4-neon-medium
files_allowed: lib/db/queries/assignments.ts, app/(app)/assignments/**
subagents: not-allowed
shell: no
---

# p4-assignments-data — assignments query + route (backend only)

## Goal
`/assignments` shows the signed-in student's real assignments. A Sonnet worker writes the components in parallel (may be missing in your worktree) — code against this contract exactly, no markup beyond rendering:
```ts
import type { AssignmentsPageData, AssignmentItem } from "@/components/assignments/types";
// AssignmentStatus = "pending"|"submitted"|"late"|"not_submitted"
// AssignmentItem = { id; title; subjectCode; subjectName; subjectShort; unitLabel: string|null; givenBy: string|null; dueAt: string /*ISO*/; maxMarks: number|null; marks: number|null; remark: string|null; description: string|null; status }
// AssignmentsPageData = { divisionCode; semester; now: string /*ISO*/; items: AssignmentItem[] }
import { AssignmentsScreen } from "@/components/assignments/AssignmentsScreen"; // <AssignmentsScreen data={...} openId={id} />
```

## Steps
1. `lib/db/queries/assignments.ts` (server-only; do NOT edit `queries/index.ts`): `getAssignmentsPage(studentId)` → assignments linked to the student's division (`assignment_divisions`) for subjects visible to the student (reuse `visibleSubjects.ts`), left-joined with this student's `assignment_marks` (no mark row → "pending"). `unitLabel` like "3 · Network layer" if the assignment has a unit, `givenBy` = author user's name if any. Joins, no N+1. Read `lib/db/schema/assignments.ts` for the real columns; null where a column doesn't exist.
2. `app/(app)/assignments/page.tsx`: session via `getSessionStudent()`; follow `app/(app)/home/page.tsx` for the Suspense pattern; `searchParams` is a Promise in Next 16 (check `node_modules/next/dist/docs/`) → `openId` (UUID-validated). metadata title "Assignments".
3. REPORT.md, print TASK COMPLETE.
