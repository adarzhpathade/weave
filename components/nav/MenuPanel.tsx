"use client";

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode, type Ref } from "react";
import { useFormStatus } from "react-dom";
import { ArrowIcon, LockIcon } from "@/components/ui/icons";
import { MENU, type MenuItem, type MenuSub, type SectionId } from "./sections";
import type { ShellStudent } from "./types";

const SEMESTERS = [3, 4, 5, 6, 7, 8];

type MenuPanelProps = {
  id: string;
  open: boolean;
  here: SectionId | null;
  student: ShellStudent;
  origin: CSSProperties;
  panelRef: Ref<HTMLDivElement>;
  onNavigate: () => void;
  signOutAction: () => Promise<void>;
};

function step(n: number): CSSProperties {
  return { "--n": n } as CSSProperties;
}

// Kit .mpanel: full-screen night panel revealed as a circle from the pill's Menu button.
export function MenuPanel({ id, open, here, student, origin, panelRef, onNavigate, signOutAction }: MenuPanelProps) {
  const [expanded, setExpanded] = useState<SectionId | null>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Each time the menu opens it starts collapsed (reset while it is still invisible).
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setExpanded(null);
  }

  return (
    <div
      ref={panelRef}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!open}
      style={origin}
      className={`fixed inset-0 z-40 flex flex-col overflow-hidden bg-night px-5 pt-panel pb-panel text-on-night ${
        open ? "reveal-panel-open" : "reveal-panel"
      }`}
    >
      <div className="mx-auto flex w-full max-w-column flex-1 flex-col gap-3.5">
        <div className={`flex items-center justify-between gap-2.5 ${open ? "animate-lift" : ""}`}>
          <span className="font-mono text-label tracking-label uppercase opacity-55">Semester</span>
          <ul className="flex flex-wrap gap-1.5" aria-label={`Semesters, current is ${student.semester}`}>
            {SEMESTERS.map((sem) => (
              <SemesterDot key={sem} sem={sem} current={student.semester} />
            ))}
          </ul>
        </div>

        <div className="min-h-10 flex-1" aria-hidden="true" />

        <ul className="grid">
          {MENU.map((item, index) => (
            <MenuRow
              key={item.id}
              item={item}
              index={index}
              open={open}
              here={here === item.id}
              expanded={expanded === item.id}
              dimmed={expanded !== null && expanded !== item.id}
              student={student}
              onToggle={() => setExpanded((cur) => (cur === item.id ? null : item.id))}
              onNavigate={onNavigate}
              signOutAction={signOutAction}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

// Semester switcher (visual only for now): past + current are open, future ones are locked.
function SemesterDot({ sem, current }: { sem: number; current: number }) {
  const base = "grid size-8.5 place-items-center rounded-full border text-field-label font-extrabold";
  if (sem > current) {
    return (
      <li className={`${base} border-night-line opacity-30`} aria-label={`Semester ${sem}, locked`}>
        <LockIcon className="size-3" />
      </li>
    );
  }
  if (sem === current) {
    return (
      <li className={`${base} border-lime bg-lime text-on-lime`} aria-current="true" aria-label={`Semester ${sem}, current`}>
        {sem}
      </li>
    );
  }
  return (
    <li className={`${base} border-night-line`} aria-label={`Semester ${sem}`}>
      {sem}
    </li>
  );
}

type MenuRowProps = {
  item: MenuItem;
  index: number;
  open: boolean;
  here: boolean;
  expanded: boolean;
  dimmed: boolean;
  student: ShellStudent;
  onToggle: () => void;
  onNavigate: () => void;
  signOutAction: () => Promise<void>;
};

function MenuRow({ item, index, open, here, expanded, dimmed, student, onToggle, onNavigate, signOutAction }: MenuRowProps) {
  const subId = `menu-sub-${item.id}`;
  const headClass = `grid w-full grid-cols-menu-head items-center gap-2 py-1.75 text-left transition-opacity duration-base ${
    dimmed ? "opacity-35" : ""
  }`;
  const headInner = (
    <>
      <span className="font-mono text-mono opacity-50">{`0${index + 1}`}</span>
      <span className={`font-display text-menu font-black tracking-display ${here ? "dot-after" : ""}`}>{item.word}</span>
      <span className="text-right font-mono text-mono opacity-60">{item.meta(student)}</span>
    </>
  );

  return (
    <li style={step(index)} className={`border-t border-night-line last:border-b ${open ? "animate-lift delay-menu" : ""}`}>
      {item.href ? (
        <Link href={item.href} onClick={onNavigate} aria-current={here ? "page" : undefined} className={headClass}>
          {headInner}
        </Link>
      ) : (
        <button type="button" onClick={onToggle} aria-expanded={expanded} aria-controls={subId} className={headClass}>
          {headInner}
        </button>
      )}

      {item.subs ? (
        <div id={subId} inert={!expanded} className={`rows-collapse ${expanded ? "rows-expand" : ""}`}>
          <div className={`grid min-h-0 overflow-hidden pl-menu-sub ${expanded ? "pb-3" : ""}`}>
            {item.subs.map((sub, i) => (
              <SubRow
                key={sub.label}
                sub={sub}
                n={i}
                animate={expanded}
                onNavigate={onNavigate}
                signOutAction={signOutAction}
              />
            ))}
          </div>
        </div>
      ) : null}
    </li>
  );
}

const SUB_CLASS =
  "group flex min-h-10 w-full items-center justify-between gap-2.5 border-b border-night-line pr-0.5 text-left text-lead font-bold text-on-night last:border-b-0";

function SubArrow() {
  return (
    <ArrowIcon className="size-4 opacity-45 transition duration-fast ease-out group-hover:translate-x-1 group-hover:opacity-100 group-focus-visible:translate-x-1 group-focus-visible:opacity-100" />
  );
}

type SubRowProps = {
  sub: MenuSub;
  n: number;
  animate: boolean;
  onNavigate: () => void;
  signOutAction: () => Promise<void>;
};

function SubRow({ sub, n, animate, onNavigate, signOutAction }: SubRowProps) {
  const motion = animate ? "animate-lift-quick delay-sub" : "";

  if (sub.kind === "later") {
    return (
      <div style={step(n)} className={`${SUB_CLASS} opacity-40 ${motion}`}>
        <span>{sub.label}</span>
        <em className="font-mono text-mono-2xs tracking-label not-italic uppercase">later</em>
      </div>
    );
  }

  if (sub.kind === "signout") {
    // A form action lets Next handle the server action's redirect after sign-out.
    return (
      <form action={signOutAction} className="contents">
        <SignOutButton label={sub.label} className={`${SUB_CLASS} ${motion}`} style={step(n)}>
          <SubArrow />
        </SignOutButton>
      </form>
    );
  }

  return (
    <Link href={sub.href} onClick={onNavigate} style={step(n)} className={`${SUB_CLASS} ${motion}`}>
      <span>{sub.label}</span>
      <SubArrow />
    </Link>
  );
}

function SignOutButton({
  label,
  className,
  style,
  children,
}: {
  label: string;
  className: string;
  style: CSSProperties;
  children: ReactNode;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} aria-busy={pending} style={style} className={`${className} disabled:opacity-60`}>
      <span>{pending ? "Signing out…" : label}</span>
      {children}
    </button>
  );
}
