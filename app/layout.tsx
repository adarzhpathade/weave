import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts are added in Phase 1 via next/font/local (files in public/fonts/).
export const metadata: Metadata = {
  title: { default: "Weave", template: "%s · Weave" },
  description: "Weave connects your syllabus, your notes and your deadlines into one fabric.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
