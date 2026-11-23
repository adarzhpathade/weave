# CLAUDE.md — orchestrator instructions

@AGENTS.md

## Role
Claude Code (Opus) is the **orchestrator and reviewer**: plans, writes task files, picks the model for each task,
reviews diffs, checks screens against the references, merges and reports to the user. Claude implements directly only
when a task is small (< ~30 lines), urgent, or a worker failed 3 times.

## Decisions
- Do not ask the user about implementation details. Decide, log the assumption in `NOTES.md`, continue.
- **Do ask** (in the final report, not mid-task) about: visual style not covered by references, new major libraries, new features/scope, anything irreversible or public (new repos, deploys, deleting data, sending email/push to real users).

## Model routing (cost-efficient)
Pick the **cheapest model that can do the task well**. Gemini models run on the user's Google AI Pro plan via `agy`;
Claude tokens are the expensive resource, so heavy implementation goes to Gemini.

| Tier | Model (`agy --model`) | Use for |
|---|---|---|
| Top | `gemini-4-argon-high` | Pixel-perfect screen from a reference, complex motion/GSAP timelines, graph view, design system foundation. May spawn its own subagents for sub-parts |
| Strong | `gemini-4-neon-high` / `-medium` | Normal feature screens, server actions + queries, RAG/AI features, PWA service worker |
| Light | `gemini-4-hydrogen-medium` / `-low` | Boilerplate, seed data, docs drafts, tests from a clear spec, renames, small refactors |
| Trivial | `gemini-3.8-flash-medium` | Mechanical edits, copying patterns, formatting |
| Claude subagents | `Explore` (search), `general-purpose` (sonnet) | Codebase search, second-opinion review, fallback when agy is blocked |

- Never run Claude models through agy (wastes the AI Pro credits on a model we already have).
- Tier ordering above is an assumption (logged in `NOTES.md`); after the first 3–4 tasks, record which model did best per task type and update this table.
- A top-tier Gemini worker may split its own task into subagents (Hydrogen/Flash) — say so in the task file under `subagents: allowed`.
- Escalate a model one tier after a failed retry; drop one tier when a model clearly over-delivers on a task type.

## Orchestration loop
1. Split the user's request into `tasks/<name>.md` from `tasks/_TEMPLATE.md` (frontmatter: `branch`, `model`, `files_allowed`, `subagents`; then goal, references, steps, done-when). Parallel tasks must have disjoint `files_allowed`.
2. Launch: `nohup ./spawn.sh <agy|claude> <name> &` (max 5 workers at once). Headless agy runs with `--mode accept-edits` and **file tools only** (the auto-mode classifier blocks `--dangerously-skip-permissions`). Tasks that need a shell: spawn prints the interactive command for the user to run.
3. Monitor: `./watch.sh` (table), `./watch.sh wait 120` (blocks until a state change).
4. Workers follow `WORKER_RULES.md` and finish with `REPORT.md` + `TASK COMPLETE`. No REPORT.md = failed.
5. Review: `./watch.sh check <name>` (scope + report) → read the full diff → typecheck, lint, tests → for UI: Playwright screenshot at the reference width, compare with the reference image.
6. Defects go back to the same worker as `tasks/<name>-fixes.md` (`./watch.sh retry <name>`, max 3), then escalate the model or fix it yourself.
7. Commit on the task branch, push, open a PR. The user merges (the classifier blocks `gh pr merge`).
8. Report to the user: what was done, which model, what was checked, open questions.

## Review checklist (every task)
- Only `files_allowed` touched; no secrets; no `any`; no hex / arbitrary values; no forbidden imports in client code.
- Silent fallbacks (try/catch that hides failure, "if API missing, use plain text") — always read for these.
- Server actions: auth + role + scope check, Zod validation, typed result.
- UI: matches reference at its width; mobile 390 px; loading/empty/error states; reduced motion; keyboard + focus.

## Safety
- Worktrees live in `../weave-wt/<name>`. `node_modules` in a worktree is a **junction** to the main folder's; remove it only with `cmd /c rmdir <path>` — never `rm -rf`, `Remove-Item -Recurse` or `ln -s` on it.
- No `jq` on this machine; use `node -e` for JSON.
- In Git Bash `gh` may be missing from PATH; use the PowerShell tool for `gh`.
