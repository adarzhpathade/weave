import { APP_LOCALE, APP_TIME_ZONE } from "@/components/nav/time";
import type { AssignmentItem } from "./types";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const dueDayFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const dueTimeFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "Tue, 25 Nov · 11:59 pm" (shown uppercase by the label style). */
export function formatDue(date: Date): string {
  return `${dueDayFormat.format(date)} · ${dueTimeFormat.format(date)}`;
}

export function dueTime(item: AssignmentItem): number {
  return Date.parse(item.dueAt);
}

/** Pending and past its deadline: the teacher has not marked it yet. */
export function isOverdue(item: AssignmentItem, now: number): boolean {
  return item.status === "pending" && dueTime(item) <= now;
}

/** "8 / 10", or "8" when the assignment has no max marks; null when not marked with marks. */
export function marksText(item: AssignmentItem): string | null {
  if (item.status === "pending" || item.marks === null) return null;
  return item.maxMarks !== null ? `${item.marks} / ${item.maxMarks}` : String(item.marks);
}

export type CountdownParts = { days: number; hours: number; minutes: number; seconds: number };

export function countdownParts(ms: number): CountdownParts {
  const left = Math.max(0, ms);
  return {
    days: Math.floor(left / DAY),
    hours: Math.floor(left / HOUR) % 24,
    minutes: Math.floor(left / MINUTE) % 60,
    seconds: Math.floor(left / SECOND) % 60,
  };
}

/** Screen-reader text for a countdown: "2 days 3 hours 5 minutes left". */
export function leftLabel({ days, hours, minutes }: CountdownParts): string {
  return `${days} days ${hours} hours ${minutes} minutes left`;
}

export function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
