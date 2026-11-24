"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowIcon, SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { DOT_COUNT, clampPercent, filledDots, kindLabel, statusBand, step, subjectBg } from "./format";
import type { SubjectCard, SubjectsPageData } from "./types";

type Filter = "all" | "core" | "electives";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "core", label: "Core" },
  { id: "electives", label: "Electives" },
];

function matchesFilter(subject: SubjectCard, filter: Filter): boolean {
  if (filter === "all") return true;
  if (filter === "core") return subject.kind === "core";
  return subject.kind !== "core";
}

function matchesQuery(subject: SubjectCard, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase();
  return [subject.name, subject.code, subject.shortName].some((s) => s.toLowerCase().includes(q));
}

// Kit "SUBJECTS" phone: header row, title, filter chips, search, stacked wallet cards (.stack / .scard).
export function SubjectsScreen({ data }: { data: SubjectsPageData }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const searchId = useId();

  const counts = useMemo(
    () => ({
      all: data.subjects.length,
      core: data.subjects.filter((s) => s.kind === "core").length,
      electives: data.subjects.filter((s) => s.kind !== "core").length,
    }),
    [data.subjects],
  );

  const trimmed = query.trim();
  const visible = useMemo(
    () => data.subjects.filter((s) => matchesFilter(s, filter) && matchesQuery(s, trimmed)),
    [data.subjects, filter, trimmed],
  );

  const hasSubjects = data.subjects.length > 0;

  return (
    <main className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen">
      <div style={step(0)} className="flex animate-lift items-center justify-between gap-2.5 delay-list">
        <span className="font-mono text-label tracking-label text-muted uppercase">
          {`Semester ${data.semester} · ${data.divisionCode}`}
        </span>
        {visible.length > 1 ? (
          <span aria-hidden="true" className="font-mono text-label tracking-label text-muted uppercase">
            Tap a card
          </span>
        ) : null}
      </div>

      <h1
        style={step(1)}
        className="animate-lift font-display text-screen-title font-black tracking-display delay-list"
      >
        Subjects
      </h1>

      {hasSubjects ? (
        <>
          <div
            role="group"
            aria-label="Filter subjects"
            style={step(2)}
            className="flex animate-lift flex-wrap items-center gap-1.5 delay-list"
          >
            {FILTERS.map((f) => {
              const pressed = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => setFilter(f.id)}
                  // Plain string, not cn(): the class merger can read the custom size text-small as a color and drop it.
                  className={`inline-flex h-8.5 items-center gap-1.75 rounded-pill border pr-2 pl-3.5 text-small font-semibold transition-colors duration-fast ${
                    pressed ? "border-ink bg-surface text-ink" : "border-line bg-transparent text-muted"
                  }`}
                >
                  {pressed ? <span aria-hidden="true" className="size-1.5 rounded-full bg-ink" /> : null}
                  {f.label}
                  <span className="rounded-pill bg-line px-1.75 py-0.5 font-mono text-mono text-ink">
                    {counts[f.id]}
                  </span>
                </button>
              );
            })}
          </div>

          <label
            htmlFor={searchId}
            style={step(3)}
            className="flex h-12 animate-lift items-center gap-2.5 rounded-pill border border-line bg-app px-4 text-small text-muted delay-list focus-within:border-ink focus-within:outline-2 focus-within:outline-offset-3 focus-within:outline-accent"
          >
            <SearchIcon className="size-4.5 flex-none" />
            <span className="sr-only">Search subjects by name or code</span>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search subjects"
              autoComplete="off"
              enterKeyHint="search"
              className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>

          {visible.length > 0 ? (
            <SubjectStack subjects={visible} />
          ) : (
            <p className="text-small text-muted">
              {trimmed ? `No subjects match “${trimmed}”.` : "No subjects in this group."}
            </p>
          )}
        </>
      ) : (
        <p style={step(2)} className="animate-lift text-small text-muted delay-list">
          No subjects in this semester yet. They appear here once your department adds the semester plan.
        </p>
      )}
    </main>
  );
}

// Kit .stack: cards overlap; the tapped card opens and the cards below it slide down to make room.
// The last card is open by default (kit: open(cards.length - 1)).
function SubjectStack({ subjects }: { subjects: SubjectCard[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const found = subjects.findIndex((s) => s.id === openId);
  const openIndex = found >= 0 ? found : subjects.length - 1;
  const lastIndex = subjects.length - 1;

  return (
    <ul className={cn("relative grid", openIndex < lastIndex ? "pb-stack-open" : "pb-2")}>
      {subjects.map((subject, i) => (
        <SubjectStackCard
          key={subject.id}
          subject={subject}
          index={i}
          open={i === openIndex}
          shifted={i > openIndex}
          onOpen={() => setOpenId(subject.id)}
        />
      ))}
    </ul>
  );
}

type CardProps = { subject: SubjectCard; index: number; open: boolean; shifted: boolean; onOpen: () => void };

function SubjectStackCard({ subject, index, open, shifted, onOpen }: CardProps) {
  const moreId = useId();
  const percent = clampPercent(subject.percent);
  const dots = filledDots(percent);
  const band = statusBand(percent);

  return (
    <li
      style={step(index + 4)}
      className={cn(
        "stack-overlap relative grid min-h-scard animate-lift content-start gap-1.5 rounded-scard px-4.5 pt-4 pb-5 text-on-sub shadow-stack stack-card-motion delay-list",
        subjectBg(subject.colorIndex),
        shifted && "shift-stack-open",
      )}
    >
      {/* The ::before stretches over the whole card, so tapping anywhere on a closed card opens it. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={moreId}
        onClick={onOpen}
        className="grid gap-1.5 rounded-sm text-left before:absolute before:inset-0 before:rounded-scard"
      >
        <span className="flex items-center justify-between gap-2.5">
          <span className="font-mono text-mono tracking-status uppercase opacity-70">
            {`${subject.code} · ${kindLabel(subject.kind)}`}
          </span>
          <span className="text-card-pct font-extrabold tabular-nums">{`${percent}%`}</span>
        </span>
        <span className="text-card-name font-extrabold tracking-row">{subject.name}</span>
      </button>

      <div
        id={moreId}
        inert={!open}
        className={cn(
          "mt-11.5 grid gap-2.5 transition-opacity duration-base ease-out",
          open ? "opacity-100" : "opacity-0",
        )}
      >
        <span className="text-hint font-semibold opacity-75">
          {`${band} · ${subject.coveredTopics} of ${subject.totalTopics} topics`}
        </span>
        <span role="img" aria-label={`Progress ${dots} of ${DOT_COUNT}`} className="flex flex-wrap gap-1.25">
          {Array.from({ length: DOT_COUNT }, (_, d) => (
            <i
              key={d}
              className={cn("size-2.5 rounded-full stroke-field border-current", d < dots && "bg-current")}
            />
          ))}
        </span>
        <Link
          href={`/subjects/${subject.id}`}
          className="relative inline-flex h-8.5 items-center gap-1.5 justify-self-start rounded-pill bg-night px-3.5 text-hint font-bold text-on-night transition-transform duration-fast ease-out active:scale-95"
        >
          Open
          <span className="sr-only">{subject.name}</span>
          <ArrowIcon className="size-3.5" />
        </Link>
      </div>
    </li>
  );
}
