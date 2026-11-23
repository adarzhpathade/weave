import { Fragment } from "react";
import { countdownParts, leftLabel, pad } from "./format";

type Size = "sm" | "md";

const VALUE: Record<Size, string> = {
  sm: "text-count-sm font-extrabold tracking-count tabular-nums",
  md: "text-count font-extrabold tracking-count tabular-nums",
};
const SEP: Record<Size, string> = {
  sm: "text-count-sm leading-sep font-light opacity-35",
  md: "text-count leading-sep font-light opacity-35",
};

/**
 * Kit .count. `sm` (cards, .count.sm): DD : HH : MM, no unit labels, ticks on the minute.
 * `md` (sheet): DD : HH : MM : SS with mono unit labels. `ms` is the time left; the parent owns the clock.
 */
export function Countdown({ ms, size }: { ms: number; size: Size }) {
  const parts = countdownParts(ms);
  const units: [number, string][] = [
    [parts.days, "days"],
    [parts.hours, "hrs"],
    [parts.minutes, "min"],
  ];
  if (size === "md") units.push([parts.seconds, "sec"]);
  const label = leftLabel(parts);

  return (
    <span
      role={size === "md" ? "timer" : undefined}
      aria-label={size === "md" ? label : undefined}
      className="flex items-start gap-1.5"
    >
      {size === "sm" ? <span className="sr-only">{label}</span> : null}
      {units.map(([value, unit], i) => (
        <Fragment key={unit}>
          {i > 0 ? (
            <span aria-hidden="true" className={SEP[size]}>
              :
            </span>
          ) : null}
          <span aria-hidden="true" className="grid justify-items-center">
            <b className={VALUE[size]}>{pad(value)}</b>
            {size === "md" ? (
              <small className="mt-1 font-mono text-mono-2xs tracking-widest text-muted uppercase">{unit}</small>
            ) : null}
          </span>
        </Fragment>
      ))}
    </span>
  );
}
