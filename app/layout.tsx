import "./globals.css"; import type { Metadata, Viewport } from "next"; import { DM_Sans, Libre_Baskerville } from "next/font/google";
import RootChrome from "@/components/RootChrome"; import { logoIconUrl } from "@/lib/data";
const sans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-sans", display: "swap" });
const serif = Libre_Baskerville({ subsets: ["latin"], weight: ["700"], variable: "--font-serif", display: "swap" });
export const metadata: Metadata = { icons: { icon: logoIconUrl(64), shortcut: logoIconUrl(64), apple: logoIconUrl(180) }, title: { default: "B B Homes", template: "%s · B B Homes" }, description: "A home is a human right, we build it. Rent, buy land, build, buy a house and invest with B B Homes." };
export const viewport: Viewport = { themeColor: "#f5f0e4", width: "device-width", initialScale: 1, viewportFit: "cover" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en" className={`${sans.variable} ${serif.variable}`} suppressHydrationWarning>
    {/* suppressHydrationWarning: browser extensions (ClickUp, Grammarly, etc.) inject attributes into <body> before React loads, which is not a real mismatch. */}
    <body suppressHydrationWarning><RootChrome>{children}</RootChrome></body></html>);
}
