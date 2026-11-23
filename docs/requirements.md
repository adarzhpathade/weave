# Software Requirements Specification — Sutra (student PWA)

## 1. Introduction
**Purpose.** Defines what the Sutra student app must do (functional) and how well (non-functional).
**Scope.** Student-facing PWA (Phases 1–3). Faculty/admin requirements are listed in §5 for Phase 4.
**Definitions.** *Topic covered* — see the progress formula in `AGENTS.md` §4. *PWA* — Progressive Web App.

## 2. Overall description
- **Users:** undergraduate students of one department (initially CSE), ~100–300 accounts, mostly on Android phones.
- **Operating environment:** any modern mobile/desktop browser; installable on Android (Chrome) and iOS (Safari 16.4+).
- **Constraints:** free/low-cost cloud tiers; AI quota limits; offline assignment submission (paper).
- **Assumptions:** curriculum and student lists are provided by the department (CSV).

## 3. Functional requirements (student)

| ID | Requirement | Priority |
|---|---|---|
| **FR-1 Authentication** | | |
| FR-1.1 | Sign up / sign in with an email from an allowed college domain | Must |
| FR-1.2 | First sign-in onboarding: branch, current semester, section | Must |
| FR-1.3 | Sign out; session persists across app restarts | Must |
| **FR-2 Dashboard** | | |
| FR-2.1 | Stat cards: semester %, notes count, quiz average, assignments submitted, study streak | Must |
| FR-2.2 | Coverage per subject (ring/bar) | Must |
| FR-2.3 | Activity heatmap (last ~120 days) | Should |
| FR-2.4 | Upcoming deadlines with live countdown | Must |
| **FR-3 Semester** | | |
| FR-3.1 | Switch semester; past + current open, future locked | Must |
| FR-3.2 | The selected semester filters the whole app | Must |
| **FR-4 Graph view** | | |
| FR-4.1 | Tree: semester → subjects → units, each node with % and status | Must |
| FR-4.2 | Expand/collapse subjects, zoom/pan/fit, search jumps to a node | Must |
| FR-4.3 | Tap/hover card with topic list, notes count, quiz score, next deadline | Must |
| FR-4.4 | Unit sheet: topics ✅/⬜, faculty material, assignment, Ask AI, Practice | Must |
| FR-4.5 | Dashed edges for subject prerequisites | Could |
| **FR-5 Subjects & units** | | |
| FR-5.1 | List subjects of the semester with % | Must |
| FR-5.2 | Unit page: topics, faculty material (open PDF/PPT), assignment, AI actions | Must |
| **FR-6 Notes** | | |
| FR-6.1 | Create a note under a topic; edit with rich text (headings, lists, checklists, code, tables, images by URL) | Must |
| FR-6.2 | Auto-save (debounced) with a saved indicator | Must |
| FR-6.3 | Link to other notes/topics/units; backlinks panel | Must |
| FR-6.4 | Search notes (full-text) and quick switcher | Must |
| FR-6.5 | Read and edit notes offline; sync when online | Should |
| FR-6.6 | Export a note as Markdown | Could |
| **FR-7 Assignments** | | |
| FR-7.1 | List assignments grouped by status/due date with live countdown | Must |
| FR-7.2 | Show status marked by faculty: Pending, Submitted, Late, Not submitted (+ marks, remark) | Must |
| **FR-8 AI** | | |
| FR-8.1 | Tutor chat scoped to semester/subject/unit, streamed, with citation chips | Must |
| FR-8.2 | "Not covered in your material" when retrieval finds nothing | Must |
| FR-8.3 | Practice quiz (5–10 MCQs) per unit/topic, instant feedback, saved score | Must |
| FR-8.4 | Analyze note: summary, tags, todos, suggested links | Should |
| FR-8.5 | Gap finder: missing/weak topics of a unit with reasons | Should |
| **FR-9 Notifications** | | |
| FR-9.1 | In-app notification list with unread count | Must |
| FR-9.2 | Web push: deadline in 2 days / today, new assignment, status marked | Must |
| FR-9.3 | Notification preferences (on/off per type) | Should |
| **FR-10 PWA** | | |
| FR-10.1 | Installable (manifest, icons, splash), custom install prompt | Must |
| FR-10.2 | Branded offline page; last dashboard/notes/assignments readable offline | Must |
| **FR-11 Profile** | | |
| FR-11.1 | View profile, change semester/section (if allowed), notification settings, sign out | Must |

## 4. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | LCP < 2.5 s, INP < 200 ms, CLS < 0.05 on a mid-range Android over 4G; JS per route < 200 KB gzip |
| NFR-2 | Scalability | 200 concurrent virtual students: p95 page/API < 800 ms, error rate < 1% (k6) |
| NFR-3 | Availability | Hosted on Vercel + Neon; app shell available offline |
| NFR-4 | Security | Server-side role + scope checks on every action; HTTPS; httpOnly cookies; secrets only on the server; input validated with Zod |
| NFR-5 | Privacy | Notes visible only to their owner; faculty see aggregates only; AI context limited to own notes + own sections' material |
| NFR-6 | Usability | Mobile-first, one-hand reachable navigation, all states (loading/empty/error), consistent motion |
| NFR-7 | Accessibility | WCAG 2.2 AA: contrast, keyboard, focus, labels, reduced motion, progress not by color alone |
| NFR-8 | Visual quality | Pixel-faithful to the approved references at 390 px and 1440 px |
| NFR-9 | Maintainability | TypeScript strict, documented modules, explainable code, change log per session |
| NFR-10 | Cost | Runs on free tiers for a 100–300 student pilot; AI usage capped per student per day |

## 5. Faculty / admin (Phase 4, summary)
Admin CSV import of students and curriculum; faculty: upload material per unit (PDF/PPT → indexed for AI),
create assignments for sections, mark Submitted/Late/Not submitted, class progress per unit/topic.

## 6. Acceptance
A requirement is accepted when its test case in `testing.md` passes on mobile (390 px) and desktop (1440 px).
