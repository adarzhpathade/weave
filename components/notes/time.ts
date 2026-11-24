import { APP_LOCALE, APP_TIME_ZONE, calendarDaysBetween } from "@/components/nav/time";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

const shortDateFormat = new Intl.DateTimeFormat(APP_LOCALE, { timeZone: APP_TIME_ZONE, day: "numeric", month: "short" });

/** Kit note card meta: "Edited 2h ago", "Yesterday", "3 days ago", "Last week", "12 Nov". */
export function formatNoteAge(date: Date, now: Date): string {
  const diff = now.getTime() - date.getTime();
  if (diff < MINUTE) return "Edited just now";
  if (diff < HOUR) return `Edited ${Math.floor(diff / MINUTE)}m ago`;
  const days = calendarDaysBetween(date, now);
  if (days <= 0) return `Edited ${Math.floor(diff / HOUR)}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "Last week";
  return shortDateFormat.format(date);
}
