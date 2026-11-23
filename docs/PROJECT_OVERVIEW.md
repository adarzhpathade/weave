# Weave — Project Overview

## One line
Weave maps your syllabus, connects your notes to it, keeps your deadlines in front of you, and uses AI to show what you know and what you are missing.

## The problem
1. **Scattered material.** Faculty notes and slides are spread over WhatsApp groups, Drive links and email.
2. **Forgotten assignments.** Assignments are announced in class; students miss deadlines because there is no single reminder system.
3. **Disconnected notes.** Students' notes live in notebooks and random apps, with no link to the syllabus, so nobody can see which topics are still untouched before an exam.
4. **Ungrounded AI.** General chatbots answer from the internet, not from what the professor actually taught.

## The solution
Three layers in one installable app:

| Layer | Who | What |
|---|---|---|
| **Official** | Faculty / department | Semester → Subject → Unit → Topic structure, uploaded notes/slides, assignments with due dates |
| **Personal** | Student | Private notes written under topics and linked to each other |
| **Intelligence** | System | Progress tracking, AI tutor, practice quizzes, note analysis and gap finder — grounded only in the two layers above |

### Core loop
```
Open app → see gaps on the graph / dashboard → write a note or take a quiz
→ topic turns covered → progress rises → deadline reminders keep you on track
```

## Users
| User | Phase | Needs |
|---|---|---|
| **Student** | 1–3 (first) | See syllabus progress, write notes, never miss a deadline, revise with AI |
| **Faculty** | 4 | Publish material and assignments, mark offline submissions, see class weak spots |
| **Admin (department)** | 4 | Import students and curriculum, assign faculty, manage semesters |

## Student features (the PWA)
1. **Onboarding + login** — college email; pick branch, semester, section.
2. **Dashboard** — stats first: semester %, notes count, quiz average, streak, coverage per subject, activity heatmap, upcoming deadlines.
3. **Graph view** — the syllabus as a tree (semester → subjects → units), each node with its %; hover/tap card and a side sheet per unit.
4. **Subjects & units** — topics with ✅/⬜, faculty material, assignment, "Ask AI" and "Practice".
5. **Notes** — rich editor (stored as Markdown), links between notes/topics, backlinks, search, auto-save, works offline.
6. **Assignments** — live countdowns and the status marked by faculty; push reminders. Submission stays on paper.
7. **AI tutor** — chat that answers only from course material and own notes, with citations.
8. **Practice** — AI-generated MCQ quizzes per unit/topic, instant feedback, score history.
9. **Notifications** — in-app + web push.

## What makes it "department-ready"
- Installable PWA, fast on mid-range Android phones and campus Wi-Fi; readable offline.
- Handles 100+ students concurrently (load-tested), runs on free/low-cost cloud tiers.
- Private by design: notes are never visible to anyone else; faculty see only aggregated progress.
- Simple onboarding of real data: CSV import of students and syllabus.

## Out of scope
Online assignment submission, student file uploads, public sharing, chat between students, attendance, fees/ERP features.

## Technology (summary)
Next.js + React + TypeScript, Tailwind CSS, Motion/GSAP, Neon Postgres + pgvector, Drizzle ORM, Neon Auth,
Vercel AI SDK with Groq (fast chat) + Google Gemini (embeddings, document reading), Serwist (service worker) + Web Push, hosted on Vercel. Details in `architecture.md`.
