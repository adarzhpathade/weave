---
branch: feat/p4-assignments-ui
base: origin/feat/p2-home
model: sonnet
files_allowed: components/assignments/**, app/globals.css
subagents: not-allowed
shell: no
---

# p4-assignments-ui — Assignments list/calendar + detail sheet (visible UI only)

## Goal
Pixel-match the kit's ASSIGNMENTS and ASSIGNMENT SHEET phones (`design/ui-kit/index.html`, `<!-- ASSIGNMENTS -->`, `<!-- ASSIGNMENT SHEET -->`; CSS `.acard`, `.status.*`, `.count`, `.view-toggle`, `.cal`, `.sheet`, `.scrim`, `.handle`, `.kv`, `.badge-rot`; and the kit script that builds the calendar and countdowns). Phone first, centered column on laptop (sheet becomes a centered dialog ≥1024px). Reuse `components/ui/*` + tokens. Don't touch the shell/pill. A backend worker writes the route page; write components with this exact contract.

## Contract
```ts
// components/assignments/types.ts
export type AssignmentStatus = "pending" | "submitted" | "late" | "not_submitted";
export type AssignmentItem = { id: string; title: string; subjectCode: string; subjectName: string; subjectShort: string; unitLabel: string | null; givenBy: string | null; dueAt: string /* ISO */; maxMarks: number | null; marks: number | null; remark: string | null; description: string | null; status: AssignmentStatus };
export type AssignmentsPageData = { divisionCode: string; semester: number; now: string /* ISO */; items: AssignmentItem[] };
// components/assignments/AssignmentsScreen.tsx ("use client" ok)
export function AssignmentsScreen(props: { data: AssignmentsPageData; openId?: string }): JSX.Element
```

## Details
- List view: "Due soon" = pending items sorted by dueAt (live countdown, minute ticks; overdue pending shows an "Overdue" state); then a "Marked" group (submitted/late/not_submitted) with marks like "8/10" and remark when present. Status always as text + color.
- Calendar view (List/Calendar toggle like the kit): month grid, days with due items marked, prev/next month, tap a day to list its items below.
- Tap a card → bottom sheet (springy entry like the kit, scrim, drag handle; Esc/scrim/close closes; focus trapped) with countdown, title, kv rows (Subject, Unit, Given by, Max marks, Status, Marks if marked, Remark), description, and the line "Submit on paper in class. Your teacher marks it here." Hide rows whose value is null. Omit the "Remind me" button for now (push comes later). Keep the open sheet in `?id=` via `router.replace` (no scroll) so links can open it; `openId` opens it on load.
- Empty: no assignments → calm line "No assignments yet."
- Reduced motion, no hex/arbitrary values in components. REPORT.md, print TASK COMPLETE.
