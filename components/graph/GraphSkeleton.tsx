// Loading state for Graph (use as the route's loading.tsx / Suspense fallback). Same frame as GraphScreen.
const ROWS = [0, 1, 2, 3, 4, 5, 6, 7];

export function GraphSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your graph"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen lg:max-w-graph"
    >
      <div className="flex items-center justify-between">
        <span className="skel h-3 w-24 rounded-sm" />
        <span className="skel h-9 w-44 rounded-pill" />
      </div>
      <span className="skel h-11 w-2/5 rounded-sm" />
      <div className="flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="skel h-8.5 w-16 rounded-pill" />
        ))}
      </div>
      <span className="skel h-3 w-64 rounded-sm" />
      <div className="grid grid-cols-3 gap-x-8 gap-y-5 py-2">
        {ROWS.map((i) => (
          <div key={i} className="contents">
            <span className={i === 3 ? "skel h-3.5 w-full rounded-sm" : "h-3.5"} />
            <span className={i % 2 === 0 ? "skel h-3.5 w-4/5 rounded-sm" : "h-3.5"} />
            <span className="skel h-3.5 w-full rounded-sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
