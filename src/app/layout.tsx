import type { Metadata } from "next";
import localFont from "next/font/local";
import { SiteShell } from "@/components/layout/site-shell";
import { site } from "@/config/site";
import "./globals.css";

const bodyFont = localFont({
  src: [
    { path: "./fonts/dm-sans-400.ttf", weight: "400" },
    { path: "./fonts/dm-sans-500.ttf", weight: "500" },
    { path: "./fonts/dm-sans-600.ttf", weight: "600" },
    { path: "./fonts/dm-sans-700.ttf", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
});

const headingFont = localFont({
  src: [
    { path: "./fonts/manrope-400.ttf", weight: "400" },
    { path: "./fonts/manrope-600.ttf", weight: "600" },
    { path: "./fonts/manrope-700.ttf", weight: "700" },
    { path: "./fonts/manrope-800.ttf", weight: "800" },
  ],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `${site.name} | Cleaning Services Across Australia`, template: `%s | ${site.name}` },
  description: site.description,
  icons: { icon: "/brand/ice-logo.png", apple: "/brand/ice-logo.png" },
  // Phase 1 is a development foundation, not approved production content.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-AU"
      className={`${bodyFont.variable} ${headingFont.variable}`}
    >
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
