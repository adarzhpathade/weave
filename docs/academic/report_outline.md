# Project report — outline

Front matter: title page · certificate · declaration · acknowledgement · abstract (≈250 words) · table of contents · list of figures/tables · abbreviations.

1. **Introduction** — background, problem statement, motivation, objectives, scope, report organisation
2. **Literature review** — existing tools (LMS, note apps, AI tutors), RAG, knowledge graphs in learning, PWAs; comparison table; research gap
3. **Requirement analysis** — functional + non-functional requirements (from `docs/requirements.md`), feasibility study, hardware/software requirements
4. **System design**
   - Architecture diagram (`docs/architecture.md`)
   - Use-case diagram (student, faculty, admin)
   - DFD level 0 and level 1
   - ER diagram (`docs/database_schema.md`)
   - Sequence diagrams: save note, AI tutor question, push reminder
   - Progress formula with a worked example
   - UI design: design system + key screens (mobile + desktop)
5. **Implementation** — tech stack and why, module-wise description (auth, curriculum, notes, progress, assignments, AI/RAG, PWA/push), key code snippets, security measures
6. **Testing** — test plan, test cases + results, Lighthouse scores, accessibility, load-test results (k6 graphs)
7. **Results and discussion** — screenshots, pilot feedback, performance numbers, limitations
8. **Conclusion and future scope** — faculty analytics, ERP integration, native wrappers, multilingual support
9. **References** (IEEE style) · **Appendix** — user manual, demo accounts, deployment guide

Figures to prepare: architecture, use-case, DFD 0/1, ER, 3 sequence diagrams, graph-view screenshot, dashboard, load-test chart.
