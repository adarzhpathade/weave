"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type JSX, type KeyboardEvent, type MouseEvent } from "react";
import { layoutGraph, nodeKey, type GraphLayout, type LaidEdge, type LaidNode } from "./layout";
import type { GraphData } from "./types";

type Mode = "notes" | "syllabus";

function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

/**
 * Kit "GRAPH" phone + "Graph · laptop view" card. Subject → units → topics, with the student's notes as
 * diamonds and dashed links. Tap a dot to highlight it and its neighbours; the info sheet says what it is.
 * Phone: fixed-size SVG that scrolls sideways inside its strip, floating sheet above the pill, no default
 * selection. Laptop (lg): the graph sits in a surface card that scales it, with the info row inside the card.
 */
export function GraphScreen({ data }: { data: GraphData }): JSX.Element {
  const [mode, setMode] = useState<Mode>("notes");
  const [selected, setSelected] = useState<string | null>(null);
  const withNotes = mode === "notes";

  // Another subject (chip link) re-renders this screen with new data: start clean.
  const [subjectId, setSubjectId] = useState(data.subject.id);
  if (subjectId !== data.subject.id) {
    setSubjectId(data.subject.id);
    setSelected(null);
  }

  const phone = useMemo(() => layoutGraph(data, "phone", withNotes), [data, withNotes]);
  const wide = useMemo(() => layoutGraph(data, "wide", withNotes), [data, withNotes]);
  // Counts in the info sheet always include notes, even in Syllabus mode.
  const full = useMemo(() => (withNotes ? phone : layoutGraph(data, "phone", true)), [data, withNotes, phone]);

  const highlight = useMemo(() => neighbourhood(phone.edges, selected), [phone.edges, selected]);
  const info = selected ? describe(selected, data, full) : null;

  useEffect(() => {
    if (selected === null) return;
    function onKey(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setSelected(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

  function changeMode(next: Mode) {
    setMode(next);
    setSelected(null);
  }

  const hasUnits = data.units.length > 0;
  const svgProps = { selected, highlight, onSelect: setSelected, subjectName: data.subject.name };

  return (
    <>
      <main className="@container mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-graph lg:max-w-graph lg:pb-screen">
        <div className="flex items-center justify-between gap-2.5">
          <span className="font-mono text-label tracking-label text-muted uppercase">
            {`${data.subject.shortName} · Sem ${data.semester}`}
          </span>
          <ModeToggle mode={mode} onChange={changeMode} className="lg:hidden" />
        </div>
        <h1 className="font-display text-scr-title font-black tracking-display">Graph</h1>

        <SubjectChips data={data} />

        {/* phone */}
        <div className="grid gap-4 lg:hidden">
          <Legend />
          {hasUnits ? (
            <div className="-mx-4.5 no-scrollbar overflow-x-auto overscroll-x-contain px-4.5">
              <GraphSvg layout={phone} variant="phone" {...svgProps} />
            </div>
          ) : (
            <EmptyUnits />
          )}
          {hasUnits && withNotes && data.notes.length === 0 ? <EmptyNotes shortName={data.subject.shortName} /> : null}
        </div>

        {/* laptop */}
        <section
          aria-label={`${data.subject.name} graph`}
          className="hidden gap-4 rounded-lg border border-line bg-surface p-5 lg:grid"
        >
          <div className="flex flex-wrap items-end justify-between gap-2.5">
            <div>
              <span className="font-mono text-label tracking-label text-muted uppercase">Graph · laptop view</span>
              <h2 className="mt-1 text-h2 font-black tracking-headline">
                {data.subject.name},{" "}
                <span className="font-light italic tracking-title text-accent">
                  {withNotes ? "woven with your notes" : "the full syllabus"}
                </span>
              </h2>
            </div>
            <ModeToggle mode={mode} onChange={changeMode} />
          </div>
          {hasUnits ? (
            <div className="no-scrollbar g-on-surface overflow-x-auto">
              <GraphSvg layout={wide} variant="wide" {...svgProps} />
            </div>
          ) : (
            <EmptyUnits />
          )}
          <InfoRow info={info} variant="inline" />
          <Legend />
          {hasUnits && withNotes && data.notes.length === 0 ? <EmptyNotes shortName={data.subject.shortName} /> : null}
        </section>
      </main>

      {info ? (
        <div className="fixed inset-x-3 bottom-gsheet z-30 mx-auto max-w-pill animate-fade-up lg:hidden">
          <InfoRow info={info} variant="sheet" />
        </div>
      ) : null}
    </>
  );
}

// ---------- selection ----------

type Highlight = { nodes: Set<string>; edges: Set<string> } | null;

function neighbourhood(edges: LaidEdge[], selected: string | null): Highlight {
  if (selected === null) return null;
  const nodes = new Set([selected]);
  const hl = new Set<string>();
  for (const e of edges) {
    if (e.a !== selected && e.b !== selected) continue;
    hl.add(e.key);
    nodes.add(e.a === selected ? e.b : e.a);
  }
  return { nodes, edges: hl };
}

type Info = { kind: string; title: string; line: string; href: string; action: string };

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

function describe(key: string, data: GraphData, full: GraphLayout): Info | null {
  const node = full.nodes.find((n) => n.key === key);
  if (!node) return null;
  let topics = 0;
  let notes = 0;
  for (const e of full.edges) {
    if (e.a !== key && e.b !== key) continue;
    const other = e.a === key ? e.b : e.a;
    if (other.startsWith(nodeKey.note(""))) notes++;
    else if (other.startsWith(nodeKey.topic(""))) topics++;
  }
  const subjectHref = `/subjects/${encodeURIComponent(data.subject.id)}`;

  switch (node.kind) {
    case "note":
      return {
        kind: "Your note",
        title: node.title,
        line: `Linked to ${plural(topics, "topic")} · ${plural(notes, "note")}`,
        href: `/notes/${encodeURIComponent(node.id)}`,
        action: "Open note",
      };
    case "topic":
      return {
        kind: "Topic",
        title: node.title,
        line: `${node.covered ? "Covered" : "Not covered yet"} · ${notes === 0 ? "no notes" : plural(notes, "note")}`,
        href: `/notes/new?topic=${encodeURIComponent(node.id)}`,
        action: "Write a note",
      };
    case "unit": {
      const unit = data.units.find((u) => u.id === node.id);
      const total = unit?.topics.length ?? 0;
      const covered = unit?.topics.filter((t) => t.covered).length ?? 0;
      return {
        kind: `Unit ${unit?.order ?? ""}`.trim(),
        title: unit?.title ?? node.title,
        line: `${plural(total, "topic")} · ${covered} covered`,
        href: subjectHref,
        action: "Open subject",
      };
    }
    case "subject": {
      const total = data.units.reduce((sum, u) => sum + u.topics.length, 0);
      return {
        kind: "Subject",
        title: data.subject.name,
        line: `${plural(data.units.length, "unit")} · ${plural(total, "topic")}`,
        href: subjectHref,
        action: "Open subject",
      };
    }
  }
}

// ---------- svg ----------

function GraphSvg({
  layout,
  variant,
  selected,
  highlight,
  onSelect,
  subjectName,
}: {
  layout: GraphLayout;
  variant: "phone" | "wide";
  selected: string | null;
  highlight: Highlight;
  onSelect: (key: string | null) => void;
  subjectName: string;
}) {
  const size =
    variant === "phone"
      ? { width: layout.width, height: layout.height, className: "block overflow-visible" }
      : { className: "block h-auto w-full min-w-graph-min overflow-visible" };

  return (
    <svg
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      role="group"
      aria-label={`${subjectName} graph. Use Tab to move between dots, Enter to select, Escape to clear.`}
      onClick={() => onSelect(null)}
      {...size}
    >
      {layout.edges.map((e) => (
        <path
          key={e.key}
          d={e.d}
          style={{ "--col": e.col } as CSSProperties}
          className={cx("g-edge", e.kind === "note" && "g-edge-note", highlight && !highlight.edges.has(e.key) && "is-dim")}
        />
      ))}
      {layout.nodes.map((n) => (
        <GraphNode
          key={n.key}
          node={n}
          selected={selected === n.key}
          dim={highlight !== null && !highlight.nodes.has(n.key)}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}

const RADIUS = { subject: 9, unit: 7, topic: 6 } as const;
const HIT_RADIUS = 16; // bigger invisible tap target around each dot
const DIAMOND = 12;
const LABEL_DX = 13;
const LABEL_DY = 4;

const KIND_NAME = { subject: "Subject", unit: "Unit", topic: "Topic", note: "Note" } as const;

function GraphNode({
  node,
  selected,
  dim,
  onSelect,
}: {
  node: LaidNode;
  selected: boolean;
  dim: boolean;
  onSelect: (key: string | null) => void;
}) {
  function onClick(event: MouseEvent<SVGGElement>) {
    event.stopPropagation();
    onSelect(node.key);
  }
  function onKeyDown(event: KeyboardEvent<SVGGElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onSelect(node.key);
  }
  const status = node.kind === "topic" ? (node.covered ? ", covered" : ", not covered yet") : "";

  return (
    <g
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={`${KIND_NAME[node.kind]}: ${node.title}${status}`}
      onClick={onClick}
      onKeyDown={onKeyDown}
      style={{ "--col": node.col, "--j": node.j } as CSSProperties}
      className={cx(
        "g-node",
        `g-${node.kind}`,
        node.covered && "is-covered",
        selected && "is-sel",
        dim && "is-dim",
      )}
    >
      {node.label !== node.title ? <title>{node.title}</title> : null}
      <circle className="g-hit" cx={node.x} cy={node.y} r={HIT_RADIUS} />
      {node.kind === "note" ? (
        <rect
          className="g-dot"
          x={node.x - DIAMOND / 2}
          y={node.y - DIAMOND / 2}
          width={DIAMOND}
          height={DIAMOND}
          rx={3}
          transform={`rotate(45 ${node.x} ${node.y})`}
        />
      ) : (
        <circle className="g-dot" cx={node.x} cy={node.y} r={RADIUS[node.kind]} />
      )}
      <text x={node.x + LABEL_DX} y={node.y + LABEL_DY}>
        {node.label}
      </text>
    </g>
  );
}

// ---------- chrome ----------

// Kit .view-toggle: With notes / Syllabus.
function ModeToggle({ mode, onChange, className }: { mode: Mode; onChange: (mode: Mode) => void; className?: string }) {
  const options: [Mode, string][] = [
    ["notes", "With notes"],
    ["syllabus", "Syllabus"],
  ];
  return (
    <div
      role="group"
      aria-label="Graph view"
      className={cx("inline-flex flex-none rounded-pill border border-line bg-surface p-0.75", className)}
    >
      {options.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={mode === value}
          onClick={() => onChange(value)}
          className={cx(
            "h-7.5 rounded-pill px-3 text-hint font-bold transition-colors duration-fast",
            mode === value ? "bg-ink text-app" : "bg-transparent text-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Kit .fchip as links: one per subject of the semester; the open one is pressed (ink border + dot).
function SubjectChips({ data }: { data: GraphData }) {
  if (data.subjects.length < 2) return null;
  return (
    <nav aria-label="Subjects" className="-mx-4.5 no-scrollbar flex gap-2 overflow-x-auto px-4.5 lg:mx-0 lg:flex-wrap lg:px-0">
      {data.subjects.map((s) => {
        const current = s.id === data.subject.id;
        return (
          <Link
            key={s.id}
            href={`/graph?subject=${encodeURIComponent(s.id)}`}
            aria-current={current ? "page" : undefined}
            title={s.name}
            scroll={false}
            className={cx(
              "inline-flex h-8.5 flex-none items-center gap-1.75 rounded-pill border px-3.5 text-small font-semibold whitespace-nowrap transition-colors duration-fast",
              current
                ? "border-ink bg-surface text-ink before:size-1.5 before:rounded-full before:bg-ink"
                : "border-line bg-transparent text-muted",
            )}
          >
            {s.shortName}
          </Link>
        );
      })}
    </nav>
  );
}

// Kit .legend / .lg: shape + word for every mark, so nothing relies on colour alone.
function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3.5 text-hint font-semibold text-muted">
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="size-2.5 rounded-full stroke-field border-ink bg-lime" />
        Covered
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="size-2.5 rounded-full stroke-field border-muted" />
        Not yet
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="size-2.25 rotate-45 rounded-tick bg-accent" />
        Your note
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i aria-hidden="true" className="h-0 w-4.5 border-t-2 border-dashed border-accent" />
        Link
      </span>
    </div>
  );
}

// Kit .gsheet (phone, floating above the pill) and .ginfo (laptop, inside the card).
function InfoRow({ info, variant }: { info: Info | null; variant: "sheet" | "inline" }) {
  return (
    <div
      aria-live="polite"
      className={cx(
        "flex items-center rounded-md py-3 pr-3 pl-4",
        variant === "sheet" ? "gap-2.5 bg-surface shadow-float" : "gap-3 bg-app",
      )}
    >
      <div className="grid min-w-0 flex-1 gap-px">
        <span className="font-mono text-label tracking-label text-muted uppercase">{info?.kind ?? "Graph"}</span>
        <b className="truncate text-row">{info?.title ?? "Tap a dot"}</b>
        <span className="text-hint text-muted">{info?.line ?? "See what it connects to"}</span>
      </div>
      {info ? (
        <Link
          href={info.href}
          className="inline-flex h-10 flex-none items-center rounded-pill bg-ink px-4 text-fine font-bold text-app transition-transform duration-fast ease-out active:scale-95"
        >
          {info.action}
        </Link>
      ) : null}
    </div>
  );
}

function EmptyUnits() {
  return (
    <p className="text-section font-extrabold">
      No units yet. <span className="text-muted">The syllabus for this subject hasn&apos;t been added.</span>
    </p>
  );
}

function EmptyNotes({ shortName }: { shortName: string }) {
  return (
    <p className="text-fine text-muted">
      {`No notes in ${shortName} yet. Tap a topic and write one to weave it in.`}
    </p>
  );
}
