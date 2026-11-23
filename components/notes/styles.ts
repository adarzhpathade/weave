// Class helpers for the notes screens.
// `cn` (tailwind-merge) reads our custom font-size tokens (text-small, text-chip, …) as text colours and drops one
// of them when both appear, so these components join classes plainly and never put two conflicting classes together.
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const pillButton =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-pill px-3.5 text-excerpt font-bold whitespace-nowrap select-none transition-transform duration-fast ease-out active:scale-95 disabled:pointer-events-none disabled:opacity-50";

/** Kit .btn.btn-ink at the compact size used in the notes header (36px, 13px). */
export const inkButtonSm = `${pillButton} bg-ink text-app`;
/** Kit .btn.btn-ghost, compact. */
export const ghostButtonSm = `${pillButton} border border-line bg-transparent text-ink`;
/** Destructive confirm (kit .err colour). */
export const dangerButtonSm = `${pillButton} bg-missing text-on-status`;
