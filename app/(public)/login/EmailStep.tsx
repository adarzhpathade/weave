"use client";

import { useId, useState, useTransition, type CSSProperties, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { ArrowIcon, SpinnerIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { requestSignInCode } from "@/lib/actions/auth";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Enter your college email";
const NETWORK_ERROR = "Couldn't reach Weave. Check your connection and try again.";

type EmailStepProps = {
  /** Email to prefill (kept when the student comes back from the code step). */
  initialEmail: string;
  onCodeSent: (email: string) => void;
  onDemoSignedIn: () => void;
};

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

export function EmailStep({ initialEmail, onCodeSent, onDemoSignedIn }: EmailStepProps) {
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
        const result = await requestSignInCode(email);
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        if (result.data.demo) onDemoSignedIn();
        else onCodeSent(email);
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
        style={step(3)}
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
        defaultValue={initialEmail}
        readOnly={pending}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={() => error && setError(null)}
        style={step(3)}
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
        style={step(4)}
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
      <p style={step(5)} className="stagger animate-fade-up text-center text-hint opacity-50">
        Only students on the department list can sign in.
      </p>
    </form>
  );
}
