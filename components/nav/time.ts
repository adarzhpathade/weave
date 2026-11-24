// Date helpers shared by the shell and Home. Everything is formatted in the college's time zone so the
// server render and the browser render produce the same text (no hydration mismatch, no flash).
export const APP_LOCALE = "en-IN";
export const APP_TIME_ZONE = "Asia/Kolkata";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** Accepts a Date or an ISO string (server data can arrive as either). */
export function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

const dayKeyFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: APP_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** "2026-11-24": the calendar day in the college time zone. */
export function dayKey(date: Date): string {
  return dayKeyFormat.format(date);
}

/** Whole calendar days from `from` to `to` (0 = same day, 1 = tomorrow). */
export function calendarDaysBetween(from: Date, to: Date): number {
  const a = Date.parse(`${dayKey(from)}T00:00:00Z`);
  const b = Date.parse(`${dayKey(to)}T00:00:00Z`);
  return Math.round((b - a) / DAY);
}

const hourFormat = new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIME_ZONE, hour: "numeric", hour12: false });

export function greetingWord(date: Date): "Morning" | "Afternoon" | "Evening" {
  const hour = Number(hourFormat.format(date)) % 24;
  if (hour < 12) return "Morning";
  if (hour < 17) return "Afternoon";
  return "Evening";
}

const longDayFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: APP_TIME_ZONE,
  weekday: "short",
  day: "numeric",
  month: "short",
});
const weekdayFormat = new Intl.DateTimeFormat(APP_LOCALE, { timeZone: APP_TIME_ZONE, weekday: "short" });
const dayNumberFormat = new Intl.DateTimeFormat(APP_LOCALE, { timeZone: APP_TIME_ZONE, day: "numeric" });
const shortDateFormat = new Intl.DateTimeFormat(APP_LOCALE, { timeZone: APP_TIME_ZONE, day: "numeric", month: "short" });

/** "Tue, 24 Nov" */
export function formatToday(date: Date): string {
  return longDayFormat.format(date);
}
/** "Wed" */
export function formatWeekday(date: Date): string {
  return weekdayFormat.format(date);
}
/** "25" */
export function formatDayNumber(date: Date): string {
  return dayNumberFormat.format(date);
}

/** Notification time column: "now", "20m", "2h", "Mon", "12 Nov". */
export function formatRelativeShort(date: Date, now: Date): string {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return "now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h`;
  if (diff < 7 * DAY) return weekdayFormat.format(date);
  return shortDateFormat.format(date);
}

/** "edited 2h ago", "edited just now", "edited 12 Nov". */
export function formatEdited(date: Date, now: Date): string {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return "edited just now";
  if (diff < HOUR) return `edited ${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `edited ${Math.floor(diff / HOUR)}h ago`;
  if (diff < 7 * DAY) return `edited ${Math.floor(diff / DAY)}d ago`;
  return `edited ${shortDateFormat.format(date)}`;
}
