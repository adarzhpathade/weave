import type { ShellStudent } from "./types";

export type SectionId = "home" | "study" | "notes" | "assignments" | "profile";

type SubLink = { kind: "link"; label: string; href: string };
type SubLater = { kind: "later"; label: string };
type SubSignOut = { kind: "signout"; label: string };
export type MenuSub = SubLink | SubLater | SubSignOut;

export type MenuItem = {
  id: SectionId;
  word: string;
  /** Right-hand meta in the kit's menu row ("Today", "Sem 5", "CSIT-2"). */
  meta: (student: ShellStudent) => string;
  /** A row with `href` is a direct link; a row with `subs` opens its vertical list. */
  href?: string;
  subs?: MenuSub[];
};

export const MENU: MenuItem[] = [
  { id: "home", word: "Home", meta: () => "Today", href: "/home" },
  {
    id: "study",
    word: "Study",
    meta: (s) => `Sem ${s.semester}`,
    subs: [
      { kind: "link", label: "Subjects & progress", href: "/subjects" },
      { kind: "link", label: "Graph", href: "/graph" },
      { kind: "link", label: "Materials", href: "/materials" },
      { kind: "later", label: "Quizzes" },
      { kind: "later", label: "AI tutor" },
    ],
  },
  { id: "notes", word: "Notes", meta: () => "Private", href: "/notes" },
  { id: "assignments", word: "Assignments", meta: () => "Deadlines", href: "/assignments" },
  {
    id: "profile",
    word: "Profile",
    meta: (s) => s.divisionCode,
    subs: [
      { kind: "link", label: "My profile", href: "/profile" },
      { kind: "signout", label: "Sign out" },
    ],
  },
];

const SECTION_PREFIXES: { prefix: string; id: SectionId }[] = [
  { prefix: "/home", id: "home" },
  { prefix: "/subjects", id: "study" },
  { prefix: "/graph", id: "study" },
  { prefix: "/materials", id: "study" },
  { prefix: "/notes", id: "notes" },
  { prefix: "/assignments", id: "assignments" },
  { prefix: "/profile", id: "profile" },
];

export function sectionFromPath(pathname: string): SectionId | null {
  const match = SECTION_PREFIXES.find(
    ({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return match ? match.id : null;
}

const SECTION_LABEL: Record<SectionId, string> = {
  home: "Home",
  study: "Study",
  notes: "Notes",
  assignments: "Assignments",
  profile: "Profile",
};

/** Turns "/time-table" into "Time table" for pages that are not built yet. */
export function titleFromPath(pathname: string): string {
  const first = pathname.split("/").filter(Boolean)[0] ?? "";
  let decoded = first;
  try {
    decoded = decodeURIComponent(first);
  } catch {
    // malformed escape sequence in the URL: show the raw segment instead
  }
  const words = decoded.replace(/[-_]+/g, " ").trim();
  if (!words) return "Weave";
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Pill label: "Home · Today", "Study · Sem 5", "Notes". */
export function pillLabel(pathname: string, student: ShellStudent): string {
  const id = sectionFromPath(pathname);
  if (id === "home") return "Home · Today";
  if (id === "study") return `Study · Sem ${student.semester}`;
  if (id) return SECTION_LABEL[id];
  return titleFromPath(pathname);
}
