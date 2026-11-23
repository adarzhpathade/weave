"use client";

import { useId, useState, type CSSProperties, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Enter your college email";

type LoginFormProps = {
  /** Called with the trimmed email once it passes validation. Real sign-in is wired by the backend task. */
  onContinue: (email: string) => void;
  /** First stagger step for the entrance animation (headline and copy use the earlier steps). */
  staggerStart?: number;
};

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

export function LoginForm({ onContinue, staggerStart = 3 }: LoginFormProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!EMAIL_PATTERN.test(email)) {
      setError(EMAIL_ERROR);
      return;
    }
    setError(null);
    onContinue(email);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-2">
      <label
        htmlFor={fieldId}
        style={step(staggerStart)}
        className="stagger animate-fade-up text-field-label font-bold"
      >
        College email
      </label>
      <Input
        id={fieldId}
        name="email"
        type="email"
        tone="night"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="you@college.ac.in"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={() => error && setError(null)}
        style={step(staggerStart)}
        className="stagger animate-fade-up"
      />
      {error ? (
        <p id={errorId} role="alert" className="text-hint font-bold text-missing">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="lime"
        size="wide"
        style={step(staggerStart + 1)}
        className="stagger mt-1 animate-fade-up"
      >
        Continue <ArrowIcon className="size-4.5" />
      </Button>
      <p
        style={step(staggerStart + 2)}
        className="stagger animate-fade-up text-center text-hint opacity-50"
      >
        Only students on the department list can sign in.
      </p>
    </form>
  );
}
