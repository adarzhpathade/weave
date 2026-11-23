"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { cn } from "@/lib/utils";
import { clampPercent, noteCountText, step, subjectBg } from "./format";
import { BackIcon, CheckIcon } from "./icons";
import type { SubjectDetail, TopicRow, UnitBlock } from "./types";

function defaultOpenUnits(units: UnitBlock[]): Set<string> {
  const first = units.find((u) => u.covered < u.total);
  return new Set(first ? [first.id] : []);
}

// Kit "SUBJECT DETAIL" phone: colored hero (.sub-hero + .stats), then units (.unit + .bar) with topics (.topics).
export function SubjectDetailScreen({ subject }: { subject: SubjectDetail }) {
  const [openUnits, setOpenUnits] = useState<Set<string>>(() => defaultOpenUnits(subject.units));

  function toggle(id: string) {
    setOpenUnits((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 pb-screen">
      <header
        className={cn(
          "grid gap-3.5 rounded-b-hero px-4.5 pt-screen pb-5.5 text-on-sub",
          subjectBg(subject.colorIndex),
        )}
      >
        <div className="flex items-center justify-between gap-2.5">
          <Link
            href="/subjects"
            aria-label="Back to subjects"
            className="grid size-10 place-items-center rounded-full border border-line bg-surface text-ink transition-transform duration-fast ease-out active:scale-90"
          >
            <BackIcon className="size-5" />
          </Link>
          <span className="font-mono text-label tracking-label uppercase">{subject.code}</span>
        </div>
        <h1 className="font-display text-hero-title font-black tracking-display">{subject.name}</h1>
        <dl className="grid grid-cols-2 border-t border-current">
          <div className="pt-2.5">
            <dt className="text-small font-normal italic opacity-70">Progress</dt>
            <dd className="text-stat font-extrabold tracking-snug tabular-nums">{`${clampPercent(subject.percent)}%`}</dd>
          </div>
          <div className="border-l border-current pt-2.5 pl-4">
            <dt className="text-small font-normal italic opacity-70">Notes</dt>
            <dd className="text-stat font-extrabold tracking-snug tabular-nums">{subject.noteCount}</dd>
          </div>
        </dl>
      </header>

      <div className="px-4.5">
        {subject.units.length > 0 ? (
          <ul aria-label="Units" className="grid gap-2.5">
            {subject.units.map((unit, i) => (
              <UnitCard key={unit.id} unit={unit} index={i} open={openUnits.has(unit.id)} onToggle={() => toggle(unit.id)} />
            ))}
          </ul>
        ) : (
          <p className="text-small text-muted">Units not added yet. They appear here once your faculty adds the syllabus.</p>
        )}
      </div>
    </main>
  );
}

type UnitCardProps = { unit: UnitBlock; index: number; open: boolean; onToggle: () => void };

function UnitCard({ unit, index, open, onToggle }: UnitCardProps) {
  const topicsId = useId();
  const ratio = unit.total > 0 ? Math.min(1, Math.max(0, unit.covered / unit.total)) : 0;
  const complete = unit.total > 0 && unit.covered >= unit.total;

  return (
    <li style={step(index)} className="grid animate-lift rounded-md bg-surface px-4 py-3.5 delay-list">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={topicsId}
        onClick={onToggle}
        className="grid gap-2.5 rounded-sm text-left"
      >
        <span className="flex justify-between gap-2.5 text-small font-bold">
          <span>{`${unit.order} · ${unit.title}`}</span>
          <span className="font-mono text-mono font-medium whitespace-nowrap text-muted">
            {`${unit.covered}/${unit.total}`}
            <span className="sr-only"> topics covered</span>
          </span>
        </span>
        <span aria-hidden="true" className="block h-2 overflow-hidden rounded-pill bg-line">
          <span
            style={{ width: `${ratio * 100}%` }}
            className={cn("block h-full origin-left animate-grow rounded-pill", complete ? "bg-lime" : "bg-ink")}
          />
        </span>
      </button>

      <div id={topicsId} className={cn("rows-collapse", open && "rows-expand")}>
        <div inert={!open} className="min-h-0 overflow-hidden">
          {unit.topics.length > 0 ? (
            <ul className="mt-3 grid gap-0.5">
              {unit.topics.map((topic) => (
                <TopicLink key={topic.id} topic={topic} />
              ))}
            </ul>
          ) : (
            <p className="mt-3 border-t border-line py-1.75 text-topic text-muted">Topics not added yet</p>
          )}
        </div>
      </div>
    </li>
  );
}

// Kit .topic: tick turns lime once the topic has a note; tapping opens its notes or starts the first one.
function TopicLink({ topic }: { topic: TopicRow }) {
  const done = topic.noteCount > 0;
  const href = done ? `/notes?topic=${encodeURIComponent(topic.id)}` : `/notes/new?topic=${encodeURIComponent(topic.id)}`;

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-2.5 border-t border-line py-1.75 text-topic transition-opacity duration-fast active:opacity-60"
      >
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 flex-none place-items-center rounded-full stroke-field",
            done ? "border-lime bg-lime text-on-lime" : "border-muted",
          )}
        >
          {done ? <CheckIcon className="size-3" /> : null}
        </span>
        <span className="min-w-0 flex-1">{topic.title}</span>
        <span className="ml-auto pl-2 font-mono text-mono whitespace-nowrap text-muted">
          {done ? noteCountText(topic.noteCount) : (
            <>
              <span aria-hidden="true">{noteCountText(0)}</span>
              <span className="sr-only">No notes yet, write one</span>
            </>
          )}
        </span>
      </Link>
    </li>
  );
}
