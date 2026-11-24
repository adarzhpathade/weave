"use client";

import { useRouter } from "next/navigation";
import { useState, type CSSProperties } from "react";
import { CodeStep } from "./CodeStep";
import { EmailStep } from "./EmailStep";

const HEADLINE_LINES = ["Your semester,", "in one place."] as const;

type Stage = { name: "email"; email: string } | { name: "code"; email: string };

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

export function LoginClient() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>({ name: "email", email: "" });

  function goHome() {
    router.replace("/home");
  }

  return (
    <>
      {stage.name === "email" ? (
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
      ) : (
        <div className="grid gap-2 pt-2">
          <h1 className="font-display text-headline font-extrabold tracking-headline">
            <span className="block overflow-hidden">
              <span style={step(0)} className="stagger block animate-rise opacity-65">
                Check your
              </span>
            </span>
            <span className="block overflow-hidden">
              <span style={step(1)} className="stagger block animate-rise">
                email.
              </span>
            </span>
          </h1>
          <p style={step(2)} className="stagger animate-fade-up break-words text-copy opacity-65">
            We sent a 6-digit code to {stage.email}.
          </p>
        </div>
      )}

      {stage.name === "email" ? (
        <EmailStep
          key="email"
          initialEmail={stage.email}
          onCodeSent={(email) => setStage({ name: "code", email })}
          onDemoSignedIn={goHome}
        />
      ) : (
        <CodeStep
          key="code"
          email={stage.email}
          onSignedIn={goHome}
          onChangeEmail={() => setStage({ name: "email", email: stage.email })}
        />
      )}
    </>
  );
}
