"use client";

import Link from "next/link";
import { useId, useMemo, useState, type CSSProperties } from "react";
import { PlusIcon, SearchIcon } from "@/components/ui/icons";
import { CloseIcon } from "./icons";
import { LinkChip, linkKey } from "./LinkChip";
import { cx, ghostButtonSm, inkButtonSm } from "./styles";
import { formatNoteAge } from "./time";
import type { NoteListItem, NotesPageData } from "./types";

type Filter = "all" | "linked" | "free";

const CARD_CHIPS = 2; // kit cards show two chips; the meta line counts all links

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

function matches(item: NoteListItem, query: string): boolean {
  if (!query) return true;
  return `${item.title}\n${item.excerpt}`.toLocaleLowerCase().includes(query);
}

// Kit "NOTES" phone: label row + New note, "Your notes", search, All / Linked / Free chips, note cards.
export function NotesScreen({ data }: { data: NotesPageData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const searchId = useId();
  const now = new Date(data.now);

  const newHref = data.filterTopic ? `/notes/new?topic=${encodeURIComponent(data.filterTopic.id)}` : "/notes/new";
  const counts = useMemo(() => {
    const linked = data.items.filter((i) => i.links.length > 0).length;
    return { all: data.items.length, linked, free: data.items.length - linked };
  }, [data.items]);

  const needle = query.trim().toLocaleLowerCase();
  const visible = data.items.filter((item) => {
    if (filter === "linked" && item.links.length === 0) return false;
    if (filter === "free" && item.links.length > 0) return false;
    return matches(item, needle);
  });

  return (
    <main className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen">
      <div style={step(0)} className="stagger flex animate-fade-up items-center justify-between gap-2.5">
        <span className="font-mono text-label tracking-label text-muted uppercase">{`My notes · ${counts.all}`}</span>
        <NewNoteLink href={newHref} />
      </div>

      <h1 style={step(1)} className="stagger animate-fade-up font-display text-screen-title font-black tracking-display">
        Your notes
      </h1>

      {counts.all === 0 ? (
        <EmptyNotes href={newHref} filterTopic={data.filterTopic} />
      ) : (
        <>
          <label
            htmlFor={searchId}
            style={step(2)}
            className="stagger flex h-12 animate-fade-up items-center gap-2.5 rounded-pill border border-line bg-app px-4 text-small text-muted transition-colors duration-fast focus-within:border-ink"
          >
            <SearchIcon className="size-4.5 flex-none" />
            <span className="sr-only">Search your notes</span>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your notes"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
            />
          </label>

          <div style={step(3)} className="stagger flex animate-fade-up flex-wrap items-center gap-1.5">
            <div role="group" aria-label="Filter notes" className="contents">
              <FilterChip label="All" count={counts.all} pressed={filter === "all"} onClick={() => setFilter("all")} />
              <FilterChip label="Linked" count={counts.linked} pressed={filter === "linked"} onClick={() => setFilter("linked")} />
              <FilterChip label="Free" count={counts.free} pressed={filter === "free"} onClick={() => setFilter("free")} />
            </div>
            {data.filterTopic ? <TopicFilterChip label={data.filterTopic.label} /> : null}
          </div>

          {visible.length === 0 ? (
            <NoMatches
              query={query.trim()}
              onClear={() => {
                setQuery("");
                setFilter("all");
              }}
            />
          ) : (
            <ul className="grid gap-4">
              {visible.map((item, i) => (
                <li key={item.id} style={step(Math.min(4 + i, 8))} className="stagger animate-fade-up">
                  <NoteCard item={item} now={now} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </main>
  );
}

function NewNoteLink({ href }: { href: string }) {
  return (
    <Link href={href} className={inkButtonSm}>
      <PlusIcon className="size-4" />
      New note
    </Link>
  );
}

// Kit .fchip: outlined pill with a mono count; pressed = ink border, surface fill, leading dot.
function FilterChip({ label, count, pressed, onClick }: { label: string; count: number; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "inline-flex h-8.5 items-center gap-1.75 rounded-pill border pr-2 pl-3.5 text-small font-semibold transition-colors duration-fast",
        pressed
          ? "border-ink bg-surface text-ink before:size-1.5 before:rounded-full before:bg-ink"
          : "border-line bg-transparent text-muted",
      )}
    >
      {label}
      <span className="rounded-pill bg-line px-1.75 py-0.5 font-mono text-mono text-ink">{count}</span>
    </button>
  );
}

// Removable "Topic: …" chip shown when the list is filtered to one topic (clear → /notes).
function TopicFilterChip({ label }: { label: string }) {
  return (
    <Link
      href="/notes"
      aria-label={`Topic: ${label}. Clear topic filter`}
      className="inline-flex h-8.5 max-w-full items-center gap-1.75 rounded-pill border border-ink bg-surface pr-1.5 pl-3.5 text-small font-semibold text-ink"
    >
      <span className="truncate">{`Topic: ${label}`}</span>
      <span aria-hidden="true" className="grid size-6 flex-none place-items-center rounded-full bg-line">
        <CloseIcon className="size-3" />
      </span>
    </Link>
  );
}

function linksMeta(count: number): string {
  if (count === 0) return "Free note";
  return count === 1 ? "1 link" : `${count} links`;
}

// Kit .ncard
function NoteCard({ item, now }: { item: NoteListItem; now: Date }) {
  const chips = item.links.slice(0, CARD_CHIPS);
  return (
    <Link
      href={`/notes/${item.id}`}
      className="grid gap-2 rounded-md bg-surface px-4 py-3.5 transition-transform duration-fast ease-out active:scale-98"
    >
      <span className="flex items-center justify-between gap-2 font-mono text-mono-xs tracking-status text-muted uppercase">
        <span>{formatNoteAge(new Date(item.updatedAt), now)}</span>
        <span>{linksMeta(item.links.length)}</span>
      </span>
      <b className="text-card-title font-extrabold tracking-row">{item.title.trim() || "Untitled"}</b>
      {item.excerpt.trim() ? <p className="line-clamp-2 text-excerpt text-muted">{item.excerpt}</p> : null}
      {chips.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {chips.map((link) => (
            <LinkChip key={linkKey(link)} link={link} />
          ))}
        </span>
      ) : null}
    </Link>
  );
}

// Kit .empty: dashed circle illustration, bold line, muted line, action.
function EmptyNotes({ href, filterTopic }: { href: string; filterTopic: NotesPageData["filterTopic"] }) {
  return (
    <div style={step(2)} className="stagger grid animate-fade-up justify-items-center gap-2 px-2 py-4 text-center">
      {filterTopic ? (
        <div className="justify-self-start">
          <TopicFilterChip label={filterTopic.label} />
        </div>
      ) : null}
      <span className="mt-4 grid size-18 place-items-center rounded-full stroke-field border-dashed border-muted text-muted">
        <PlusIcon className="size-7" />
      </span>
      <b className="text-lead font-bold">No notes yet.</b>
      <p className="max-w-88 text-small text-muted">Write your first one.</p>
      <div className="mt-2">
        <NewNoteLink href={href} />
      </div>
    </div>
  );
}

function NoMatches({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div role="status" className="grid justify-items-center gap-2 px-2 py-4 text-center">
      <span className="grid size-18 place-items-center rounded-full stroke-field border-dashed border-muted text-muted">
        <SearchIcon className="size-7" />
      </span>
      <b className="text-lead font-bold">No notes match.</b>
      <p className="max-w-88 text-small text-muted">
        {query ? `Nothing in your notes mentions “${query}”.` : "No notes in this group yet."}
      </p>
      <button
        type="button"
        onClick={onClear}
        className={`${ghostButtonSm} mt-2`}
      >
        Show all notes
      </button>
    </div>
  );
}

// Loading state for /notes (route loading.tsx). Same frame as NotesScreen.
export function NotesSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your notes"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen"
    >
      <div className="flex items-center justify-between">
        <span className="skel h-3 w-24 rounded-sm" />
        <span className="skel h-9 w-28 rounded-pill" />
      </div>
      <span className="skel h-12 w-3/5 rounded-sm" />
      <span className="skel h-12 w-full rounded-pill" />
      <div className="flex gap-1.5">
        <span className="skel h-8.5 w-18 rounded-pill" />
        <span className="skel h-8.5 w-22 rounded-pill" />
        <span className="skel h-8.5 w-18 rounded-pill" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="grid gap-2 rounded-md bg-surface px-4 py-3.5">
          <span className="skel h-2.5 w-24 rounded-sm" />
          <span className="skel h-4 w-3/5 rounded-sm" />
          <span className="skel h-3 w-full rounded-sm" />
          <span className="skel h-3 w-4/5 rounded-sm" />
        </div>
      ))}
    </main>
  );
}
