import { BookIcon, CloseIcon, LinkIcon } from "./icons";
import { cx } from "./styles";
import type { LinkTarget, NoteLinkChip } from "./types";

// Subject pastels in order (subjects.color_token "subject-1" … "subject-6" → colorIndex 1 … 6).
const SUBJECT_BG = ["bg-sub-1", "bg-sub-2", "bg-sub-3", "bg-sub-4", "bg-sub-5", "bg-sub-6"] as const;

export function subjectBg(colorIndex: number): string {
  const n = SUBJECT_BG.length;
  const i = (((Math.trunc(colorIndex) - 1) % n) + n) % n;
  return SUBJECT_BG[i] ?? SUBJECT_BG[0];
}

/** Stable identity for a chip / target: "topic:<id>" or "note:<id>". */
export function linkKey(link: NoteLinkChip | LinkTarget): string {
  return link.kind === "topic" ? `topic:${link.topicId}` : `note:${link.noteId}`;
}

export function toTarget(link: NoteLinkChip): LinkTarget {
  return link.kind === "topic" ? { kind: "topic", topicId: link.topicId } : { kind: "note", noteId: link.noteId };
}

export const chipBase =
  "inline-flex h-6.5 max-w-full items-center gap-1.25 rounded-pill border pl-2.5 text-chip font-bold whitespace-nowrap";

// Kit .lchip: topic chips are filled with their subject's pastel (.syl), note chips are outlined.
export function LinkChip({
  link,
  onRemove,
  pop = false,
}: {
  link: NoteLinkChip;
  onRemove?: () => void;
  pop?: boolean;
}) {
  const isTopic = link.kind === "topic";
  return (
    <span
      className={cx(
        chipBase,
        isTopic ? `border-transparent text-on-sub ${subjectBg(link.colorIndex)}` : "border-line bg-transparent text-ink",
        onRemove ? "pr-1" : "pr-2.5",
        pop ? "animate-pop" : null,
      )}
    >
      {isTopic ? <BookIcon className="size-3 flex-none" /> : <LinkIcon className="size-3 flex-none" />}
      <span className="truncate">{link.label}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove link to ${link.label}`}
          className="grid size-5 flex-none place-items-center rounded-full opacity-60 transition-opacity duration-fast hover:opacity-100 focus-visible:opacity-100"
        >
          <CloseIcon className="size-2.5" />
        </button>
      ) : null}
    </span>
  );
}
