---
branch: docs/ui-kit-v2
base: origin/docs/ui-kit-v0
model: gemini-4-argon-high
files_allowed: design/ui-kit/index.html
subagents: not-allowed
shell: no
---

# ui-kit-v2 — Awwwards-level restyle + full-screen menu

## Goal
The user's verdict on v0.1 (`design/ui-kit/index.html`): **"looks like a generic app, not an Awwwards-level app."**
Rewrite the kit so it feels like an award-winning editorial product, not a template. It is shown to the user's teacher tomorrow.
Keep it ONE self-contained HTML file (same page contract as now: starts with `<title>` + the `claude:viewport-fit-sides` meta,
no doctype/html/head/body tags, Google Fonts only, all JS inline, no other external scripts).

## References (read every image)
Exact files in design/references/ (names contain spaces and brackets; open them by full path, do not search):
- `design/references/(1) Instagram.jpg`
- `design/references/.gitkeep`
- `design/references/Arcade hub.jpg`
- `design/references/Digital Museum concept by Lay on Dribbble.jpg`
- `design/references/download (7).jpg`
- `design/references/download (8).jpg`
- `design/references/download (9).jpg`
- `design/references/Pocket Cal.jpg`
- `design/references/Slava Kornilov - Creative Director in Los Angeles, CA, USA (1).jpg`
- `design/references/Slava Kornilov - Creative Director in Los Angeles, CA, USA.jpg`

What to take from each:
- `design/references/Digital Museum concept by Lay on Dribbble.jpg` — **the main direction.** Black dominant, huge geometric bold type mixed with light italic, one acid lime, hairline rules, stat pairs, rotating circular badge, outline pill "OPEN NOW".
- `design/references/Arcade hub.jpg` — mono uppercase labels, playful bold color shapes on paper.
- `design/references/Slava Kornilov*.jpg`, `design/references/(1) Instagram.jpg` — tick-dial gauges, stacked deck cards, dark UI.
- `design/references/download (9).jpg` — stacked cards + huge one-word heading. `download (7).jpg`, `download (8).jpg` — bottom sheets. `Pocket Cal.jpg` — calendar grid + chips with counts.

## Why v0.1 looks generic (fix all of these)
- White rounded cards on a light grey page = every dashboard template. → Remove most "card boxes". Use **full-bleed color blocks, hairline 1px rules and a visible grid** instead.
- Soft pastels = generic. → **Fewer, bolder colors used in big areas.**
- Type is too polite. → Type IS the layout: oversized words and numbers (60–140 px on phone), tight tracking (-0.04 to -0.06em), bold + light italic in the same line, words allowed to crop at the screen edge.
- No texture, no editorial details. → Add index numbers (01 / 02 / 03), mono metadata lines, a subtle film-grain overlay (SVG feTurbulence, ~4% opacity), a scrolling marquee ticker (e.g. "3 DUE THIS WEEK ✦ CN ASSIGNMENT 3 ✦ ...").

## Color direction (decide it, then show 3 palette presets with a switcher)
**Dark-first.** Default is the black "night" look; light mode is a warm paper version, not plain white.
- Default preset **"Acid"**: near-black ink, bone/off-white text, acid lime as THE accent, one secondary (electric blue OR hot coral — pick what works with lime).
- Preset **"Ultraviolet"**: same system with a deep violet/periwinkle accent (the user is unsure about purple, so it is an option, not the default).
- Preset **"Ember"**: orange/red accent.
- Subject colors: 4–6 saturated colors that work as full-bleed blocks with black text (no washed pastels).
- Status (Pending / Submitted / Late / Not submitted) must still read as word + color.
- All colors as CSS custom properties on `:root`; presets swap only variables (`[data-palette]`). Light/dark via `prefers-color-scheme` guarded by `:root:not([data-theme="light"])` and `:root[data-theme="dark"]`, plus a manual Auto/Light/Dark switch. `body` has an explicit background.
- Fonts: keep **Urbanist** (display + body, 300 italic + 800/900) and **JetBrains Mono** (labels). You may add ONE display face from Google Fonts if it clearly lifts the look (e.g. a condensed grotesk for giant numbers). **No dot-matrix fonts** (user rejected them).

