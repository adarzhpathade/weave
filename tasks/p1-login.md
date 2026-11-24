---
branch: feat/p1-login
base: origin/docs/ui-kit-v3
model: sonnet
files_allowed: app/globals.css, app/layout.tsx, app/page.tsx, app/manifest.ts, app/icon.tsx, app/apple-icon.tsx, app/offline/**, app/(public)/**, components/**, public/sw.js
subagents: not-allowed
shell: no
---

# p1-login — Design system in code + PWA shell + Login page

## Goal
The real Next.js app gets the Weave look from the UI kit, installs as a PWA on a phone, and shows the Login page exactly like the kit.
This is page 1 of a page-by-page build; the user checks it on phone and laptop before page 2.

## Source of truth
`design/ui-kit/index.html` — open it and copy values exactly:
- the `:root` tokens (colors, light + dark, `[data-accent]` not needed: use periwinkle), type sizes, radius, durations, easings;
- the LOGIN phone (`<!-- LOGIN -->`, CSS `.login3`, `.lg-copy`, `.lg-form2`, `.wordmark`, `.screen.night`).
Read AGENTS.md §5, §6, §8, §10 first. Next.js here is v16: check `node_modules/next/dist/docs/` before using an API (manifest, icon, fonts, metadata).

## Steps
1. **Tokens** in `app/globals.css` (Tailwind 4 `@theme` + CSS variables), light and dark (`prefers-color-scheme`). Replace the shadcn placeholder colors with the kit values. Every visual value is a token.
2. **Fonts**: Urbanist (300–900 + italic 300) and JetBrains Mono (400, 500) via `next/font/google` in `app/layout.tsx` (no shell available for local files; this self-hosts at build), exposed as the font tokens.
3. **PWA**: `app/manifest.ts` (name Weave, short_name Weave, standalone, start_url `/`, theme/background from tokens, icons 192/512 + maskable), `app/icon.tsx` + `app/apple-icon.tsx` (ImageResponse: lime rounded square with the black "weave" wave mark from the kit's `#i-weave` symbol), `public/sw.js` (hand-written: precache `/` `/login` `/offline`, network-first for pages, cache-first for `/_next/static` and fonts, fall back to `/offline`), a small client component in `components/pwa/` that registers it (production only), and `app/offline/page.tsx` styled like the kit.
   Layout: `viewportFit: cover`, `themeColor` light/dark, apple-mobile-web-app meta, no tap highlight, `overscroll-behavior: none`, safe-area padding.
4. **Login** at `app/(public)/login/page.tsx`, pixel-matched to the kit LOGIN phone: black screen, `weave.` wordmark + `CSIT · RGPV`, headline "Your semester, in one place." at the bottom, one-line description, College email field, lime full-width Continue button with arrow, hint line. Safe-area aware.
   - Phone (< 768px): full screen exactly like the kit.
   - Laptop (≥ 768px): same black page, content in a centered column max 420px, vertically centered, wordmark top-left of the page.
   - Entrance motion: headline lines rise from a mask, then text, field and button fade up in a stagger (CSS only, `prefers-reduced-motion` = no motion). Content visible if JS is off.
   - Form: client-side email validation with an inline error ("Enter your college email"). Real sign-in is a later backend task: on valid submit, call a prop/handler `onContinue(email)`; for now the page passes a function that routes to `/` . Put the form in `components/auth/LoginForm.tsx` so the backend worker can wire it later without touching visuals.
5. `app/page.tsx`: redirect to `/login` for now.
6. Reusable primitives you need go in `components/ui/` (Button variants from the kit: ink, lime, outline, ghost; Input). Use `cn()` from `@/lib/utils`.
7. Write REPORT.md (include what you measured from the kit), print TASK COMPLETE.

## Done when
- [ ] Login at 390×844 matches the kit LOGIN phone (spacing, sizes, colors, type)
- [ ] Laptop 1440×900 layout looks intentional (centered column)
- [ ] Manifest + icons + service worker + offline page in place
- [ ] Light/dark tokens, reduced motion, keyboard focus visible
- [ ] No hex / arbitrary values in components, no `any`, only files_allowed touched
