import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Urbanist } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { BRAND } from "@/components/pwa/brand";
import "./globals.css";

const urbanist = Urbanist({
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-urbanist",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: { default: "Weave", template: "%s · Weave" },
  description: "Weave connects your syllabus, your notes and your deadlines into one fabric.",
  applicationName: "Weave",
  appleWebApp: { capable: true, title: "Weave", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BRAND.app },
    { media: "(prefers-color-scheme: dark)", color: BRAND.night },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${urbanist.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
