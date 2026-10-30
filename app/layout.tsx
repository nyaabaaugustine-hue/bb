import "./globals.css"; import type { Metadata, Viewport } from "next"; import { DM_Sans, Libre_Baskerville } from "next/font/google";
import ResourceHints from "@/components/ResourceHints";
import { cld, IMG, logoIconUrl } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const serif = Libre_Baskerville({ subsets: ["latin"], weight: ["700"], variable: "--font-serif", display: "swap" });
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: logoIconUrl(64), shortcut: logoIconUrl(64), apple: logoIconUrl(180) },
  title: { default: "B B Homes", template: "%s · B B Homes" },
  description: "A home is a human right, we build it. Rent, buy land, build, buy a house and invest with B B Homes.",
  openGraph: { type: "website", siteName: "B B Homes", locale: "en_GH", images: [{ url: cld(IMG.hero, 1200), width: 1200, height: 630, alt: "A modern B B Homes house in Ghana" }] },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = { themeColor: "#f5f0e4", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
    {/* suppressHydrationWarning: browser extensions (ClickUp, Grammarly, etc.) inject attributes into <body> before React loads, which is not a real mismatch. */}
    <body suppressHydrationWarning>
      <noscript><style>{`.reveal{opacity:1;transform:none}`}</style></noscript>
      <ResourceHints />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sand">Skip to content</a>
      {children}
    </body></html>);
}