## Navigation — replace the bottom tab bar (user decision)
The app will grow to many pages, so: **floating pill + full-screen menu**.
- Closed: a small black pill floating at the bottom of each phone screen: current page name (e.g. "Subjects · Sem 5"), a search button, a menu button.
- Open: the pill **morphs/grows into a full-screen menu** (spring). Main items in huge type, one per line, with an index number and a count on the right: `01 Home`, `02 Study 4`, `03 Assignments 3 due`, `04 Profile`.
- Tapping a main item **unfolds its sub-items** below it (smaller type); the other items dim.
  - Study → Subjects, Notes, Materials, and greyed "Graph · later", "Quizzes · later", "AI tutor · later"
  - Assignments → Pending, Calendar, Marked
  - Profile → My details, Electives, Notifications, Install app
- Semester switcher row at the top of the menu: 3 · 4 · **5** · 6 · 7 · 8 (future ones shown locked).
- Close with ✕ or Esc; focus moves into the menu and back to the button; `aria-expanded` on the button.
- Inside a section, sub-pages show as chips at the top of the screen (e.g. Assignments: Pending / Calendar / Marked).
- Include one extra phone frame showing the menu **open** with Study expanded, and make the menu button on every phone actually open it (inside that phone frame).
- Desktop version: show the same menu as a top-bar drop-down in the components section.

## Page structure (keep the content, restyle everything)
1. Hero (full-viewport black, giant type, marquee, palette + theme switchers).
2. Foundations: color (show palettes as big full-bleed blocks, not small swatches), type scale, tokens (radius, spacing, motion).
3. Components: buttons, chips, status, tick dial, bars, live countdown (big bold numbers, NOT dot matrix), stat pairs, rotating badge, inputs/switches, skeleton/empty/error, floating pill + menu, toast.
4. Screens (390 px phone frames, real data — reuse the CSIT sem 5 data already in the file): Login, Home, Subjects (stacked full-bleed color cards that expand on tap), Subject → units → topics, Assignments (list / calendar), Assignment detail bottom sheet, **Menu open**.
5. Motion section: short list of the motion rules.

## Motion (vanilla CSS + Web Animations API, no libraries)
- Headline reveal: words slide up from a mask, staggered, on load and on scroll into view (IntersectionObserver).
- Pill → menu morph, menu items stagger in, sub-items unfold (height/clip + opacity).
- Subject stack expand on tap (spring easing), sheet springs up, dial fills tick by tick, press scale 0.96, marquee loop.
- Animate only transform / opacity / clip-path. Everything wrapped so `prefers-reduced-motion: reduce` shows final states instantly and stops the marquee and badge.
- **Content must be visible at rest** — never leave anything at opacity 0 if JS fails or the observer does not fire (add the hidden state from JS, or use animations with `both` that start only when a class is added).

## Hard rules
- No horizontal scroll at 390 px and at 1280 px (watch the giant type and the marquee: `overflow: clip` on their containers).
- Outer wrapper side padding `max(16px, env(safe-area-inset-left/right))`.
- Keyboard focus visible; buttons are `<button>`; text contrast ≥ 4.5:1 for body text in all palettes and both themes.
- Any `localStorage` access in try/catch.
- Keep file size reasonable (< 150 KB). No images; shapes and art in CSS/SVG/canvas only.
- Edit only `design/ui-kit/index.html`.

## Important
Do everything yourself in this one run. Do NOT launch subagents or background tasks: the run ends when you stop replying, and unfinished helpers are lost.

## Steps
1. Read AGENTS.md §5 and §8, then every reference image; write down in REPORT.md what you take from each.
2. Rewrite `design/ui-kit/index.html` per the sections above.
3. Re-read the whole file once for: broken JS (unclosed braces, missing elements referenced by querySelector), overflow risks, reduced-motion coverage.
4. Write REPORT.md (include the final palette values and why), print TASK COMPLETE.

## Done when
- [ ] Clearly not generic: dark-first, giant type, full-bleed color, rules/grid, grain, marquee
- [ ] 3 palettes + Auto/Light/Dark switch work
- [ ] Floating pill + full-screen menu with sub-items works in every phone; "menu open" phone frame exists
- [ ] 7 phone screens at 390 px, real CSIT data
- [ ] Reduced motion, focus, no horizontal scroll, content visible at rest
