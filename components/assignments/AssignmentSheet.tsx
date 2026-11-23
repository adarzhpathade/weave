"use client";

import { useCallback, useEffect, useId, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { useFocusTrap } from "@/components/nav/useFocusTrap";
import { cx } from "./classes";
import { Countdown } from "./Countdown";
import { dueTime, formatDue, isOverdue, marksText } from "./format";
import { ClipIcon, CloseIcon } from "./icons";
import { StatusChip } from "./StatusChip";
import type { AssignmentItem } from "./types";
import { useNow } from "./useNow";

const SECOND = 1000;
const DISMISS_DISTANCE = 96; // px dragged down on the handle before release closes the sheet

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Kit "ASSIGNMENT SHEET": scrim + bottom sheet with a springy entry; a centred dialog from 1024px.
 * Closes on Esc, scrim tap, the close button or a downward drag on the handle. Focus is trapped while
 * open and returns to `returnFocus` after. `onClosed` runs once the exit motion has finished.
 */
export function AssignmentSheet({
  item,
  initialNow,
  returnFocus,
  onClosed,
}: {
  item: AssignmentItem;
  initialNow: number;
  returnFocus: HTMLElement | null;
  onClosed: () => void;
}) {
  const titleId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [dragging, setDragging] = useState(false);
  const now = useNow(initialNow, SECOND);

  const requestClose = useCallback(() => {
    if (prefersReducedMotion()) onClosed();
    else setClosing(true);
  }, [onClosed]);

  useFocusTrap(rootRef, !closing, requestClose);

  // Focus the close button on open, lock page scroll; give focus back to the card on close.
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
      returnFocus?.focus({ preventScroll: true });
    };
  }, [returnFocus]);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (closing) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = event.clientY;
    setDragging(true);
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current === null) return;
    setDragY(Math.max(0, event.clientY - dragStart.current));
  }
  function onPointerEnd() {
    if (dragStart.current === null) return;
    dragStart.current = null;
    setDragging(false);
    if (dragY > DISMISS_DISTANCE) requestClose();
    else setDragY(0);
  }

  const pending = item.status === "pending";
  const overdue = isOverdue(item, now);
  const due = formatDue(new Date(item.dueAt));
  const marks = marksText(item);
  const dueLabel = overdue ? `Overdue · was due ${due}` : pending ? `Due ${due}` : `Was due ${due}`;

  return (
    <div ref={rootRef}>
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={cx("fixed inset-0 z-60 bg-scrim", closing ? "animate-scrim-out" : "animate-scrim-in")}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{ translate: `0 ${dragY}px` }}
        onAnimationEnd={(event) => {
          if (closing && event.target === event.currentTarget) onClosed();
        }}
        className={cx(
          "fixed z-60 flex sheet-frame flex-col gap-3.5 overflow-y-auto overscroll-contain rounded-sheet bg-surface px-5 pt-3 pb-5 text-ink shadow-sheet-up lg:dialog-frame lg:pt-5",
          !dragging && "transition-translate",
          closing ? "animate-sheet-down lg:animate-dialog-out" : "animate-sheet-up lg:animate-dialog-in",
        )}
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          className="-my-2 flex cursor-grab touch-none justify-center py-2 lg:hidden"
        >
          <span aria-hidden="true" className="h-1.25 w-10 rounded-pill bg-line" />
        </div>

        <div className="flex items-center justify-between gap-2.5">
          <span aria-hidden="true" className="relative size-16 flex-none">
            <span className="absolute inset-1.5 grid place-items-center rounded-full bg-lime text-on-lime">
              <ClipIcon className="size-6.5" />
            </span>
          </span>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close"
            onClick={requestClose}
            className="grid size-10.5 place-items-center rounded-full border border-line bg-app text-ink transition-transform duration-fast ease-out active:scale-90"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <div>
          <span className="font-mono text-label tracking-label text-muted uppercase">{dueLabel}</span>
          {pending && !overdue ? (
            <div className="mt-1.5">
              <Countdown ms={dueTime(item) - now} size="md" />
            </div>
          ) : null}
        </div>

        <h2 id={titleId} className="text-sheet-title font-bold">
          {item.title}
        </h2>

        <dl className="grid border-t border-line">
          <Row label="Subject">{item.subjectName}</Row>
          {item.unitLabel !== null ? <Row label="Unit">{item.unitLabel}</Row> : null}
          {item.givenBy !== null ? <Row label="Given by">{item.givenBy}</Row> : null}
          {item.maxMarks !== null ? (
            <Row label="Max marks">
              <span className="tabular-nums">{item.maxMarks}</span>
            </Row>
          ) : null}
          <Row label="Status">
            <StatusChip kind={overdue ? "overdue" : item.status} />
          </Row>
          {marks !== null ? (
            <Row label="Marks">
              <span className="tabular-nums">{marks}</span>
            </Row>
          ) : null}
          {item.remark !== null ? <Row label="Remark">{item.remark}</Row> : null}
        </dl>

        {item.description !== null ? (
          <p className="text-copy whitespace-pre-line">{item.description}</p>
        ) : null}

        <p className="text-fine text-muted">Submit on paper in class. Your teacher marks it here.</p>
      </div>
    </div>
  );
}

// Kit .sheet .kv row: muted key left, bold value right, hairline below.
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-b border-line py-2.25 text-small">
      <dt className="flex-none text-muted">{label}</dt>
      <dd className="min-w-0 text-right font-bold">{children}</dd>
    </div>
  );
}
