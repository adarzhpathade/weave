# Weave — Project Overview

## One line
Weave puts your syllabus, your notes and your deadlines in one app, and shows how much of each subject you have covered.

## The problem
1. **Forgotten assignments.** Assignments are announced in class; students miss deadlines because there is no single reminder system.
2. **Disconnected notes.** Students' notes live in notebooks and random apps, with no link to the syllabus, so nobody can see which topics are still untouched before an exam.
3. **Scattered material.** Faculty notes and slides are spread over WhatsApp groups, Drive links and email.

## The solution
| Layer | Who | What |
|---|---|---|
| **Official** | Department / faculty | Syllabus (Subject → Unit → Topic) per program and semester, assignments with due dates and marks |
| **Personal** | Student | Private notes written under each topic |
| **Progress** | System | Topic / unit / subject / semester progress calculated from the student's notes (and later quizzes) |

### Core loop
```
Open app → see today's deadlines and semester progress → open a subject → write a note on a topic
→ topic turns covered → progress rises → push reminders keep deadlines in front of you
```

## Department structure (first user: CSIT)
```
Department: Computer Science and Information Technology (CSIT)
├── Program CSIT ── divisions CSIT-1, CSIT-2   (same syllabus)
└── Program CY (Cyber Security) ── division CY
Years: 2nd, 3rd, 4th → semesters 3–8 (1st year is common to all branches and not in the app)
```
- CSIT-1 and CSIT-2 follow the same syllabus; they differ in faculty, assignments and deadlines.
- CY shares most subjects with CSIT, has **some extra subjects**, and some shared subjects come in **a different semester**.
  So a subject (with its units and topics) is defined **once** and placed into each program's semester plan.

## Users
| User | Phase | Needs |
|---|---|---|
| **Student** | 2 (first) | Never miss a deadline, write notes against the syllabus, see what is covered |
| **Faculty** | 3 | Create assignments, mark offline submissions, upload material, see class progress |
| **Admin (department)** | 3 | Import the student list and the syllabus (CSV), move divisions to the next semester |

## Student app — core (built first, finished completely)
Bottom tabs on mobile: **Home · Subjects · Assignments · Profile**.
1. **Login + onboarding** — sign in with the college email; only students on the department's list get in; confirm the details from the list.
2. **Home** — upcoming deadlines with live countdown, semester progress, progress per subject.
3. **Subjects → Unit → Topic** — the syllabus with progress; notes are written and read **inside each topic**; one search box finds notes.
4. **Assignments** — list with countdown, details, status marked by faculty (Pending / Submitted / Late / Not submitted) and marks. **Push reminders** (2 days before, on the day, new assignment, status marked). Submission stays on paper.
5. **Profile** — own details, switch semester (past open, future locked), notification on/off, install app, sign out.

## Later (only after the core is finished and the faculty side exists)
- **AI tutor** answering only from faculty material + own notes (needs faculty uploads first).
- **Practice quizzes** per unit/topic (feed into progress).
- **Graph view** of the syllabus (demo value; same information as Subjects).
- **Editing notes offline** (reading offline is in the core PWA).

## Cut (not planned)
Separate notes tab, links/backlinks between notes, notifications list page, streaks, activity heatmap, "weak topics", gap finder,
"analyze my note", activity history, timetable, attendance, results, fees/ERP, online submission, student uploads, chat between students.

## What makes it "department-ready"
- Installable PWA, fast on mid-range Android phones and campus Wi-Fi; last-seen data readable offline.
- Handles 100+ students concurrently (load-tested), runs on free/low-cost cloud tiers.
- Private by design: notes are never visible to anyone else; faculty see only progress and assignment status.
- Minimal personal data (see `database_schema.md`); real data enters through the department's CSV lists.

## Technology (summary)
Next.js + React + TypeScript, Tailwind CSS, Motion/GSAP, Neon Postgres, Drizzle ORM, Neon Auth, Serwist (service worker) + Web Push,
hosted on Vercel. Later: Vercel AI SDK with Groq + Google Gemini and pgvector for the AI features. Details in `architecture.md`.
