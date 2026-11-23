// Loading state for Profile (use as the route's loading.tsx / Suspense fallback). Same frame as ProfileScreen.
export function ProfileSkeleton() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading your profile"
      className="mx-auto flex w-full max-w-column flex-1 flex-col gap-4 px-4.5 pt-screen pb-screen"
    >
      <span className="skel h-3 w-48 rounded-sm" />
      <span className="skel h-11 w-3/4 rounded-sm" />
      {[5, 3].map((rows, section) => (
        <div key={section} className="mt-3 grid gap-2.5">
          <span className="skel h-4 w-28 rounded-sm" />
          <div className="grid border-t border-line">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-line py-3">
                <span className="skel h-3.5 w-24 rounded-sm" />
                <span className="skel h-3.5 w-32 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <span className="skel mt-4 h-button w-full rounded-pill" />
    </main>
  );
}
