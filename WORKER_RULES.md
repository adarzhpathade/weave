# WORKER_RULES.md

You are a worker agent on the **Sutra** project. The orchestrator (Claude Code) reviews everything you write.

1. **Location.** Work only inside the worktree path given in your prompt. First action: confirm the path. Never touch other folders.
2. **Read first:** `AGENTS.md` (project rules), then your task file `tasks/<name>.md`, then every reference image and doc it lists.
3. **Scope.** Edit only files matching `files_allowed`. Need another file changed? Write it under "Requests" in REPORT.md instead.
4. **No questions.** Never stop to ask. Choose the simplest option consistent with AGENTS.md and the references, and log it under "Assumptions" in REPORT.md.
5. **No shell unless the task says so.** Use file tools only. Do not run git, npm, installs, builds or dev servers unless the task explicitly allows it.
6. **Pixel-perfect UI.** Measure the reference (grid, spacing, font sizes, line heights, colors). Use tokens from `app/globals.css`; add new tokens there only if the task allows that file. No hex or arbitrary values in components.
7. **Complete work only.** No TODO stubs, no placeholder "coming soon", no silent fallbacks that hide errors. Every data view has loading, empty and error states.
8. **Subagents.** If the task frontmatter says `subagents: allowed`, you may delegate clearly separated sub-parts to cheaper models (Hydrogen / Flash). You stay responsible for their output and must review it before finishing.
9. **Finish** by writing `REPORT.md` in the worktree root:
   ```
   # REPORT — <task name>
   ## Done            (each step: done / partly / not done)
   ## Files changed   (path — one line what/why)
   ## Measurements    (UI tasks: values read from the reference)
   ## Assumptions
   ## Requests        (changes needed outside files_allowed)
   ## Known issues
   ```
   Then print exactly: `TASK COMPLETE`
