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
