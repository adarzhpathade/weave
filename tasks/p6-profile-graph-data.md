---
branch: feat/p6-profile-graph-data
base: origin/feat/p2-home
model: gemini-4-neon-medium
files_allowed: lib/db/queries/profile.ts, lib/db/queries/graph.ts, lib/actions/profile.ts, app/(app)/profile/**, app/(app)/graph/**
subagents: not-allowed
shell: no
---

# p6-profile-graph-data — profile + graph queries, actions, routes (backend only)

## Goal
`/profile` and `/graph` show the signed-in student's real data. A Sonnet worker writes the components in parallel (may be missing in your worktree) — code against this contract exactly, no markup beyond rendering:
```ts
import type { ProfileData, ProfileActions } from "@/components/profile/types";
// ProfileData = { fullName; email; enrollmentNo; programCode; divisionCode; semester; phone: string|null; notify: { deadline; newAssignment; status } }
// ProfileActions = { updateNotify({ deadline, newAssignment, status }) -> { ok:true; data:null } | { ok:false; error:{ code; message } }; signOut(): Promise<void> }
import { ProfileScreen } from "@/components/profile/ProfileScreen"; // <ProfileScreen data={...} actions={{ updateNotify, signOut }} />
import type { GraphData } from "@/components/graph/types";
// GraphTopic = { id; title; covered }  GraphUnit = { id; order; title; topics }  GraphNote = { id; title; topicIds: string[]; noteIds: string[] }
// GraphSubjectOption = { id; shortName; name }
// GraphData = { subject: { id; shortName; name; colorIndex }; semester; units; notes; subjects: GraphSubjectOption[] }
import { GraphScreen } from "@/components/graph/GraphScreen"; // <GraphScreen data={...} />
```

## Steps
1. `lib/db/queries/profile.ts`: `getProfile(studentId)` → ProfileData (one query). `lib/actions/profile.ts` ("use server"): `updateNotify` (session check, Zod, updates the student's own `notify_*` columns, revalidatePath `/profile`). `signOut` already exists in `lib/actions/auth.ts` — reuse it.
2. `lib/db/queries/graph.ts`: `getGraphData(studentId, userId, subjectId?)` → GraphData for a subject visible to the student (default: first subject of the current semester in plan order; `subjects` = the current semester's visible subjects; `colorIndex` = 1-based plan position, same as `lib/db/queries/subjects.ts`). Units/topics ordered; `covered` uses `lib/progress` (topic covered = ≥1 own note linked). `notes` = the student's notes linked to this subject's topics, with their topic links (only this subject's topics) and note-to-note links among them. Few queries, no N+1. Do NOT edit `queries/index.ts`.
3. Routes: `app/(app)/profile/page.tsx`, `app/(app)/graph/page.tsx` (searchParams `subject`, UUID-validated, `notFound()` if not visible). Follow `app/(app)/home/page.tsx` for session + Suspense; Next 16 `searchParams` is a Promise.
4. REPORT.md, print TASK COMPLETE.
