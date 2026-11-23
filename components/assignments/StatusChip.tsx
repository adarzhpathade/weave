import { cx } from "./classes";
import { CheckIcon } from "./icons";
import type { AssignmentStatus } from "./types";

export type ChipKind = AssignmentStatus | "overdue";

const LABEL: Record<ChipKind, string> = {
  pending: "Pending",
  overdue: "Overdue",
  submitted: "Submitted",
  late: "Late",
  not_submitted: "Not submitted",
};

// Kit .status.*: always text + colour. "Overdue" (pending past its deadline) is not in the kit: outlined like
// pending, with the missing colour as its border.
const STYLE: Record<ChipKind, string> = {
  pending: "border border-ink text-ink",
  overdue: "border-2 border-missing text-ink",
  submitted: "bg-lime text-on-status",
  late: "bg-late text-on-status",
  not_submitted: "bg-missing text-on-status",
};

export function StatusChip({ kind, className }: { kind: ChipKind; className?: string }) {
  return (
    <span
      className={cx(
        "inline-flex h-6.5 flex-none items-center gap-1.5 rounded-pill px-2.75 font-mono text-mono font-medium tracking-status whitespace-nowrap uppercase",
        STYLE[kind],
        className,
      )}
    >
      {kind === "submitted" ? <CheckIcon className="size-3" /> : null}
      {LABEL[kind]}
    </span>
  );
}
