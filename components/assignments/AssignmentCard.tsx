import type { CSSProperties } from "react";
import { Countdown } from "./Countdown";
import { dueTime, formatDue, isOverdue, marksText } from "./format";
import { StatusChip } from "./StatusChip";
import type { AssignmentItem } from "./types";

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

// Kit .acard: meta row (code · subject + status), title, then countdown (pending) or marks (marked).
export function AssignmentCard({
  item,
  now,
  n,
  onOpen,
}: {
  item: AssignmentItem;
  now: number;
  n: number;
  onOpen: (id: string, trigger: HTMLElement) => void;
}) {
  const overdue = isOverdue(item, now);
  const marks = marksText(item);
  const marked = item.status !== "pending";

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      onClick={(event) => onOpen(item.id, event.currentTarget)}
      style={step(n)}
      className="grid w-full animate-lift gap-2.5 rounded-md bg-surface px-4 py-3.5 text-left text-ink transition-transform delay-list duration-fast ease-out active:scale-98"
    >
      <span className="flex items-center justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-mono tracking-sub text-muted uppercase">
          {`${item.subjectCode} · ${item.subjectShort}`}
        </span>
        <StatusChip kind={overdue ? "overdue" : item.status} />
      </span>
      <span className="text-card font-bold">{item.title}</span>
      {item.status === "pending" && !overdue ? <Countdown ms={dueTime(item) - now} size="sm" /> : null}
      {overdue ? (
        <span className="font-mono text-label tracking-label text-muted uppercase">
          {`Was due ${formatDue(new Date(item.dueAt))}`}
        </span>
      ) : null}
      {marked && marks ? (
        <span className="flex items-center justify-between gap-2.5">
          <span className="font-mono text-label tracking-label text-muted uppercase">Marks</span>
          <b className="tabular-nums">{marks}</b>
        </span>
      ) : null}
      {marked && item.remark ? <span className="text-small text-muted">{item.remark}</span> : null}
    </button>
  );
}
