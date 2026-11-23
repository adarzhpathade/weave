import { BRAND } from "./brand";

type AppIconArtProps = {
  size: number;
  /** "rounded": lime rounded square on transparent. "bleed": lime fills the whole canvas (maskable, Apple). */
  shape: "rounded" | "bleed";
  /** Mark width as a share of the canvas. Maskable icons keep it inside the 80% safe zone. */
  markScale: number;
};

// The kit's #i-weave symbol (24x24 viewBox), drawn in black on lime. Used only inside ImageResponse.
export function AppIconArt({ size, shape, markScale }: AppIconArtProps) {
  const mark = Math.round(size * markScale);
  const radius = shape === "rounded" ? Math.round(size * 0.22) : 0;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND.lime,
        borderRadius: radius,
      }}
    >
      <svg width={mark} height={mark} viewBox="0 0 24 24" fill="none">
        <path
          d="M3 8c3 0 3 8 6 8s3-8 6-8 3 8 6 8M3 16c3 0 3-8 6-8s3 8 6 8 3-8 6-8"
          stroke={BRAND.night}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
