// Loading states for the subjects routes (use as loading.tsx). Same frames as SubjectsScreen / SubjectDetailScreen.
export function SubjectsSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your subjects"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen"
    >
      <span className="skel h-3 w-32 rounded-sm" />
      <span className="skel h-12 w-3/5 rounded-sm" />
      <div className="flex gap-1.5">
        <span className="skel h-8.5 w-16 rounded-pill" />
        <span className="skel h-8.5 w-20 rounded-pill" />
        <span className="skel h-8.5 w-24 rounded-pill" />
      </div>
      <span className="skel h-12 w-full rounded-pill" />
      <div className="grid pb-2">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="stack-overlap skel block min-h-scard rounded-scard shadow-stack" />
        ))}
      </div>
    </main>
  );
}

export function SubjectDetailSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading subject"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 pb-screen"
    >
      <div className="grid gap-3.5 rounded-b-hero bg-surface px-4.5 pt-screen pb-5.5">
        <div className="flex items-center justify-between">
          <span className="skel size-10 rounded-full" />
          <span className="skel h-3 w-16 rounded-sm" />
        </div>
        <span className="skel h-10 w-4/5 rounded-sm" />
        <div className="grid grid-cols-2 gap-4 border-t border-line pt-2.5">
          <span className="skel h-12 rounded-sm" />
          <span className="skel h-12 rounded-sm" />
        </div>
      </div>
      <div className="grid gap-2.5 px-4.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="grid gap-2.5 rounded-md bg-surface px-4 py-3.5">
            <span className="skel h-4 w-3/4 rounded-sm" />
            <span className="skel h-2 w-full rounded-pill" />
          </div>
        ))}
      </div>
    </main>
  );
}
