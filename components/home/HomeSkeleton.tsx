// Loading state for Home (use as the route's loading.tsx / Suspense fallback). Same frame as HomeScreen.
export function HomeSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your home"
      className="@container mx-auto flex w-full max-w-column flex-1 flex-col gap-6 px-4.5 pt-screen pb-screen"
    >
      <div className="flex items-center justify-between">
        <span className="skel h-3 w-24 rounded-sm" />
        <div className="flex gap-2">
          <span className="skel size-10 rounded-full" />
          <span className="skel size-10 rounded-full" />
        </div>
      </div>
      <div className="mt-1.5 grid gap-2">
        <span className="skel h-10 w-2/5 rounded-sm" />
        <span className="skel h-10 w-3/5 rounded-sm" />
      </div>
      {[0, 1, 2].map((i) => (
        <section key={i} className="grid gap-3.5 border-t border-line pt-5">
          <span className="skel h-3 w-28 rounded-sm" />
          <span className="skel h-7 w-4/5 rounded-sm" />
          <span className="skel h-10 w-3/5 rounded-sm" />
        </section>
      ))}
    </main>
  );
}
