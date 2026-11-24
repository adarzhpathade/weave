import type { ComponentProps } from "react";

// Kit sprites #i-check and #i-back (24x24 viewBox, currentColor). Not yet in components/ui/icons.tsx.
export function CheckIcon({ className, ...props }: ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} {...props}>
      <path
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12.5 4.5 4.5L19 7.5"
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
