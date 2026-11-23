# Design system

> **Status: waiting for references.** This file is filled from `design/references/` in Phase 1.
> Until then, no screen work starts.

## How this file gets filled
1. The user adds references to `design/references/` and indexes them in `design/README.md`.
2. A top-tier worker (Gemini Argon) extracts measurements into the tables below; the orchestrator checks them against the images.
3. Tokens go into `app/globals.css` and `components/motion/tokens.ts`; components are built on the `/lab` page.
4. The user approves `/lab` (mobile + desktop) before any screen is built.

## Tokens
### Color
| Token | Value | Use |
|---|---|---|
| `--background` | | Page |
| `--foreground` | | Main text |
| `--muted` / `--muted-foreground` | | Secondary surfaces / text |
| `--border` | | Lines, grid |
| `--accent` | | Highlights, primary action |
| `--status-none` / `--status-low` / `--status-progress` / `--status-mastered` | | Progress bands |
| `--destructive` | | Errors |

### Typography
| Token | Family | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display` | | | | | Hero numbers / titles |
| `h1` … `h3` | | | | | |
| `body` | | | | | |
| `label` / `mono` | | | | | Labels, metadata |

### Spacing, radius, borders, shadows
| Token | Value |
|---|---|
| Spacing scale | |
| Radius | |
| Border width | |
| Shadows / blur | |
| Grid (mobile / desktop columns, gutters, margins) | |

### Motion
| Token | Value | Use |
|---|---|---|
| `duration.fast / base / slow` | | |
| `ease.out / inOut / emphasized` | | |
| `spring.snappy / soft` | | |
| Page transition | | |

## Components (built on `/lab`)
Button · IconButton · Card · StatCard · ProgressRing · ProgressBar · Badge/StatusChip · Countdown · Tabs ·
Sheet (bottom on mobile, side on desktop) · Dialog · Toast · Skeleton · EmptyState · ErrorState ·
TopBar (desktop) · BottomTabBar (mobile: Home · Subjects · Assignments · Profile) · SemesterSwitcher · SearchBox · Avatar · InstallPrompt

## Screen inventory (references needed)
| Screen | Mobile ref | Desktop ref | Status |
|---|---|---|---|
| Landing / install | | | |
| Login + onboarding | | | |
| Home | | | |
| Subjects / Subject / Unit | | | |
| Topic + note editor | | | |
| Assignments list / detail | | | |
| Profile (+ notification settings) | | | |
| Offline page | | | |
