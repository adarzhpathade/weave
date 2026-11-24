"use client";

import { useId, useState, type JSX } from "react";
import { PUSH_HELP, usePush } from "./usePush";

/** One hairline row in the Profile notifications list: label, help line, and the same switch as the other rows. */
export function PushToggle(): JSX.Element {
  const labelId = useId();
  const { state, enable, disable, error } = usePush();
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    try {
      if (state === "on") await disable();
      else await enable();
    } finally {
      setBusy(false);
    }
  }

  const help =
    state === "unsupported" || state === "ios-install" || state === "denied"
      ? PUSH_HELP[state]
      : "Deadline reminders on this device";
  const hasSwitch = state === "on" || state === "off";

  return (
    <div className="grid gap-1 border-b border-line py-2.5">
      <div className="flex items-center justify-between gap-4 text-small font-semibold">
        <span id={labelId}>Phone notifications</span>
        {state === "loading" ? (
          <span aria-hidden="true" className="h-8 w-13 flex-none animate-pulse rounded-pill bg-line" />
        ) : hasSwitch ? (
          <button
            type="button"
            role="switch"
            aria-checked={state === "on"}
            aria-labelledby={labelId}
            disabled={busy}
            onClick={toggle}
            className="relative h-8 w-13 flex-none rounded-pill bg-line transition-colors duration-base ease-out after:absolute after:top-0.75 after:left-0.75 after:size-6.5 after:rounded-full after:bg-surface after:shadow-knob after:transition-transform after:duration-base after:ease-spring aria-checked:bg-lime aria-checked:after:translate-x-5 disabled:cursor-progress motion-reduce:transition-none motion-reduce:after:transition-none"
          />
        ) : null}
      </div>
      {state === "loading" ? (
        <span aria-hidden="true" className="h-3 w-40 animate-pulse rounded-pill bg-line" />
      ) : (
        <p className="text-fine text-muted">{help}</p>
      )}
      {error !== null ? (
        <p
          role="alert"
          className="flex items-center gap-2 text-fine font-semibold before:size-2 before:flex-none before:rounded-full before:bg-missing"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
