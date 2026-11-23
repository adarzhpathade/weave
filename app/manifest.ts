import type { MetadataRoute } from "next";
import { BRAND, ICON_SIZES } from "@/components/pwa/brand";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Weave",
    short_name: "Weave",
    description: "Your syllabus, notes and deadlines, woven together.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: BRAND.night,
    background_color: BRAND.night,
    icons: ICON_SIZES.map((icon) => ({
      src: `/icon/${icon.id}`,
      sizes: `${icon.width}x${icon.height}`,
      type: "image/png",
      purpose: icon.maskable ? "maskable" : "any",
    })),
  };
}
