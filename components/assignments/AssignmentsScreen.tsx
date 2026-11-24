"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState, type JSX } from "react";
import { AssignmentCard } from "./AssignmentCard";
import { AssignmentSheet } from "./AssignmentSheet";
import { CalendarView } from "./CalendarView";
import { dueTime } from "./format";
import type { AssignmentItem, AssignmentsPageData } from "./types";
import { useNow } from "./useNow";

const MINUTE = 60_000;

type View = "list" | "calendar";

// Kit "ASSIGNMENTS": division label + List/Calendar toggle, "Due soon" with live countdowns, then "Marked".
// The open sheet lives in `?id=` so links (notifications, Home) can open it; `openId` opens it on load.
export function AssignmentsScreen({ data, openId }: { data: AssignmentsPageData; openId?: string }): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const now = useNow(Date.parse(data.now), MINUTE);
  const [view, setView] = useState<View>("list");
  const [selectedId, setSelectedId] = useState<string | null>(openId ?? null);
  const [returnFocus, setReturnFocus] = useState<HTMLElement | null>(null);

  // A new `?id=` from outside (a link while this screen is open) opens that assignment.
  const [lastOpenId, setLastOpenId] = useState(openId);
  if (openId !== lastOpenId) {
    setLastOpenId(openId);
    if (openId) setSelectedId(openId);
  }

  const { pending, marked } = useMemo(() => split(data.items), [data.items]);
  const selected = selectedId ? (data.items.find((item) => item.id === selectedId) ?? null) : null;

  const open = useCallback(
    (id: string, trigger: HTMLElement) => {
      setReturnFocus(trigger);
      setSelectedId(id);
      router.replace(`${pathname}?id=${encodeURIComponent(id)}`, { scroll: false });
    },
    [router, pathname],
  );

  const onClosed = useCallback(() => {
    setSelectedId(null);
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  const empty = data.items.length === 0;

  return (
    <>
      <main className="@container mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen">
        <h1 className="sr-only">Assignments</h1>
        <div className="flex items-center justify-between gap-2.5">
          <span className="font-mono text-label tracking-label text-muted uppercase">
            {`${data.divisionCode} · Semester ${data.semester}`}
          </span>
          <ViewToggle view={view} onChange={setView} />
        </div>

        <h2 className="font-display text-scr-title font-black tracking-display">Due soon</h2>

        {view === "list" ? (
          empty ? (
            <p className="text-section font-extrabold text-muted">No assignments yet.</p>
          ) : (
            <div className="grid gap-2.5">
              {pending.length > 0 ? (
                pending.map((item, i) => <AssignmentCard key={item.id} item={item} now={now} n={i} onOpen={open} />)
              ) : (
                <p className="text-section font-extrabold">
                  Nothing due. <span className="text-muted">Enjoy the quiet.</span>
                </p>
              )}
              {marked.length > 0 ? (
                <>
                  <div className="mt-1 flex items-center justify-between gap-2.5">
                    <h3 className="text-row font-bold">Marked</h3>
                    <span className="font-mono text-label tracking-label text-muted uppercase">{marked.length}</span>
                  </div>
                  {marked.map((item, i) => (
                    <AssignmentCard key={item.id} item={item} now={now} n={pending.length + 1 + i} onOpen={open} />
                  ))}
                </>
              ) : null}
            </div>
          )
        ) : (
          <CalendarView items={data.items} now={now} onOpen={open} />
        )}
      </main>

      {selected ? (
        <AssignmentSheet
          key={selected.id}
          item={selected}
          initialNow={now}
          returnFocus={returnFocus}
          onClosed={onClosed}
        />
      ) : null}
    </>
  );
}

function split(items: AssignmentItem[]): { pending: AssignmentItem[]; marked: AssignmentItem[] } {
  const pending = items.filter((item) => item.status === "pending").sort((a, b) => dueTime(a) - dueTime(b));
  const marked = items.filter((item) => item.status !== "pending").sort((a, b) => dueTime(b) - dueTime(a));
  return { pending, marked };
}

// Kit .view-toggle: two pill buttons, the pressed one filled with ink.
function ViewToggle({ view, onChange }: { view: View; onChange: (view: View) => void }) {
  const options: [View, string][] = [
    ["list", "List"],
    ["calendar", "Calendar"],
  ];
  return (
    <div role="group" aria-label="View" className="inline-flex rounded-pill border border-line bg-surface p-0.75">
      {options.map(([value, label]) => {
        const pressed = view === value;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(value)}
            className={
              pressed
                ? "h-7.5 rounded-pill bg-ink px-3 text-hint font-bold text-app transition-colors duration-fast"
                : "h-7.5 rounded-pill bg-transparent px-3 text-hint font-bold text-muted transition-colors duration-fast"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
