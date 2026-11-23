"use client";

import type { Ref } from "react";
import { SearchIcon } from "@/components/ui/icons";

type NavPillProps = {
  where: string;
  mode: "closed" | "menu" | "notifications";
  menuButtonRef: Ref<HTMLButtonElement>;
  onMenuButton: () => void;
  controls: string;
};

// Kit .navpill: night pill with the current place, a search button and the lime Menu / Close button.
export function NavPill({ where, mode, menuButtonRef, onMenuButton, controls }: NavPillProps) {
  const open = mode !== "closed";
  const buttonLabel = mode === "notifications" ? "Close notifications" : mode === "menu" ? "Close menu" : "Open menu";

  return (
    <div className="flex h-15 items-center gap-1.5 rounded-pill bg-night py-1.5 pr-1.5 pl-4.5 text-on-night shadow-float">
      <span
        className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden text-small font-bold text-ellipsis whitespace-nowrap before:size-2 before:flex-none before:rounded-full before:bg-lime"
      >
        <span className="truncate">{where}</span>
      </span>
      <button
        type="button"
        aria-label="Search, coming soon"
        aria-disabled="true"
        className="inline-flex size-12 flex-none items-center justify-center rounded-pill bg-night-line text-on-night transition-transform duration-fast ease-out active:scale-94"
      >
        <SearchIcon className="size-4.5" />
      </button>
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuButton}
        aria-expanded={open}
        aria-controls={controls}
        aria-label={buttonLabel}
        className="inline-flex h-12 flex-none items-center justify-center gap-2.25 rounded-pill bg-lime pr-4.5 pl-4 text-small font-extrabold text-on-lime transition-transform duration-fast ease-out active:scale-94"
      >
        <span aria-hidden="true" className="relative h-2.5 w-4">
          <span
            className={`absolute inset-x-0 h-0.5 rounded-xs bg-current transition-[transform,top] duration-base ease-spring ${
              open ? "top-1 rotate-45" : "top-0"
            }`}
          />
          <span
            className={`absolute inset-x-0 h-0.5 rounded-xs bg-current transition-[transform,bottom] duration-base ease-spring ${
              open ? "bottom-1 -rotate-45" : "bottom-0"
            }`}
          />
        </span>
        <span aria-hidden="true">{open ? "Close" : "Menu"}</span>
      </button>
    </div>
  );
}
