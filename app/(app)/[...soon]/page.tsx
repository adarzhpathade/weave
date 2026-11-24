import Link from "next/link";
import { Suspense } from "react";
import { titleFromPath } from "@/components/nav/sections";
import { ArrowIcon, WeaveIcon } from "@/components/ui/icons";

export const metadata = { title: "Coming next" };

// Calm placeholder in the kit's type for app sections that are not built yet (e.g. /graph, /materials).
export default function ComingNextPage({ params }: PageProps<"/[...soon]">) {
  return (
    <main className="@container mx-auto flex w-full max-w-column flex-1 flex-col gap-6 px-4.5 pt-screen pb-screen">
      <span className="font-mono text-label tracking-label text-muted uppercase">Coming next</span>
      <div className="mt-auto grid gap-5">
        <span className="grid size-18 place-items-center rounded-full border border-dashed border-muted text-muted">
          <WeaveIcon className="size-7" />
        </span>
        <h1 className="font-display text-greet font-extrabold tracking-display">
          <Suspense fallback={<span className="skel inline-block h-10 w-3/5 rounded-sm" />}>
            <SectionTitle params={params} />
          </Suspense>
          <br />
          <span className="text-muted">is on its way.</span>
        </h1>
        <p className="max-w-sm text-small text-muted">
          This part of Weave isn&apos;t ready yet. Your syllabus, notes and deadlines are all on Home.
        </p>
        <Link
          href="/home"
          className="group flex items-center gap-3 border-t border-line pt-5"
        >
          <span className="flex-1 text-row font-extrabold">Back to Home</span>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-full bg-ink text-app transition-transform duration-fast ease-out group-active:scale-90"
          >
            <ArrowIcon className="size-5" />
          </span>
        </Link>
      </div>
    </main>
  );
}

async function SectionTitle({ params }: { params: Promise<{ soon: string[] }> }) {
  const { soon } = await params;
  return <>{titleFromPath(`/${soon.join("/")}`)}</>;
}
