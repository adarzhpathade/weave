import type { CSSProperties } from "react";
import type { SubjectKind } from "./types";

// Kit subject colors --c-sub-1 … --c-sub-6. Literal class names so Tailwind generates them.
const SUBJECT_BG = ["bg-sub-1", "bg-sub-2", "bg-sub-3", "bg-sub-4", "bg-sub-5", "bg-sub-6"] as const;

/** colorIndex is any integer ≥ 1; it wraps onto the six kit colors. */
export function subjectBg(colorIndex: number): string {
  const n = SUBJECT_BG.length;
  const i = (((Math.trunc(colorIndex) - 1) % n) + n) % n;
  return SUBJECT_BG[i] ?? SUBJECT_BG[0];
}

const KIND_LABEL: Record<SubjectKind, string> = {
  core: "Core",
  dept_elective: "Dept. elective",
  open_elective: "Open elective",
};

export function kindLabel(kind: SubjectKind): string {
  return KIND_LABEL[kind];
}

export function clampPercent(percent: number): number {
  if (!Number.isFinite(percent)) return 0;
  return Math.min(100, Math.max(0, Math.round(percent)));
}

/** Status bands from AGENTS.md §4 — always shown as text next to the number. */
export function statusBand(percent: number): string {
  const p = clampPercent(percent);
  if (p === 0) return "Not started";
  if (p < 40) return "Low";
  if (p <= 75) return "In progress";
  return "Mastered";
}

export const DOT_COUNT = 5;

/** Kit .dots: five dots, one per 20%. */
export function filledDots(percent: number): number {
  return Math.min(DOT_COUNT, Math.round(clampPercent(percent) / 20));
}

export function noteCountText(count: number): string {
  if (count <= 0) return "—";
  return count === 1 ? "1 note" : `${count} notes`;
}

/** Index for the stagger utilities (animation-delay from --n). */
export function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}
