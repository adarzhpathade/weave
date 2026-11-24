"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { ArrowIcon, SpinnerIcon } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { requestSignInCode, verifySignInCode } from "@/lib/actions/auth";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;
const CODE_ERROR = "Enter the 6-digit code";
const NETWORK_ERROR = "Couldn't reach Weave. Check your connection and try again.";

type CodeStepProps = {
  email: string;
  onSignedIn: () => void;
  onChangeEmail: () => void;
};

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

export function CodeStep({ email, onSignedIn, onChangeEmail }: CodeStepProps) {
  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [verifying, startVerify] = useTransition();
  const [resending, startResend] = useTransition();
  const busy = verifying || resending;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function submit(value: string) {
    if (busy) return;
    if (value.length !== CODE_LENGTH) {
      setError(CODE_ERROR);
      return;
    }
    setError(null);
    setNotice(null);
    startVerify(async () => {
      try {
        const result = await verifySignInCode(email, value);
        if (result.ok) {
          onSignedIn();
          return;
        }
        setError(result.error.message);
        inputRef.current?.focus();
        inputRef.current?.select();
      } catch (cause) {
        console.error("Code verification failed", cause);
        setError(NETWORK_ERROR);
      }
    });
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setCode(digits);
    if (error) setError(null);
    if (digits.length === CODE_LENGTH) submit(digits);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit(code);
  }

  function handleResend() {
    if (busy || cooldown > 0) return;
    setError(null);
    setNotice(null);
    startResend(async () => {
      try {
        const result = await requestSignInCode(email);
        if (!result.ok) {
          setError(result.error.message);
          return;
        }
        setCode("");
        setNotice("New code sent.");
        setCooldown(RESEND_COOLDOWN_SECONDS);
        inputRef.current?.focus();
      } catch (cause) {
        console.error("Resend code failed", cause);
        setError(NETWORK_ERROR);
      }
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-2">
      <label
        htmlFor={fieldId}
        style={step(0)}
        className="stagger animate-fade-up text-field-label font-bold"
      >
        6-digit code
      </label>
      <Input
        ref={inputRef}
        id={fieldId}
        name="code"
        type="text"
        tone="night"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={CODE_LENGTH}
        spellCheck={false}
        placeholder="000000"
        value={code}
        onChange={handleChange}
        readOnly={verifying}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        style={step(0)}
        className="stagger animate-fade-up tracking-label"
      />
      <p aria-live="polite" className="text-hint font-bold opacity-65 empty:hidden">
        {notice}
      </p>
      {error ? (
        <p id={errorId} role="alert" className="text-hint font-bold text-missing">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="lime"
        size="wide"
        disabled={busy}
        aria-busy={verifying}
        style={step(1)}
        className="stagger mt-1 animate-fade-up"
      >
        {verifying ? (
          <>
            <SpinnerIcon className="size-4.5 animate-spin motion-reduce:hidden" /> Signing in…
          </>
        ) : (
          <>
            Sign in <ArrowIcon className="size-4.5" />
          </>
        )}
      </Button>
      <div style={step(2)} className="stagger animate-fade-up flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          disabled={busy || cooldown > 0}
          aria-busy={resending}
          onClick={handleResend}
          className="h-10 px-4"
        >
          {resending ? (
            <>
              <SpinnerIcon className="size-4.5 animate-spin motion-reduce:hidden" /> Sending…
            </>
          ) : cooldown > 0 ? (
            `Resend code in ${cooldown}s`
          ) : (
            "Resend code"
          )}
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onChangeEmail} className="h-10 px-4">
          Use a different email
        </Button>
      </div>
    </form>
  );
}
