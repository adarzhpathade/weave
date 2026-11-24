import { ImageResponse } from "next/og";
import { AppIconArt } from "@/components/pwa/AppIconArt";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS rounds the corners itself, so the lime fills the full square.
export default function AppleIcon() {
  return new ImageResponse(<AppIconArt size={size.width} shape="bleed" markScale={0.62} />, size);
}
