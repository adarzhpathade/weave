import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/pwa/AppIconArt";
import { ICON_SIZES } from "@/components/pwa/brand";

// Serves /icon/192, /icon/512 and /icon/maskable (referenced by app/manifest.ts).
export function generateImageMetadata() {
  return ICON_SIZES.map((icon) => ({
    id: icon.id,
    size: { width: icon.width, height: icon.height },
    contentType: "image/png",
  }));
}

export default async function Icon({ id }: { id: Promise<string | number> }) {
  const iconId = String(await id);
  const icon = ICON_SIZES.find((entry) => entry.id === iconId) ?? ICON_SIZES[1];

  return new ImageResponse(
    (
      <AppIconArt
        size={icon.width}
        shape={icon.maskable ? "bleed" : "rounded"}
        markScale={icon.maskable ? 0.5 : 0.62}
      />
    ),
    { width: icon.width, height: icon.height },
  );
}
