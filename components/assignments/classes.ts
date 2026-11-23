/**
 * Plain class join (no conflict merging). `cn()` merges like tailwind-merge, which reads custom size tokens
 * such as `text-mono` or `text-cal-day` as colours and drops them next to `text-ink`; these components
 * never pass conflicting classes, so a join is enough.
 */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
