// Brand colors for places that cannot read CSS variables (web manifest, generated icons, <meta theme-color>).
// Values mirror the tokens in app/globals.css (--c-lime, --c-night, --c-app). Keep them in sync.
export const BRAND = {
  lime: "#62E04E",
  night: "#0B0B0C",
  app: "#F4F4F1",
} as const;

export const ICON_SIZES = [
  { id: "192", width: 192, height: 192, maskable: false },
  { id: "512", width: 512, height: 512, maskable: false },
  { id: "maskable", width: 512, height: 512, maskable: true },
] as const;
