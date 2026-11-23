import { WeaveIcon } from "@/components/ui/icons";

export const metadata = { title: "Offline" };

// Served by the service worker when a page cannot be fetched and is not cached.
export default function OfflinePage() {
  return (
    <main className="flex min-h-screen-safe flex-1 flex-col bg-night px-safe pt-safe pb-safe text-on-night">
      <header className="px-5.5 pt-1.5 md:px-10 md:pt-8">
        <span className="text-wordmark font-black tracking-wordmark">weave.</span>
      </header>
      <div className="mt-auto flex w-full flex-col gap-5 px-5.5 pb-6 md:mx-auto md:my-auto md:max-w-auth md:px-0 md:pb-0">
        <span className="grid size-18 place-items-center rounded-full border border-dashed border-night-line text-on-night">
          <WeaveIcon className="size-7" />
        </span>
        <div className="grid gap-2">
          <h1 className="font-display text-headline font-extrabold tracking-headline">You&apos;re offline.</h1>
          <p className="text-copy opacity-65">
            This page isn&apos;t saved on your phone yet. Reconnect and Weave will pick up where you left off.
          </p>
        </div>
      </div>
    </main>
  );
}
