"use client";

import { Button } from "@/components/ui/button";

// Error state for the subjects routes (use from error.tsx: <SubjectsError retry={reset} />). Kit .err, like HomeError.
export function SubjectsError({ retry, what = "Subjects" }: { retry: () => void; what?: string }) {
  return (
    <main className="mx-auto flex w-full max-w-column flex-1 flex-col justify-center px-4.5 pt-screen pb-screen">
      <div role="alert" className="grid gap-2.5 rounded-md border border-missing bg-app p-4">
        <b className="flex items-center gap-2 before:size-2 before:rounded-full before:bg-missing">
          {`${what} didn't load`}
        </b>
        <p className="text-small text-muted">
          We couldn&apos;t reach Weave just now. Your notes are safe. Check your connection and try again.
        </p>
        <Button variant="ink" onClick={retry} className="justify-self-start">
          Try again
        </Button>
      </div>
    </main>
  );
}
