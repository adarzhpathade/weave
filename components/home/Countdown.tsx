"use client";

import { Fragment, useEffect, useState } from "react";

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function parts(ms: number) {
  const left = Math.max(0, ms);
  return {
    days: Math.floor(left / DAY),
    hours: Math.floor(left / HOUR) % 24,
    minutes: Math.floor(left / MINUTE) % 60,
    seconds: Math.floor(left / SECOND) % 60,
  };
}

/**
 * Kit .count: DD : HH : MM : SS with mono unit labels. Starts from the server time (`serverNow`) so the
 * first paint matches the server render, then ticks on the device clock.
 */
export function Countdown({ target, serverNow }: { target: Date; serverNow: Date }) {
  const [now, setNow] = useState(() => serverNow.getTime());

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, SECOND);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const { days, hours, minutes, seconds } = parts(target.getTime() - now);
  const units: [number, string][] = [
    [days, "days"],
    [hours, "hrs"],
    [minutes, "min"],
    [seconds, "sec"],
  ];

  return (
    <div
      role="timer"
      aria-label={`${days} days ${hours} hours ${minutes} minutes left`}
      className="flex items-start gap-1.5"
    >
      {units.map(([value, label], i) => (
        <Fragment key={label}>
          {i > 0 ? (
            <span aria-hidden="true" className="text-count leading-sep font-light opacity-35">
              :
            </span>
          ) : null}
          <span aria-hidden="true" className="grid justify-items-center">
            <b className="text-count font-extrabold tracking-count tabular-nums">{pad(value)}</b>
            <small className="mt-1 font-mono text-mono-2xs tracking-widest text-muted uppercase">{label}</small>
          </span>
        </Fragment>
      ))}
    </div>
  );
}
