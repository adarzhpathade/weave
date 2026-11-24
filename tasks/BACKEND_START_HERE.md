# Backend tasks: start here

These tasks are for a teammate working in **Antigravity IDE** with **Gemini 3.8 Flash**.
Do them **one at a time, in order**. Start the next one only after the PR for the last one is merged.

| # | Task file | What it does |
|---|---|---|
| 1 | `tasks/b1-real-signin.md` | Real sign-in: a code sent by email (Neon Auth), only for students on the list |
| 2 | `tasks/b2-push-backend.md` | Save a phone's push subscription, send a push, show it in the service worker |
| 3 | `tasks/b3-push-reminders.md` | Deadline reminders (2 days / same day) and helpers for "new assignment" and "status marked" pushes |

---

## Before you start (the only things you do by hand)

1. Get the env file from Adarsh **privately** (WhatsApp/DM). Put it in the folder you will open in
   Antigravity (as `.env.local`) or in **Downloads** (as `teammate.env.local`). Never share it,
   never put it in the repo or a PR.
   It points to **`dev-teammate`**, your own copy of the database. You can't break the live app with it.
2. Make an empty folder, e.g. `D:\code`, and open it in Antigravity.
3. Paste the prompt below into the agent. The agent installs the tools, logs in to GitHub, downloads
   the code, does the task and opens the pull request. When it asks, you only:
   - click **Yes** on Windows install pop-ups,
   - log in to GitHub in the browser and type the 8-character code the agent shows you
     (use the GitHub account that accepted the invite),
   - tell it your name and email for git commits.

---

## The prompt to paste into the Antigravity agent

Copy everything inside the box. For task 2 and task 3, change the two lines marked `<-- CHANGE`.

```text
You are working on "Weave", a Next.js + Neon Postgres project on GitHub:
https://github.com/adarzhpathade/weave

My task file is: tasks/b1-real-signin.md        <-- CHANGE (b2-push-backend.md, b3-push-reminders.md)
My branch name is: feat/b1-real-signin          <-- CHANGE (feat/b2-push-backend, feat/b3-push-reminders)

Do these steps in order. Run terminal commands yourself. Stop and ask me only where a step says "ASK ME".

I am on Windows. Use PowerShell in the terminal.

STEP 1 - Install the tools (skip any that are already installed)
- Check each one: git --version ; node --version ; gh --version
- Install what is missing with winget (tell me to click "Yes" if Windows asks):
  winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
  winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
  winget install --id GitHub.cli -e --accept-source-agreements --accept-package-agreements
- Node must be version 22 or newer. If it is older, install OpenJS.NodeJS.LTS as above.
- After installing, open a NEW terminal so the commands are found, and check the versions again.
  If a command is still not found, ASK ME to restart Antigravity, then continue from STEP 1.

STEP 2 - Log in to GitHub and set up git
- Run: gh auth status
- If I am not logged in, run:
  gh auth login --hostname github.com --git-protocol https --web
  It prints an 8-character code and opens the browser. Show me the code and ASK ME to log in
  and type it. Wait until the command finishes, then run gh auth status again to confirm.
- Run: gh auth setup-git
- Run: git config --global user.name   and   git config --global user.email
  If either is empty, ASK ME for my name and the email of my GitHub account, then set them with
  git config --global user.name "<name>"   and   git config --global user.email "<email>"

STEP 3 - Get the code
- If the folder "weave" does not exist in the current folder, run:
  gh repo clone adarzhpathade/weave
- Go into the "weave" folder. Run: git checkout main, then git pull.
- Create my branch from main: git checkout -b <my branch name>
  (If the branch already exists, run git checkout <my branch name> and then git merge main.)
- Run: npm install

STEP 4 - Secrets
- The project needs the file "weave\.env.local". If it is not there yet, look for my env file in
  this order and COPY the first one you find to "weave\.env.local" (do not open or print it):
  1. the folder Antigravity is open in (the parent of "weave"): ".env.local" or "teammate.env.local"
  2. "$HOME\Downloads\teammate.env.local"
  Example: Copy-Item "..\.env.local" ".env.local"
  If none exists, ASK ME where it is.
- Check it is ignored by git: git check-ignore .env.local  (must print ".env.local").
- Never print, show or log the values in .env.local. Never commit it. Never paste secrets into
  code, logs, commit messages or the PR.
- This database is my own test copy, so "npm run db:migrate" and "npm run db:seed" are allowed
  when the task needs them. Never change the database schema unless the task file says so.

STEP 5 - Read the rules before writing any code
- Read fully: AGENTS.md, WORKER_RULES.md, then my task file.
- This project uses Next.js 16. Its APIs differ from what you remember. Before using any
  Next.js API, read the matching guide in node_modules/next/dist/docs/.
- Follow the task file exactly. Only change files listed under "files_allowed" in the task file.
  If you need another file changed, do not change it; write it under "Requests" in the PR description.
- Do not change any screen design or styles. This is backend work.

STEP 6 - Do the task
- Follow the "Steps" in the task file one by one.
- Run "npm run dev" when the task tells you to test something, and stop it afterwards.

STEP 7 - Check your work (all must pass)
- npm run typecheck
- npm run lint
- npm run test
- npm run build
Fix every error. Do not turn off rules, do not use "any", do not add "@ts-ignore",
do not delete or skip tests to make them pass.

STEP 8 - Write the change file
- Create docs/changes/<today's date as YYYY-MM-DD>-<task name>.md using the format in AGENTS.md section 13.
- Add your assumptions to the end of NOTES.md (short bullets, with today's date).

STEP 9 - Commit, push and open the pull request
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
- Teammate database: Neon branch `dev-teammate` (`br-super-dew-biuw2s7o`, project `proud-sky-40049407`),
  copied from production data on 2026-11-24, with its own Neon Auth. Her env file has its own
  session/cookie/cron secrets and empty VAPID keys. Delete the branch when the backend tasks are done.
- Email OTP is built into Neon Auth (checked 2026-11-24). Before real students use it, set a real
  email provider on the production branch (the shared sender is for development only).
