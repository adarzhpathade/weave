"use client";

import { useMemo, useState, type ReactNode } from "react";
import { APP_LOCALE, dayKey } from "@/components/nav/time";
import { AssignmentCard } from "./AssignmentCard";
import { cx } from "./classes";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";
import type { AssignmentItem } from "./types";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MIN_CELLS = 35; // kit: five rows; a month that needs six gets six

// Grid days are UTC midnights named by their "YYYY-MM-DD" key, so they never shift with the device zone.
const monthTitleFormat = new Intl.DateTimeFormat(APP_LOCALE, { timeZone: "UTC", month: "long", year: "numeric" });
const dayTitleFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});
const dayLongFormat = new Intl.DateTimeFormat(APP_LOCALE, {
  timeZone: "UTC",
  weekday: "long",
  day: "numeric",
  month: "long",
});

type Month = { year: number; month: number }; // month 0–11

function monthOf(key: string): Month {
  const [year, month] = key.split("-").map(Number);
  return { year, month: month - 1 };
}

function keyOfUtc(time: number): string {
  return new Date(time).toISOString().slice(0, 10);
}

function utcOfKey(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}

type Cell = { key: string; day: number; inMonth: boolean };

function buildCells({ year, month }: Month): Cell[] {
  const offset = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const total = Math.max(MIN_CELLS, Math.ceil((offset + daysInMonth) / 7) * 7);
  return Array.from({ length: total }, (_, i) => {
    const date = new Date(Date.UTC(year, month, 1 - offset + i));
    return { key: keyOfUtc(date.getTime()), day: date.getUTCDate(), inMonth: date.getUTCMonth() === month };
  });
}

function sameMonth(key: string, { year, month }: Month): boolean {
  const m = monthOf(key);
  return m.year === year && m.month === month;
}

/** Kit .cal .d / .d.due / .d.today — one border + fill set per state, so no classes conflict. */
function dayLook(due: boolean, isToday: boolean): string {
  if (isToday) return `${due ? "border-2" : "border"} border-ink bg-ink text-app`;
  if (due) return "border-2 border-ink bg-surface";
  return "border border-line";
}

/** Tag inside a due day (kit .cal .d small): first subject, "+n" for the rest. */
function dayTag(items: AssignmentItem[]): string {
  const first = items[0]?.subjectShort ?? "";
  return items.length > 1 ? `${first} +${items.length - 1}` : first;
}

// Kit "Pocket Cal": month grid, due days outlined, today filled. Tap a day to list its assignments below.
export function CalendarView({
  items,
  now,
  onOpen,
}: {
  items: AssignmentItem[];
  now: number;
  onOpen: (id: string, trigger: HTMLElement) => void;
}) {
  const todayKey = dayKey(new Date(now));
  const [shown, setShown] = useState<Month>(() => monthOf(todayKey));
  const [selected, setSelected] = useState<string | null>(todayKey);

  const byDay = useMemo(() => {
    const map = new Map<string, AssignmentItem[]>();
    for (const item of [...items].sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt))) {
      const key = dayKey(new Date(item.dueAt));
      const list = map.get(key);
      if (list) list.push(item);
      else map.set(key, [item]);
    }
    return map;
  }, [items]);

  const cells = buildCells(shown);
  const dueInMonth = items.filter(
    (item) => item.status === "pending" && sameMonth(dayKey(new Date(item.dueAt)), shown),
  ).length;
  const selectedItems = selected ? (byDay.get(selected) ?? []) : [];

  function move(delta: number) {
    const next = new Date(Date.UTC(shown.year, shown.month + delta, 1));
    const month = { year: next.getUTCFullYear(), month: next.getUTCMonth() };
    setShown(month);
    setSelected(sameMonth(todayKey, month) ? todayKey : null);
  }

  const monthTitle = monthTitleFormat.format(new Date(Date.UTC(shown.year, shown.month, 1)));

  return (
    <div className="grid gap-2.5">
      <div className="flex items-center justify-between gap-2.5">
        <h2 aria-live="polite" className="text-row font-bold">
          {monthTitle}
        </h2>
        <div className="flex items-center gap-2">
          <span className="font-mono text-label tracking-label text-muted uppercase">
            {dueInMonth > 0 ? `${dueInMonth} due` : "Nothing due"}
          </span>
          <MonthButton label="Previous month" onClick={() => move(-1)}>
            <ChevronLeftIcon className="size-4" />
          </MonthButton>
          <MonthButton label="Next month" onClick={() => move(1)}>
            <ChevronRightIcon className="size-4" />
          </MonthButton>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.25">
        {WEEKDAYS.map((d, i) => (
          <span key={i} aria-hidden="true" className="pb-0.5 text-center font-mono text-cal-dow text-muted">
            {d}
          </span>
        ))}
        {cells.map((cell) => {
          const dayItems = byDay.get(cell.key) ?? [];
          const due = dayItems.length > 0;
          const isToday = cell.key === todayKey;
          const frame = cx(
            "grid aspect-cal-day content-start gap-0.5 overflow-hidden rounded-cal px-1.25 py-1 text-left text-cal-day font-bold",
            dayLook(due, isToday),
          );
          if (!cell.inMonth) {
            return (
              <span key={cell.key} aria-hidden="true" className={cx(frame, "opacity-35")}>
                {cell.day}
              </span>
            );
          }
          const label = `${dayLongFormat.format(utcOfKey(cell.key))}${isToday ? ", today" : ""}${due ? `, ${dayItems.length} due` : ""}`;
          return (
            <button
              key={cell.key}
              type="button"
              aria-label={label}
              aria-pressed={selected === cell.key}
              onClick={() => setSelected(cell.key)}
              className={cx(
                frame,
                "transition-transform duration-fast ease-out active:scale-92",
                selected === cell.key && "outline-2 outline-offset-2 outline-accent",
              )}
            >
              <span aria-hidden="true">{cell.day}</span>
              {due ? (
                <small aria-hidden="true" className="font-mono text-cal-tag font-medium">
                  {dayTag(dayItems)}
                </small>
              ) : null}
            </button>
          );
        })}
      </div>

      <section aria-live="polite" className="mt-1.5 grid gap-2.5">
        {selected ? (
          <>
            <h3 className="font-mono text-label tracking-label text-muted uppercase">
              {dayTitleFormat.format(utcOfKey(selected))}
            </h3>
            {selectedItems.length > 0 ? (
              selectedItems.map((item, i) => (
                <AssignmentCard key={item.id} item={item} now={now} n={i} onOpen={onOpen} />
              ))
            ) : (
              <p className="text-small text-muted">Nothing due on this day.</p>
            )}
          </>
        ) : (
          <p className="text-small text-muted">Tap a day to see what&apos;s due.</p>
        )}
      </section>
    </div>
  );
}

function MonthButton({ label, onClick, children }: { label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-full border border-line bg-app text-ink transition-transform duration-fast ease-out active:scale-90"
    >
      {children}
    </button>
  );
}
