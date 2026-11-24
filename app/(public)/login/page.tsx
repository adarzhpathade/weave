import { LoginClient } from "./LoginClient";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen-safe flex-1 flex-col bg-night px-safe pt-safe pb-safe text-on-night">
      <header className="flex items-center justify-between px-5.5 pt-1.5 md:px-10 md:pt-8">
        <span className="text-wordmark font-black tracking-wordmark">weave.</span>
        <span className="font-mono text-label uppercase tracking-label opacity-60">CSIT · RGPV</span>
      </header>

      <div className="mt-auto flex w-full flex-col gap-5 px-5.5 pb-6 md:mx-auto md:my-auto md:max-w-auth md:px-0 md:pb-0">
        <LoginClient />
      </div>
    </main>
  );
}
