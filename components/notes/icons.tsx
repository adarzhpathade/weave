import type { ComponentProps } from "react";

// Notes icons copied from the kit's <symbol> sprites (24x24 viewBox, currentColor): i-book, i-link, i-back, i-more, i-x.
export function BookIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5zm0 15A1.5 1.5 0 0 0 5.5 21H20M8 7h8"
      />
    </svg>
  );
}

export function LinkIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L11.5 6.8M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5"
      />
    </svg>
  );
}

export function BackIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function MoreIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <g fill="currentColor">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </g>
    </svg>
  );
}

export function CloseIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
