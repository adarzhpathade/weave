# Backend tasks: start here

These tasks are for a teammate working in **Antigravity IDE** with **Gemini 3.8 Flash**.
Do them **one at a time, in order**. Start the next one only after the PR for the last one is merged.

| # | Task file | What it does |
|---|---|---|
| 1 | `tasks/b1-real-signin.md` | Real sign-in: a code sent by email (Neon Auth), only for students on the list |
| 2 | `tasks/b2-push-backend.md` | Save a phone's push subscription, send a push, show it in the service worker |
| 3 | `tasks/b3-push-reminders.md` | Deadline reminders (2 days / same day) and helpers for "new assignment" and "status marked" pushes |

---

## One-time setup (the teammate does this once, by hand)

1. Install **Git**, **Node.js 22 or newer** and **GitHub CLI** (`gh`): https://cli.github.com
2. In a terminal, run `gh auth login` → GitHub.com → HTTPS → log in with the browser.
   Use the same GitHub account that accepted the repo invite.
3. Get the file **`.env.local`** from Adarsh **privately** (WhatsApp/DM, never in the repo, never in a PR).
   It has the database and auth keys. Keep it out of git; `.gitignore` already ignores it.
4. Make an empty folder, e.g. `D:\code`, and open it in Antigravity.

---

## The prompt to paste into the Antigravity agent

Copy everything inside the box. For task 2 and task 3, change the two lines marked `<-- CHANGE`.

```text
You are working on "Weave", a Next.js + Neon Postgres project on GitHub:
https://github.com/adarzhpathade/weave

My task file is: tasks/b1-real-signin.md        <-- CHANGE (b2-push-backend.md, b3-push-reminders.md)
My branch name is: feat/b1-real-signin          <-- CHANGE (feat/b2-push-backend, feat/b3-push-reminders)

Do these steps in order. Run terminal commands yourself. Stop and ask me only where a step says "ASK ME".

STEP 1 - Check tools
- Run: git --version, node --version (must be 22 or newer), gh --version.
- Run: gh auth status. If I am not logged in, ASK ME to run "gh auth login" myself, then continue.

STEP 2 - Get the code
- If the folder "weave" does not exist in the current folder, run:
  gh repo clone adarzhpathade/weave
- Go into the "weave" folder. Run: git checkout main, then git pull.
- Create my branch from main: git checkout -b <my branch name>
  (If the branch already exists, check it out instead.)
- Run: npm install

STEP 3 - Secrets
- Check that the file "weave/.env.local" exists. If it does not, ASK ME to put it there
  (I get it privately from Adarsh). Never print its values, never commit it, never paste
  secrets into code, logs, commit messages or the PR.

STEP 4 - Read the rules before writing any code
- Read fully: AGENTS.md, WORKER_RULES.md, then my task file.
- This project uses Next.js 16. Its APIs differ from what you remember. Before using any
  Next.js API, read the matching guide in node_modules/next/dist/docs/.
- Follow the task file exactly. Only change files listed under "files_allowed" in the task file.
  If you need another file changed, do not change it; write it under "Requests" in the PR description.
- Do not change any screen design or styles. This is backend work.

STEP 5 - Do the task
- Follow the "Steps" in the task file one by one.
- Run "npm run dev" when the task tells you to test something, and stop it afterwards.

STEP 6 - Check your work (all must pass)
- npm run typecheck
- npm run lint
- npm run test
- npm run build
Fix every error. Do not turn off rules, do not use "any", do not add "@ts-ignore",
do not delete or skip tests to make them pass.

STEP 7 - Write the change file
- Create docs/changes/<today's date as YYYY-MM-DD>-<task name>.md using the format in AGENTS.md section 13.
- Add your assumptions to the end of NOTES.md (short bullets, with today's date).

STEP 8 - Commit, push and open the pull request
- Run: git status. Make sure .env.local and other secrets are NOT in the list.
- git add only the files you changed, then commit with a message like:
  feat(auth): real sign-in with email code
- git push -u origin <my branch name>
- Open the PR to main:
  gh pr create --base main --title "<same as commit message>" --body-file <a temp file outside the repo>
  The PR body must have these headings:
  ## What this does
  ## Files changed      (each file, one line)
  ## How I tested it    (commands run and their result, manual test steps)
  ## Assumptions
  ## Requests           (changes needed outside files_allowed, or "None")
  ## Known issues       (or "None")
- Do NOT merge the PR. Adarsh reviews and merges it.
- Finally, show me the PR link.
```

---

## For Adarsh (orchestrator)
- Review each PR with the normal checklist in `CLAUDE.md` before merging.
- Task 1 needs a small login screen change (a box to type the code). A Sonnet worker builds that as a separate UI task against the contract in `b1-real-signin.md`.
