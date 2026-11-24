# design/

The **source of truth for the UI**. Agents replicate what is here; they never invent a style.

```
design/
  references/   screenshots, Figma exports, screen recordings (.png .jpg .webp .mp4)
  fonts/        font files (.woff2) + licence notes
  icons/        custom icon sets / logo (svg)
```

## How to add references
Name files so agents know where they apply:

| Prefix | Meaning | Example |
|---|---|---|
| `global-` | Applies everywhere (colors, type, grid, buttons) | `global-typography.png` |
| `screen-<name>-<viewport>` | One screen at one width | `screen-dashboard-mobile.png`, `screen-dashboard-desktop.png` |
| `motion-<name>` | A video/GIF of an interaction | `motion-page-transition.mp4` |
| `component-<name>` | A single component | `component-stat-card.png` |

Add a line per file to the table below with what to copy from it (layout? colors? only the motion?).

## Reference index
| File | Copy from it | Notes |
|---|---|---|
| `Digital Museum concept by Lay on Dribbble.jpg` | **Type + color direction** (user's main pick): heavy geometric bold mixed with light italic, black / white / lime + one accent, stat pairs with hairlines, rotating circular badges, outline pill buttons | User is unsure about the purple → accent is switchable in the kit |
| `Arcade hub.jpg` | Mono uppercase labels (dot-matrix numerals tried and dropped by the user), warm off-white paper | |
| `Slava Kornilov … .jpg`, `Slava Kornilov … (1).jpg`, `(1) Instagram.jpg` (AI OS) | Tick-mark dial gauges (progress), stacked card deck, floating bottom bar with round ✕ / ✓ buttons, dark mode feel | Not the radial menu (AGENTS.md: no radial views) |
| `download (9).jpg` (Week Spend) | Stacked pastel cards with overlap → Subjects list; huge one-word headings | |
| `download (7).jpg` (Add money), `download (8).jpg` (memetime) | Bottom sheets over a dimmed screen, key–value rows, big number, black full-width button → assignment detail | |
| `Pocket Cal.jpg` | Month grid with outlined busy days, filter chips with counts → assignments calendar | |

Current UI kit: `design/ui-kit/index.html` (published privately for review).
