"use client";

import { useId, useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowIcon, SpinnerIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Enter your college email";
const NETWORK_ERROR = "Couldn't reach Weave. Check your connection and try again.";

export type LoginResult = { ok: true } | { ok: false; message: string };

type LoginFormProps = {
  /** Called with the trimmed email once it passes validation; a failure message shows under the field. */
  onContinue: (email: string) => Promise<LoginResult>;
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
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!EMAIL_PATTERN.test(email)) {
      setError(EMAIL_ERROR);
      return;
    }
    setError(null);
    startTransition(async () => {
      try {
        const result = await onContinue(email);
        // On success the caller navigates (or the server action redirects), so only failures need handling.
        if (result?.ok === false) setError(result.message);
      } catch (cause) {
        console.error("Sign-in request failed", cause);
        setError(NETWORK_ERROR);
      }
    });
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
        readOnly={pending}
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
        disabled={pending}
        aria-busy={pending}
        style={step(staggerStart + 1)}
        className="stagger mt-1 animate-fade-up"
      >
        {pending ? (
          <>
            <SpinnerIcon className="size-4.5 animate-spin motion-reduce:hidden" /> Checking…
          </>
        ) : (
          <>
            Continue <ArrowIcon className="size-4.5" />
          </>
        )}
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
