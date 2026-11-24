---
branch: feat/p3-subjects-data
base: origin/feat/p2-home
model: gemini-4-neon-medium
files_allowed: lib/progress/**, lib/db/queries/subjects.ts, app/(app)/subjects/**
subagents: not-allowed
shell: no
---

# p3-subjects-data — progress formula, subject queries, route pages (backend only)

## Goal
`/subjects` and `/subjects/[subjectId]` show the signed-in student's real subjects and coverage. A Sonnet worker writes the visible components in parallel (they may not exist in your worktree yet) — code against this contract exactly and write no markup beyond rendering them:
```ts
import type { SubjectsPageData, SubjectDetail } from "@/components/subjects/types";
// SubjectCard = { id; code; name; shortName; kind: "core"|"dept_elective"|"open_elective"; colorIndex: number; percent: number; coveredTopics; totalTopics }
// SubjectsPageData = { semester; divisionCode; subjects: SubjectCard[] }
// TopicRow = { id; order; title; noteCount }   UnitBlock = { id; order; title; covered; total; topics: TopicRow[] }
// SubjectDetail = { id; code; name; shortName; kind; colorIndex; percent; noteCount; units: UnitBlock[] }
import { SubjectsScreen } from "@/components/subjects/SubjectsScreen";          // <SubjectsScreen data={...} />
import { SubjectDetailScreen } from "@/components/subjects/SubjectDetailScreen"; // <SubjectDetailScreen subject={...} />
```

## Steps
1. `lib/progress/index.ts`: the ONLY place for the formula (AGENTS.md §4; no quizzes yet): topic covered = the student has ≥1 own note with a `note_links` row to it; unit % = covered/total (0 if no topics); subject % = average of unit %; round to integer. Pure functions + a Vitest file `lib/progress/index.test.ts`.
2. `lib/db/queries/subjects.ts` (server-only; do NOT edit `queries/index.ts`, pages import from this file directly): `getSubjectsPage(studentId)` → `SubjectsPageData` for the student's current semester (core + picked electives; reuse `visibleSubjects.ts`), `colorIndex` = 1-based position in plan order; `getSubjectDetail(studentId, subjectId)` → `SubjectDetail | null` (null if not visible to the student). No N+1: aggregate note counts per topic with one grouped query over the student's own notes.
3. Pages: `app/(app)/subjects/page.tsx`, `app/(app)/subjects/[subjectId]/page.tsx` (`params` is a Promise in Next 16; `notFound()` when null; validate the id is a UUID). Session via `getSessionStudent()` from `@/lib/auth/session`; follow `app/(app)/home/page.tsx` exactly for the Suspense pattern. `metadata` title per page.
4. REPORT.md, print TASK COMPLETE.
