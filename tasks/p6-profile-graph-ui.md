---
branch: feat/p6-profile-graph-ui
base: origin/feat/p2-home
model: sonnet
files_allowed: components/profile/**, components/graph/**, app/globals.css
subagents: not-allowed
shell: no
---

# p6-profile-graph-ui — Profile screen + Graph view (visible UI only)

## Goal
Two screens in the kit style: Profile (no kit phone — derive it from the kit's Home/Assignment sheet language: hairline sections, mono labels, `.kv` rows, ink/lime buttons; list your choices in REPORT.md) and Graph (pixel-match the kit's GRAPH phone + the laptop graph frame: `design/ui-kit/index.html` `<!-- GRAPH -->`, CSS `.graph`, `.graph-wrap`, `.legend`, `.gsheet`, `.view-toggle`, and the script functions `buildGraph` / `selectNode` with the `GN` / `GNOTES` data — port that generator to React + inline SVG, no new library). Phone first, laptop intentional. Reuse `components/ui/*` + tokens. Don't touch the shell/pill. A backend worker writes the routes; write components with this exact contract.

## Contract
```ts
// components/profile/types.ts
export type ProfileData = { fullName: string; email: string; enrollmentNo: string; programCode: string; divisionCode: string; semester: number; phone: string | null; notify: { deadline: boolean; newAssignment: boolean; status: boolean } };
export type ProfileActions = {
  updateNotify: (input: { deadline: boolean; newAssignment: boolean; status: boolean }) => Promise<{ ok: true; data: null } | { ok: false; error: { code: string; message: string } }>;
  signOut: () => Promise<void>;
};
// components/profile/ProfileScreen.tsx ("use client")
export function ProfileScreen(props: { data: ProfileData; actions: ProfileActions }): JSX.Element

// components/graph/types.ts
export type GraphTopic = { id: string; title: string; covered: boolean };
export type GraphUnit = { id: string; order: number; title: string; topics: GraphTopic[] };
export type GraphNote = { id: string; title: string; topicIds: string[]; noteIds: string[] };
export type GraphSubjectOption = { id: string; shortName: string; name: string };
export type GraphData = { subject: { id: string; shortName: string; name: string; colorIndex: number }; semester: number; units: GraphUnit[]; notes: GraphNote[]; subjects: GraphSubjectOption[] };
// components/graph/GraphScreen.tsx ("use client")
export function GraphScreen(props: { data: GraphData }): JSX.Element
```

## Details
- Profile: big name, mono line "ENROLLMENT · DIVISION · SEM N"; Account rows (Email, Enrollment no., Program, Division, Semester, Phone if set) as `.kv`; Notifications section with three switches (Deadline reminders, New assignments, Status marked) — optimistic, revert + inline error on failure, with a line "Push notifications arrive after you install Weave on your phone." ; Sign out ghost/outline button (`<form action={actions.signOut}>`). Accessible switches (`role="switch"`, `aria-checked`).
- Graph: subject switcher chips (from `data.subjects`, link `/graph?subject={id}`), With notes / Syllabus toggle, legend, SVG tree subject → units → topics (covered topics filled lime) with notes as diamonds and dashed links to their topics/notes (hidden in Syllabus mode); tap a node → highlight it and its neighbours (others dim to the kit's 0.28) and show the bottom info sheet (`.gsheet`: kind, title, "Linked to N topics · M notes" / "Covered · K notes"; note → link "Open note" `/notes/{id}`, topic → "Write a note" `/notes/new?topic={id}`). No default selection on phone. Horizontal scroll/drag inside the graph area on phone (not the page). Empty: subject without notes still shows the tree.
- Reduced motion (graph builds column by column only with motion), keyboard (nodes focusable, Enter selects, Esc clears), no hex/arbitrary values. REPORT.md, print TASK COMPLETE.
