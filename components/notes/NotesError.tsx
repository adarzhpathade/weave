"use client";

import Link from "next/link";
import { ghostButtonSm, inkButtonSm } from "./styles";

// Error state for /notes and /notes/[id] (route error.tsx: <NotesError retry={unstable_retry ?? reset} />). Kit .err.
export function NotesError({ retry, scope = "list" }: { retry: () => void; scope?: "list" | "note" }) {
  return (
    <main className="mx-auto flex w-full max-w-column flex-1 flex-col justify-center px-4.5 pt-screen pb-screen">
      <div role="alert" className="grid gap-2.5 rounded-md border border-missing bg-app p-4">
        <b className="flex items-center gap-2 before:size-2 before:rounded-full before:bg-missing">
          {scope === "note" ? "This note didn't load" : "Your notes didn't load"}
        </b>
        <p className="text-small text-muted">
          We couldn&apos;t reach Weave just now. Your notes are safe. Check your connection and try again.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={retry} className={inkButtonSm}>
            Try again
          </button>
          {scope === "note" ? (
            <Link href="/notes" className={ghostButtonSm}>
              All notes
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
