# Design system

> **Status: active.** Design source of truth is `design/ui-kit/index.html` (reference images stay local-only).
> Tokens live in `app/globals.css` and `components/motion/tokens.ts`. The tables below are a summary; if they differ, `app/globals.css` wins.

## Design source of truth and rules
The design source of truth is `design/ui-kit/index.html`.

### User style rules
- **No dot-matrix numbers:** Big numbers and countdowns use Urbanist 800 with tabular figures, tight tracking and light-weight colons (never dot-matrix / Doto).
- **Two-tone titles:** Titles use ink + grey word (e.g. `Good morning, Aarav`), never an italic or coloured second word.
- **No playful shapes:** Clean geometry only; no playful stickers, badges or starburst shapes.
- **No cards on Home:** Home sections are divided by 1px hairlines with generous spacing, not cards.
- **Navigation:** Floating menu pill that opens a full-screen menu, plus a bell icon next to the avatar opening the notifications panel. No bottom tab bar; no sidebar.
- **Notifications:** Teacher announcements, marks and deadline reminders appear in the bell panel (no separate announcements page).

## Tokens
### Color
| Token | Value | Use |
|---|---|---|
| `--c-bg` | `#ECECE8` | Outer page background |
| `--c-app` | `#F4F4F1` | App background |
| `--c-surface` | `#FFFFFF` | Cards, elevated surfaces |
| `--c-ink` | `#0B0B0C` | Main text / dark ink |
| `--c-muted` | `#6E6E73` | Secondary text |
| `--c-line` | `#D8D8D3` | Lines, hairlines, grid |
| `--c-lime` | `#62E04E` | Submitted status, covered topics |
| `--c-late` | `#FFB21E` | Late status |
| `--c-missing` | `#FF4F3A` | Not submitted / errors |
| `--c-accent` | `#6D6AF4` | Periwinkle highlight |
| `--c-sub-1` … `6` | Pastels | Subject stack cards |

### Typography
| Token | Family | Size / line-height | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display` | Urbanist | 44px–64px | 800–900 | -0.03em | Hero numbers / titles |
| `h1` … `h3` | Urbanist | 20px–32px | 700–800 | -0.02em | Section headings |
| `body` | Urbanist | 15px / 1.5 | 500 | normal | Main reading text |
| `label` / `mono` | JetBrains Mono | 11px–13px | 500–600 | normal | Labels, metadata, codes |

### Spacing, radius, borders, shadows
| Token | Value |
|---|---|
| Spacing scale | 4px, 8px, 12px, 16px, 24px, 32px |
| Radius | `--r-xs`: 8px, `--r-sm`: 14px, `--r-md`: 22px, `--r-lg`: 30px, `--r-pill`: 999px |
| Border width | 1px hairline (`--c-line`), 1.5px field stroke (`--stroke-field`) |
| Shadows / blur | `--shadow-lift`, `--shadow-sheet` |
| Grid (mobile / desktop columns, gutters, margins) | Mobile 360–430px (single column, 12px gutter); Desktop 1280/1440px (centered column `--w-column: 720px`) |

### Motion
| Token | Value | Use |
|---|---|---|
| `duration` | `--d-fast`: 140ms, `--d-base`: 260ms, `--d-slow`: 520ms, `--d-rise`: 760ms | Standard UI timings |
| `easing` | `--e-out`: cubic-bezier(0.2, 0.8, 0.2, 1), `--e-spring`: cubic-bezier(0.34, 1.4, 0.5, 1) | Smooth deceleration, snappy spring |
| `stagger` | `--d-stagger`: 90ms, `--d-list-step`: 60ms | Staggered item entrance |
| Page transition | Entrance rise out of mask, stagger fade up | Full screen transitions |

## Components
Button · IconButton · Card · SubjectCard · ProgressBar · Badge/StatusChip · Countdown ·
Sheet (bottom on mobile, centered dialog on desktop) · Dialog · Toast · Skeleton · EmptyState · ErrorState ·
FloatingMenuPill (opens full-screen menu) · NotificationsBell (opens notifications panel) · SemesterSwitcher · SearchBox · Avatar · InstallPrompt

## Screen inventory
| Screen | Source / Reference | Status |
|---|---|---|
| Login | `design/ui-kit/index.html` | Built (forced dark) |
| Home | `design/ui-kit/index.html` | Built (Today view, hairlines) |
| Subjects / Subject / Unit / Topic | `design/ui-kit/index.html` | Built (stacked pastel cards) |
| Notes list & editor | `design/ui-kit/index.html` | Built (markdown editor, topic/note links, backlinks) |
| Assignments list / detail | `design/ui-kit/index.html` | Built (list, cal, sheet) |
| Profile (+ notification settings) | `design/ui-kit/index.html` | Built (account rows, switches) |
| Graph | `design/ui-kit/index.html` | Built (SVG syllabus tree with notes as diamonds) |
| Offline page | `design/ui-kit/index.html` | Built |
