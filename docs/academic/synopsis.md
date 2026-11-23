# Synopsis — Weave: A Syllabus-Mapped Learning Companion (PWA)

> Draft. Adapt headings to the college's synopsis format when it is provided.

**Project type:** Minor project · **Branch:** Computer Science & Engineering
**Team:** _(names, roll numbers)_ · **Guide:** _(name)_ · **Session:** 2026–27

## 1. Introduction
College students receive course material through many channels, learn about assignments verbally in class,
and keep notes that are not connected to the syllabus. As a result they cannot easily see which topics they
have covered, they miss deadlines, and general-purpose AI tools give answers that do not match what was taught.

## 2. Problem statement
To design and develop a mobile-first web application that organises the official syllabus as a knowledge graph,
links each student's private notes to it, tracks assignment deadlines, and provides AI assistance grounded only
in the faculty's material and the student's own notes.

## 3. Objectives
1. Represent Semester → Subject → Unit → Topic as an interactive graph with per-node progress.
2. Provide a rich note editor where every note belongs to a topic and notes can link to each other.
3. Compute topic, unit, subject and semester progress from notes and quiz results.
4. Show assignments with live countdowns and push reminders (submission remains offline).
5. Offer an AI tutor and practice quizzes using retrieval-augmented generation (RAG) with citations.
6. Deliver it as an installable, offline-capable Progressive Web App that supports 100+ concurrent students.

## 4. Scope
**In scope:** student PWA (dashboard, graph, notes, assignments, AI tutor, practice, notifications); admin import; basic faculty panel.
**Out of scope:** online submission, attendance, fees/ERP, student-to-student chat.

## 5. Proposed methodology
Iterative development in phases (foundation → design system → core screens → AI features → pilot).
Each feature is built end-to-end and tested on mobile and desktop before the next begins.

## 6. Technology
Next.js, React, TypeScript, Tailwind CSS · PostgreSQL (Neon) with pgvector · Drizzle ORM · Neon Auth ·
Google Gemini via Vercel AI SDK · Service Worker + Web Push · Vercel hosting · Playwright, Vitest, k6.

## 7. Expected outcome
A working PWA piloted with at least one section, load-tested for 200 concurrent users, that lets students
see their syllabus coverage at a glance, never miss a deadline, and revise with grounded AI.

## 8. Feasibility
- **Technical:** all components are mature, well-documented open technologies.
- **Economic:** runs on free/low-cost cloud tiers for a department pilot.
- **Operational:** installable from a link; no app store; minimal training.

## 9. References
See `literature/` (to be added): RAG (Lewis et al., 2020), PWA (Google web.dev), knowledge graphs in education, spaced practice/testing effect.
