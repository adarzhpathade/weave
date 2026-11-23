# Software Requirements Specification — Weave (student PWA)

## 1. Introduction
**Purpose.** Defines what the Weave student app must do (functional) and how well (non-functional).
**Scope.** Core student PWA (Phase 2). Faculty/admin (Phase 3) in §5; later extras in §6.
**Definitions.** *Topic covered* — see the progress formula in `AGENTS.md` §4. *PWA* — Progressive Web App.
*Program* — CSIT or CY. *Division* — CSIT-1, CSIT-2, CY (one per program per year).

## 2. Overall description
- **Users:** students of the CSIT department (programs CSIT and CY, 2nd–4th year, semesters 3–8), ~100–300 accounts, mostly on Android phones.
- **Operating environment:** any modern mobile/desktop browser; installable on Android (Chrome) and iOS (Safari 16.4+).
- **Constraints:** free/low-cost cloud tiers; assignment submission stays offline (paper).
- **Assumptions:** the student list is provided by the department (CSV). Syllabus = RGPV B.Tech CSIT, **theory subjects only**; unit/topic lists are drafted until checked against the official syllabus.

## 3. Functional requirements (student, core)

| ID | Requirement | Priority |
|---|---|---|
| **FR-1 Login + onboarding** | | |
| FR-1.1 | Sign in with the college email; only emails on the department's student list can finish sign-in, others see "Ask your department to add you" | Must |
| FR-1.2 | First sign-in: show the details from the list (name, enrollment no., program, division, semester) to confirm; optional phone and photo | Must |
| FR-1.3 | Pick one option for each elective group of the current semester (can be changed later in Profile) | Must |
| FR-1.4 | Sign out; session persists across app restarts | Must |
| **FR-2 Home** | | |
| FR-2.1 | Upcoming deadlines (next 7 days first) with live countdown | Must |
| FR-2.2 | Semester progress and progress per subject (number + status label, never color alone) | Must |
| **FR-3 Semester** | | |
| FR-3.1 | Switch semester from Profile / top bar; past + current open, future visible but locked | Must |
| FR-3.2 | The selected semester filters Home, Subjects and Assignments | Must |
| **FR-4 Subjects → Unit → Topic** | | |
| FR-4.1 | List the theory subjects of the selected semester (from the student's program plan: core + the electives they picked) with progress | Must |
| FR-4.2 | Subject page: units with progress; unit page: topics with covered / not covered | Must |
| FR-4.3 | Topic page: the student's notes on that topic; create a note | Must |
| **FR-5 Notes** | | |
| FR-5.1 | Rich text editor (headings, lists, checklists, code, tables), stored as Markdown | Must |
| FR-5.2 | Auto-save (debounced) with a saved indicator | Must |
| FR-5.3 | One search box that finds the student's notes (full text) | Must |
| FR-5.4 | Delete a note (with undo) | Must |
| **FR-6 Assignments** | | |
| FR-6.1 | List assignments of the student's division, grouped by upcoming / past, with live countdown | Must |
| FR-6.2 | Detail: subject, unit, description, due date, status (Pending / Submitted / Late / Not submitted), marks and remark | Must |
| FR-6.3 | Web push: due in 2 days, due today, new assignment, status marked | Must |
| FR-6.4 | Turn each push type on/off (in Profile) | Must |
| **FR-7 Profile** | | |
| FR-7.1 | Show own details (name, email, enrollment no., program, division, semester) — list fields are read-only | Must |
| FR-7.2 | Edit phone and photo; change electives; notification settings; install app; sign out | Must |
| **FR-8 PWA** | | |
| FR-8.1 | Installable (manifest, icons, splash), custom install prompt after a user action | Must |
| FR-8.2 | Branded offline page; last-seen Home, notes and assignments readable offline | Must |

## 4. Non-functional requirements

| ID | Category | Requirement |
|---|---|---|
| NFR-1 | Performance | LCP < 2.5 s, INP < 200 ms, CLS < 0.05 on a mid-range Android over 4G; JS per route < 200 KB gzip |
| NFR-2 | Scalability | 200 concurrent virtual students: p95 page/API < 800 ms, error rate < 1% (k6) |
| NFR-3 | Availability | Hosted on Vercel + Neon; app shell available offline |
| NFR-4 | Security | Server-side role + scope checks on every action; HTTPS; httpOnly cookies; secrets only on the server; input validated with Zod |
| NFR-5 | Privacy | Notes visible only to their owner; faculty see progress + assignment status only; only the minimal personal fields in `database_schema.md` are stored (DPDP Act 2023) |
| NFR-6 | Usability | Mobile-first, one-hand reachable navigation, all states (loading/empty/error), consistent motion |
| NFR-7 | Accessibility | WCAG 2.2 AA: contrast, keyboard, focus, labels, reduced motion, progress not by color alone |
| NFR-8 | Visual quality | Pixel-faithful to the approved references at 390 px and 1440 px |
| NFR-9 | Maintainability | TypeScript strict, documented modules, explainable code, change log per session |
| NFR-10 | Cost | Runs on free tiers for a 100–300 student pilot |

## 5. Faculty / admin (Phase 3, summary)
Admin: CSV import of the student list and the syllabus (subjects, units, topics, program semester plan); move a division to the next semester.
Faculty: create assignments for divisions, mark Submitted / Late / Not submitted (+ marks, remark), upload material per unit, see class progress per unit/topic.

## 6. Later extras (Phase 4, only after Phases 2–3 are finished)
AI tutor grounded in faculty material + own notes (with citations, "Not covered in your material"), practice quizzes per unit/topic,
graph view of the syllabus, offline note editing. Requirements are written when the phase starts.

## 7. Acceptance
A requirement is accepted when its test case in `testing.md` passes on mobile (390 px) and desktop (1440 px).
