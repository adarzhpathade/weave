import type { CSSProperties } from "react";
import { LoginClient } from "./LoginClient";

export const metadata = { title: "Sign in" };

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

const HEADLINE_LINES = ["Your semester,", "in one place."] as const;

export default function LoginPage() {
  return (
    <main className="flex min-h-screen-safe flex-1 flex-col bg-night px-safe pt-safe pb-safe text-on-night">
      <header className="flex items-center justify-between px-5.5 pt-1.5 md:px-10 md:pt-8">
        <span className="text-wordmark font-black tracking-wordmark">weave.</span>
        <span className="font-mono text-label uppercase tracking-label opacity-60">CSIT · RGPV</span>
      </header>

      <div className="mt-auto flex w-full flex-col gap-5 px-5.5 pb-6 md:mx-auto md:my-auto md:max-w-auth md:px-0 md:pb-0">
        <div className="grid gap-2 pt-2">
          <h1 className="font-display text-headline font-extrabold tracking-headline">
            {HEADLINE_LINES.map((line, index) => (
              <span key={line} className="block overflow-hidden">
                <span style={step(index)} className="stagger block animate-rise">
                  {line}
                </span>
              </span>
            ))}
          </h1>
          <p style={step(2)} className="stagger animate-fade-up text-copy opacity-65">
            Syllabus, notes, deadlines and announcements for CSIT and CY students.
          </p>
        </div>
        <LoginClient />
      </div>
    </main>
  );
}
