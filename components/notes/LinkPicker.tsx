"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SearchIcon } from "@/components/ui/icons";
import { linkKey } from "./LinkChip";
import type { NoteLinkChip } from "./types";

const MAX_ROWS = 30; // long semesters have 100+ topics; the search narrows them down

// Kit .card.picker: search box + rows labelled Topic / Note. Esc closes and returns focus to "+ Link".
export function LinkPicker({
  id,
  options,
  onPick,
  onClose,
}: {
  id: string;
  options: NoteLinkChip[];
  onPick: (link: NoteLinkChip) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchId = useId();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const needle = query.trim().toLocaleLowerCase();
  const matches = options.filter((o) => !needle || o.label.toLocaleLowerCase().includes(needle));
  const shown = matches.slice(0, MAX_ROWS);

  return (
    <div
      id={id}
      role="dialog"
      aria-label="Link to a topic or a note"
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.stopPropagation();
          onClose();
        }
      }}
      className="grid animate-fade-up rounded-md bg-surface px-3.5 pt-2.5 pb-1"
    >
      <label
        htmlFor={searchId}
        className="mb-1.5 flex h-10 items-center gap-2.5 rounded-pill border border-line bg-app px-4 text-small text-muted transition-colors duration-fast focus-within:border-ink"
      >
        <SearchIcon className="size-4.5 flex-none" />
        <span className="sr-only">Link to a topic or a note</span>
        <input
          ref={inputRef}
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Link to a topic or a note"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-ink outline-none placeholder:text-muted"
        />
      </label>

      {shown.length === 0 ? (
        <p role="status" className="border-t border-line py-3 text-picker text-muted">
          {options.length === 0 ? "Everything is already linked." : "No topic or note matches."}
        </p>
      ) : (
        <ul className="grid">
          {shown.map((option) => (
            <li key={linkKey(option)}>
              <button
                type="button"
                onClick={() => onPick(option)}
                className="grid min-h-10.5 w-full grid-cols-picker items-center gap-2 border-t border-line py-1.5 text-left text-picker font-bold text-ink"
              >
                <span className="font-mono text-label font-medium tracking-label text-muted uppercase">
                  {option.kind === "topic" ? "Topic" : "Note"}
                </span>
                <span className="min-w-0">{option.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {matches.length > shown.length ? (
        <p className="border-t border-line py-2 text-hint text-muted">{`${matches.length - shown.length} more. Type to narrow down.`}</p>
      ) : null}
    </div>
  );
}
