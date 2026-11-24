---
branch: feat/p3-subjects-ui
base: origin/feat/p2-home
model: sonnet
files_allowed: components/subjects/**, app/globals.css
subagents: not-allowed
shell: no
---

# p3-subjects-ui — Subjects list + Subject → units → topics (visible UI only)

## Goal
Pixel-match the kit's SUBJECTS and SUBJECT DETAIL phones (`design/ui-kit/index.html`, sections `<!-- SUBJECTS -->` and `<!-- SUBJECT DETAIL -->`, CSS `.scard`, `.stack`, `.fchip`, `.sub-hero`, `.stats`, `.unit`, `.bar`, `.topics`, `.topic.done`, `.ck`, `.nc`, `--c-sub-*`). Phone first (390), centered column on laptop. Reuse `components/ui/*` and tokens in `app/globals.css` (add missing ones there, e.g. subject colors). The app shell + floating pill already exist (`components/nav/AppShell`); don't touch them. A backend worker writes the route pages; you only write components with this exact contract.

## Contract (backend fills these; do not rename)
```ts
// components/subjects/types.ts
export type SubjectKind = "core" | "dept_elective" | "open_elective";
export type SubjectCard = { id: string; code: string; name: string; shortName: string; kind: SubjectKind; colorIndex: number; percent: number; coveredTopics: number; totalTopics: number };
export type SubjectsPageData = { semester: number; divisionCode: string; subjects: SubjectCard[] };
export type TopicRow = { id: string; order: number; title: string; noteCount: number };
export type UnitBlock = { id: string; order: number; title: string; covered: number; total: number; topics: TopicRow[] };
export type SubjectDetail = { id: string; code: string; name: string; shortName: string; kind: SubjectKind; colorIndex: number; percent: number; noteCount: number; units: UnitBlock[] };
// components/subjects/SubjectsScreen.tsx
export function SubjectsScreen(props: { data: SubjectsPageData }): JSX.Element
// components/subjects/SubjectDetailScreen.tsx
export function SubjectDetailScreen(props: { subject: SubjectDetail }): JSX.Element
```

## Details
- colorIndex can be any integer ≥ 1: wrap it onto the kit's subject colors.
- Subjects: header row "Semester N · DIV", title, filter chips All/Core/Electives with counts (client state), search field filters by name/code (client), stacked wallet cards exactly like the kit (tap a card expands it like the kit's `.open`; "Open" goes to `/subjects/{id}`). Status band text from percent: Not started 0 · Low 1–39 · In progress 40–75 · Mastered >75, plus "X of Y topics" (never color only). 5 dots = percent/20.
- Detail: colored hero (back button → `/subjects`), code label, big name, stats Progress % and Notes count; units as in the kit with bar + "covered/total"; tap a unit to expand its topics (first unit with uncovered topics open by default). Topic: tick lime when noteCount > 0, note count text or "—". Topic tap → `/notes?topic={id}` if it has notes, else `/notes/new?topic={id}`.
- Empty states: no subjects → short line; unit with no topics → "Topics not added yet".
- Motion like the kit (stagger, bars fill). Reduced motion respected. No hex/arbitrary values in components.
- REPORT.md (kit measurements used), print TASK COMPLETE.
