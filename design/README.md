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
| _(empty — waiting for the user's references)_ | | |
