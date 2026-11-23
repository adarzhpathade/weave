#!/usr/bin/env bash
# Orchestrator control panel.
#   ./watch.sh                 table of all tasks (status, model, age, last log line) + running count vs max 5
#   ./watch.sh wait [secs]     poll (default 120s) until a task changes state, then print the table
#   ./watch.sh check NAME      scope check (only files_allowed touched?) + changed files + REPORT.md
#   ./watch.sh done NAME       mark an interactive agy task finished (after the user saw TASK COMPLETE)
#   ./watch.sh retry NAME      bump retry counter (max 3)
#   ./watch.sh clean NAME      remove a merged task's worktree safely (junction-aware)
set -uo pipefail
root="$(cd "$(dirname "$0")" && pwd)"; parent="$(dirname "$root")"; logs="$root/logs"
MAX=5
mkdir -p "$logs"
st() { cat "$logs/$1.status" 2>/dev/null || { [ -f "$logs/$1.finished" ] && echo done || echo queued; }; }
fm() { sed -n '/^---$/,/^---$/p' "$root/tasks/$1.md" | grep -m1 "^$2:" | sed "s/^$2:[[:space:]]*//; s/[[:space:]]*#.*$//"; }
snapshot() { for f in "$logs"/*.status; do [ -f "$f" ] && echo "$f $(cat "$f")"; done; }
table() {
  local running=0 n s age last m
  printf "%-24s %-9s %-24s %-5s %s\n" TASK STATUS MODEL AGE LAST-LOG-LINE
  for f in "$root"/tasks/*.md; do
    n="$(basename "$f" .md)"; [ "${n:0:1}" = "_" ] && continue
    s="$(st "$n")"; [ "$s" = running ] && running=$((running+1))
    m="$(fm "$n" model)"
    age="-"; [ -f "$logs/$n.log" ] && age="$(( ($(date +%s) - $(date -r "$logs/$n.log" +%s)) / 60 ))m"
    last="$(tail -n 1 "$logs/$n.log" 2>/dev/null | cut -c1-50)"
    printf "%-24s %-9s %-24s %-5s %s\n" "$n" "$s" "$m" "$age" "$last"
  done
  echo "running: $running/$MAX"
}
case "${1:-}" in
  "") table ;;
  wait)
    iv="${2:-120}"; snap="$(snapshot)"
    while sleep "$iv"; do
      now="$(snapshot)"
      [ "$now" != "$snap" ] && break
      grep -q running <<<"$now" || break
    done
    table ;;
  check)
    n="${2:?name}"; wt="$parent/weave-wt/$n"; allowed="$(fm "$n" files_allowed)"
    [ -d "$wt" ] || { echo "no worktree $wt"; exit 1; }
    base="$(fm "$n" base)"; base="${base:-origin/main}"
    files="$( (git -C "$wt" diff --name-only "$base"...HEAD; git -C "$wt" diff --name-only; git -C "$wt" ls-files --others --exclude-standard) | sort -u | grep -vE '^(REPORT\.md|WORKER_RULES\.md|tasks/|\.env\.local|node_modules)' )"
    bad=0
    IFS=',' read -ra pats <<<"$allowed"
    while IFS= read -r f; do
      [ -z "$f" ] && continue; ok=0
      for p in "${pats[@]}"; do p="$(echo "$p" | xargs)"; [[ "$f" == $p ]] && ok=1; done
      if [ $ok -eq 0 ]; then echo "OUT OF SCOPE: $f"; bad=1; fi
    done <<<"$files"
    echo "--- changed:"; echo "$files"
    if [ $bad -eq 0 ]; then echo "SCOPE OK"; else echo "SCOPE VIOLATION"; fi
    echo "--- REPORT.md:"; cat "$wt/REPORT.md" 2>/dev/null || echo "(missing: treat as failed)" ;;
  done) echo done > "$logs/${2:?name}.status"; echo "exit=0" > "$logs/$2.finished"; table ;;
  retry)
    n="${2:?name}"; c="$(cat "$logs/$n.retries" 2>/dev/null || echo 0)"
    if [ "$c" -ge 3 ]; then echo "$n: 3 retries used, escalate the model or fix it yourself"; exit 1; fi
    echo $((c+1)) > "$logs/$n.retries"; echo "$n: retry $((c+1))/3" ;;
  clean)
    n="${2:?name}"; wt="$parent/weave-wt/$n"
    [ -d "$wt/node_modules" ] && MSYS_NO_PATHCONV=1 cmd //c rmdir "$(cygpath -w "$wt/node_modules")"
    git -C "$root" worktree remove "$wt" && echo "removed $wt" ;;
  *) sed -n '2,9p' "$0" ;;
esac
