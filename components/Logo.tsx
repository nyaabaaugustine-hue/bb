import { logoUrl } from "@/lib/data";

/** Logo corner radius: 6% of the element's size. */
const RADIUS = "6%";

/**
 * B B Homes logo. `height` is the display height in px.
 * `plate` puts it on a light rounded backing so it stays readable on dark backgrounds.
 * `blend` multiplies a white logo background into a light page background.
 * `animate` adds a soft lift on hover (used in the header).
 */
export default function Logo({ height = 40, plate = false, blend = false, animate = false, className = "" }: { height?: number; plate?: boolean; blend?: boolean; animate?: boolean; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  const img = <img src={logoUrl(height)} alt="B B Homes" height={height} style={{ height, borderRadius: RADIUS }} className={`w-auto max-w-none object-contain ${blend ? "mix-blend-multiply" : ""} ${animate ? "transition-transform duration-300 ease-out group-hover/logo:scale-[1.04] group-hover/logo:-rotate-1" : ""}`} decoding="async" />;
  return plate
    ? <span style={{ borderRadius: RADIUS }} className={`inline-flex items-center bg-cream px-3 py-2 shadow-sm ${className}`}>{img}</span>
    : <span className={`inline-flex items-center ${className}`}>{img}</span>;
}
