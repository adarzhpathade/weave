"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import type { HomeData, HomeDueNext, HomeLastNote, HomeWeekItem } from "@/lib/db/queries";
import { useShell } from "@/components/nav/AppShell";
import {
  calendarDaysBetween,
  dayKey,
  formatDayNumber,
  formatEdited,
  formatToday,
  formatWeekday,
  greetingWord,
  toDate,
} from "@/components/nav/time";
import { ArrowIcon, BellIcon, PlusIcon } from "@/components/ui/icons";
import { Countdown } from "./Countdown";

const WEEK_COLUMNS = 3;
const ITEMS_PER_DAY = 2;

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

function initials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean);
  const first = words[0]?.charAt(0) ?? "";
  const last = words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? "") : "";
  return `${first}${last}`.toUpperCase() || "?";
}

// Kit "HOME" phone (.hm2 + .hm-s): date + bell + avatar, greeting, Due next, This week, Keep writing.
export function HomeScreen({ home, now }: { home: HomeData; now: string }) {
  const serverNow = new Date(now);
  const { student, unreadCount, notificationsOpen, openNotifications } = useShell();

  return (
    <main className="@container mx-auto flex w-full max-w-column flex-1 flex-col gap-6 px-4.5 pt-screen pb-screen">
      <div style={step(0)} className="stagger flex animate-fade-up items-center justify-between gap-2.5">
        <span className="font-mono text-label tracking-label text-muted uppercase">{formatToday(serverNow)}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openNotifications}
            aria-haspopup="dialog"
            aria-expanded={notificationsOpen}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} new` : "Notifications"}
            className="relative grid size-10 place-items-center rounded-full border border-line bg-surface text-ink transition-transform duration-fast ease-out active:scale-92"
          >
            <BellIcon className="size-4.75" />
            {unreadCount > 0 ? (
              <span
                aria-hidden="true"
                className="absolute -top-0.75 -right-0.75 grid h-4.5 min-w-4.5 place-items-center rounded-pill border-2 border-app bg-accent px-1.25 text-mono-2xs font-extrabold text-on-accent"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            ) : null}
          </button>
          <span
            aria-label={student.fullName}
            role="img"
            className="grid size-10 flex-none place-items-center rounded-full bg-sub-1 text-small font-extrabold text-on-sub"
          >
            {initials(student.fullName)}
          </span>
        </div>
      </div>

      <h1
        style={step(1)}
        className="stagger mt-1.5 animate-fade-up font-display text-greet font-extrabold tracking-display"
      >
        <span className="text-muted">{greetingWord(serverNow)},</span>
        <br />
        {home.student.firstName}
      </h1>

      <Section n={2} label={home.dueNext ? `Due next · ${home.dueNext.subjectName}` : "Due next"} aside={home.dueNext ? <DueChip due={home.dueNext} serverNow={serverNow} /> : null}>
        {home.dueNext ? (
          <>
            <p className="text-due font-extrabold tracking-title">{home.dueNext.title}</p>
            <Countdown target={toDate(home.dueNext.dueAt)} serverNow={serverNow} />
          </>
        ) : (
          <p className="text-due font-extrabold tracking-title">
            Nothing due. <span className="text-muted">Enjoy the quiet.</span>
          </p>
        )}
      </Section>

      <Section n={3} label="This week">
        <ThisWeek items={home.thisWeek} />
      </Section>

      <Section n={4} label="Keep writing">
        <KeepWriting note={home.lastNote} serverNow={serverNow} />
      </Section>
    </main>
  );
}

function Section({ n, label, aside, children }: { n: number; label: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section style={step(n)} className="stagger grid animate-fade-up gap-3.5 border-t border-line pt-5">
      <div className="flex items-center justify-between gap-2.5">
        <h2 className="font-mono text-label tracking-label text-muted uppercase">{label}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Status chip next to "Due next": amber for today/tomorrow (kit .status.late), outlined otherwise.
function DueChip({ due, serverNow }: { due: HomeDueNext; serverNow: Date }) {
  const dueAt = toDate(due.dueAt);
  const days = calendarDaysBetween(serverNow, dueAt);
  const base =
    "inline-flex h-6.5 items-center rounded-pill px-2.75 font-mono text-mono font-medium tracking-status whitespace-nowrap uppercase";
  if (days <= 0) return <span className={`${base} bg-late text-on-status`}>Today</span>;
  if (days === 1) return <span className={`${base} bg-late text-on-status`}>Tomorrow</span>;
  return <span className={`${base} border border-ink text-ink`}>{`Due ${formatWeekday(dueAt)}`}</span>;
}

type DayColumn = { key: string; date: Date; labels: string[] };

function groupByDay(items: HomeWeekItem[]): DayColumn[] {
  const columns: DayColumn[] = [];
  for (const item of items) {
    const date = toDate(item.dueAt);
    const key = dayKey(date);
    const column = columns.find((c) => c.key === key);
    if (column) column.labels.push(item.label);
    else columns.push({ key, date, labels: [item.label] });
  }
  return columns.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, WEEK_COLUMNS);
}

// Kit .hm-week: up to three day columns split by hairlines.
function ThisWeek({ items }: { items: HomeWeekItem[] }) {
  const columns = groupByDay(items);
  if (columns.length === 0) {
    return <p className="text-small text-muted">Nothing else due in the next seven days.</p>;
  }
  return (
    <ul className="grid grid-cols-3">
      {columns.map((column) => {
        const shown = column.labels.slice(0, ITEMS_PER_DAY);
        const more = column.labels.length - shown.length;
        return (
          <li
            key={column.key}
            className="grid content-start gap-0.75 pr-2.5 not-first:border-l not-first:border-line not-first:pl-2.5"
          >
            <small className="font-mono text-mono-2xs tracking-label text-muted uppercase">{formatWeekday(column.date)}</small>
            <b className="font-display text-week-day font-black tracking-week">{formatDayNumber(column.date)}</b>
            {shown.map((label) => (
              <span key={label} className="text-hint leading-tight font-bold">
                {label}
              </span>
            ))}
            {more > 0 ? <span className="text-hint leading-tight font-bold text-muted">{`+${more} more`}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

// Kit .hm-cont inside .hm-s: title + meta line + round ink arrow button.
function KeepWriting({ note, serverNow }: { note: HomeLastNote | null; serverNow: Date }) {
  if (!note) {
    return (
      <RowLink href="/notes" title="Start your first note" meta="Write under any topic. It counts toward your progress." icon={<PlusIcon className="size-5" />} />
    );
  }
  const where = [note.subjectShort, note.unitOrder !== null ? `Unit ${note.unitOrder}` : null].filter(Boolean);
  const meta = [...where, formatEdited(toDate(note.updatedAt), serverNow)].join(" · ");
  return <RowLink href={`/notes/${note.id}`} title={note.title || "Untitled note"} meta={meta} icon={<ArrowIcon className="size-5" />} />;
}

function RowLink({ href, title, meta, icon }: { href: string; title: string; meta: string; icon: ReactNode }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-sm">
      <span className="grid min-w-0 flex-1 gap-0.5">
        <b className="truncate text-row font-extrabold">{title}</b>
        <span className="text-hint text-muted">{meta}</span>
      </span>
      <span
        aria-hidden="true"
        className="grid size-10 flex-none place-items-center rounded-full bg-ink text-app transition-transform duration-fast ease-out group-active:scale-90"
      >
        {icon}
      </span>
    </Link>
  );
}
