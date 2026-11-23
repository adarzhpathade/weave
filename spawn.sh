#!/usr/bin/env bash
# Usage: ./spawn.sh <agy|claude> <task-name>     (task file: tasks/<task-name>.md with frontmatter)
# Prepares a worktree in ../weave-wt/<task-name>, then:
#   agy    + shell: no  -> runs a headless Gemini worker (file tools only) with the task's `model`
#   agy    + shell: yes -> only prepares; prints the interactive command for the USER to run
#   claude              -> runs a headless Claude worker (fallback)
# Run in background: nohup ./spawn.sh agy NAME &
# State: logs/<name>.status = prepared | running | done | failed | aborted
set -uo pipefail
worker="${1:?worker: agy|claude}"; name="${2:?task name}"
root="$(cd "$(dirname "$0")" && pwd)"; parent="$(dirname "$root")"
task="$root/tasks/$name.md"; logs="$root/logs"
[ -f "$task" ] || { echo "no such task file: $task"; exit 1; }
mkdir -p "$logs"
export PATH="$PATH:$HOME/AppData/Local/agy/bin"
status() { echo "$1" > "$logs/$name.status"; }
fm() { sed -n '/^---$/,/^---$/p' "$task" | grep -m1 "^$1:" | sed "s/^$1:[[:space:]]*//; s/[[:space:]]*#.*$//"; }

br="$(fm branch)"; base="$(fm base)"; base="${base:-origin/main}"; allowed="$(fm files_allowed)"
model="$(fm model)"; model="${model:-gemini-4-neon-medium}"; shell="$(fm shell)"; subagents="$(fm subagents)"
if [ -z "$br" ] || [ -z "$allowed" ]; then echo "task frontmatter needs branch and files_allowed"; status aborted; exit 1; fi
wtpath="$parent/weave-wt/$name"
rm -f "$logs/$name.finished"

if [ ! -d "$wtpath" ]; then
  mkdir -p "$parent/weave-wt"
  git -C "$root" fetch -q origin 2>/dev/null || true
  git -C "$root" worktree add -b "$br" "$wtpath" "$base" || { echo "worktree add failed"; status aborted; exit 1; }
  cp "$root/.env.local" "$wtpath/.env.local" 2>/dev/null || true
  # node_modules: JUNCTION only. Never ln -s / rm -rf / Remove-Item it (remove with: cmd /c rmdir <path>)
  if [ -d "$root/node_modules" ]; then
    MSYS_NO_PATHCONV=1 cmd //c mklink //J "$(cygpath -w "$wtpath/node_modules")" "$(cygpath -w "$root/node_modules")" >/dev/null
  fi
fi
mkdir -p "$wtpath/tasks"
cp "$task" "$wtpath/tasks/$name.md"; cp "$root/WORKER_RULES.md" "$wtpath/WORKER_RULES.md"

prompt="You are a worker. WORKTREE: $(cygpath -w "$wtpath")  BRANCH: $br
Read WORKER_RULES.md, AGENTS.md, then tasks/$name.md, and follow them exactly. Allowed files: $allowed
Subagents: ${subagents:-not-allowed}. Shell: ${shell:-no} (if no: use file tools only, never run commands, git or npm)."

if [ "$worker" = "agy" ] && [ "$shell" = "yes" ]; then
  status prepared
  echo "Needs a shell. In PowerShell run:"
  echo "  cd \"$(cygpath -w "$wtpath")\""
  echo "  agy --model $model --mode accept-edits --prompt-interactive=\"$prompt\""
  echo "When it prints TASK COMPLETE, run: ./watch.sh done $name"
  exit 0
fi

status running
cd "$wtpath" || exit 1
if [ "$worker" = "agy" ]; then
  agy --model "$model" --mode accept-edits -p="$prompt" > "$logs/$name.log" 2>&1
else
  claude -p "$prompt" --permission-mode acceptEdits \
    --allowedTools "Read,Edit,Write,Glob,Grep,Bash(git status:*),Bash(git diff:*),Bash(pwd),Bash(ls:*)" \
    > "$logs/$name.log" 2>&1
fi
code=$?
if [ $code -eq 0 ] && grep -q "TASK COMPLETE" "$logs/$name.log" && [ -f "$wtpath/REPORT.md" ]; then status done; else status failed; fi
echo "exit=$code" > "$logs/$name.finished"
