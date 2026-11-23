"use client";

import type { CSSProperties, Ref } from "react";
import type { NotificationItem } from "@/lib/db/queries";
import { formatRelativeShort, toDate } from "./time";

type NotificationsPanelProps = {
  id: string;
  open: boolean;
  origin: CSSProperties;
  panelRef: Ref<HTMLDivElement>;
  items: NotificationItem[];
  isUnread: (item: NotificationItem) => boolean;
  unreadCount: number;
  now: Date | null;
  pending: boolean;
  error: string | null;
  onMarkAllRead: () => void;
};

const KIND_LABEL: Record<"exam" | "material" | "class" | "assignment", string> = {
  exam: "Exam",
  material: "Material",
  class: "Class",
  assignment: "Assignment",
};

const STATUS_LABEL: Record<"submitted" | "late" | "not_submitted", string> = {
  submitted: "Submitted",
  late: "Late",
  not_submitted: "Not submitted",
};

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

// Kit .npanel: opens like the menu (circle from the pill button); the pill turns into "Notifications · Close".
export function NotificationsPanel({
  id,
  open,
  origin,
  panelRef,
  items,
  isUnread,
  unreadCount,
  now,
  pending,
  error,
  onMarkAllRead,
}: NotificationsPanelProps) {
  const fresh = items.filter(isUnread);
  const earlier = items.filter((item) => !isUnread(item));
  const motion = open ? "animate-lift delay-notif" : "";
  // stagger steps, as in the kit: title 0, then each group label and row in order
  const earlierStep = fresh.length > 0 ? 2 + fresh.length : 1;

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      inert={!open}
      style={origin}
      className={`@container fixed inset-0 z-40 flex flex-col overflow-hidden bg-night px-5 pt-panel pb-panel text-on-night ${
        open ? "reveal-panel-open" : "reveal-panel"
      }`}
    >
      <div className="mx-auto flex min-h-0 w-full max-w-column flex-1 flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-label tracking-label text-lime uppercase">
            {unreadCount > 0 ? `${unreadCount} new` : "All read"}
          </span>
          <button
            type="button"
            onClick={onMarkAllRead}
            disabled={unreadCount === 0 || pending}
            aria-busy={pending}
            className="h-8 rounded-pill border border-night-line px-3 text-hint font-bold text-on-night transition-opacity duration-fast disabled:opacity-40"
          >
            {pending ? "Marking…" : "Mark all read"}
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-hint font-bold text-missing">
            {error}
          </p>
        ) : null}

        {/* Content sits at the bottom like the kit; with a long feed it scrolls inside the panel. */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
          <div className="mt-auto flex flex-col gap-2.5">
            <h2
              id={`${id}-title`}
              style={step(0)}
              className={`mb-1.5 font-display text-panel-title font-black tracking-display ${motion}`}
            >
              Notifications
            </h2>

            {items.length === 0 ? (
              <div style={step(1)} className={`grid gap-1 border-t border-night-line pt-3 ${motion}`}>
                <b className="text-lead font-extrabold tracking-row">You&apos;re all caught up.</b>
                <span className="text-meta opacity-60">Announcements and marks from your faculty show up here.</span>
              </div>
            ) : null}

            {fresh.length > 0 ? (
              <>
                <span style={step(1)} className={`mt-1.5 font-mono text-mono-xs tracking-label uppercase opacity-55 ${motion}`}>
                  New
                </span>
                <ul className="grid">
                  {fresh.map((item, i) => (
                    <NotificationRow key={`${item.type}-${item.id}`} item={item} unread now={now} n={2 + i} motion={motion} />
                  ))}
                </ul>
              </>
            ) : null}

            {earlier.length > 0 ? (
              <>
                <span
                  style={step(Math.min(earlierStep, 10))}
                  className={`mt-1.5 font-mono text-mono-xs tracking-label uppercase opacity-55 ${motion}`}
                >
                  Earlier
                </span>
                <ul className="grid">
                  {earlier.map((item, i) => (
                    <NotificationRow
                      key={`${item.type}-${item.id}`}
                      item={item}
                      unread={false}
                      now={now}
                      n={earlierStep + 1 + i}
                      motion={motion}
                    />
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

type RowProps = { item: NotificationItem; unread: boolean; now: Date | null; n: number; motion: string };

function NotificationRow({ item, unread, now, n, motion }: RowProps) {
  const time = now ? formatRelativeShort(toDate(item.createdAt), now) : "";
  return (
    <li
      style={step(Math.min(n, 10))}
      className={`grid grid-cols-notif gap-2 border-t border-night-line py-3 last:border-b ${motion}`}
    >
      <span className="pt-0.75 font-mono text-mono opacity-55">
        <span className="sr-only">{unread ? "Unread, " : ""}</span>
        {time}
      </span>
      {item.type === "announcement" ? <AnnouncementBody item={item} unread={unread} /> : <MarkBody item={item} />}
    </li>
  );
}

function AnnouncementBody({ item, unread }: { item: Extract<NotificationItem, { type: "announcement" }>; unread: boolean }) {
  const meta = [KIND_LABEL[item.kind], item.subjectShort].filter(Boolean).join(" · ");
  return (
    <div className="grid min-w-0 gap-0.5">
      <b className={`block text-lead font-extrabold tracking-row ${unread ? "dot-before" : ""}`}>{item.title}</b>
      {item.body ? <p className="line-clamp-2 text-meta opacity-60">{item.body}</p> : null}
      <span className="text-meta opacity-60">{meta}</span>
    </div>
  );
}

function MarkBody({ item }: { item: Extract<NotificationItem, { type: "assignment_mark" }> }) {
  const marks = item.marks !== null ? ` · ${item.marks}${item.maxMarks !== null ? ` / ${item.maxMarks}` : ""}` : "";
  return (
    <div className="grid min-w-0 gap-0.5">
      <b className="block text-lead font-extrabold tracking-row">{item.title}</b>
      <span className="text-meta opacity-60">
        {`${STATUS_LABEL[item.status]}${marks} · ${item.subjectShort}`}
      </span>
    </div>
  );
}
