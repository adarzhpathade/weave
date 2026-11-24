// Loading state for Assignments (use as the route's loading.tsx / Suspense fallback). Same frame as AssignmentsScreen.
export function AssignmentsSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your assignments"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen"
    >
      <div className="flex items-center justify-between">
        <span className="skel h-3 w-32 rounded-sm" />
        <span className="skel h-9 w-36 rounded-pill" />
      </div>
      <span className="skel h-11 w-3/5 rounded-sm" />
      <div className="grid gap-2.5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="grid gap-2.5 rounded-md bg-surface px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="skel h-3 w-28 rounded-sm" />
              <span className="skel h-6.5 w-20 rounded-pill" />
            </div>
            <span className="skel h-4 w-4/5 rounded-sm" />
            <span className="skel h-5 w-24 rounded-sm" />
          </div>
        ))}
      </div>
    </main>
  );
}
