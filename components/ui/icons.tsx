import type { ComponentProps } from "react";

// Icons copied from the kit's <symbol> sprites (24x24 viewBox, currentColor).
export function ArrowIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 12h14m-5-5 5 5-5 5"
      />
    </svg>
  );
}

export function BellIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"
      />
    </svg>
  );
}

export function SearchIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zm5-2 4 4"
      />
    </svg>
  );
}

export function LockIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        d="M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3"
      />
    </svg>
  );
}

export function PlusIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function SpinnerIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.4" opacity="0.25" />
      <path stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  );
}

export function WeaveIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        d="M3 8c3 0 3 8 6 8s3-8 6-8 3 8 6 8M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8"
      />
    </svg>
  );
}
