import type { SVGProps } from "react";
import type { Kind } from "@/lib/data";

const base = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
type P = SVGProps<SVGSVGElement>;

export const Home = (p: P) => <svg {...base} {...p}><path d="M3 11 12 3l9 8" /><path d="M5 10v10h14V10" /><path d="M10 20v-6h4v6" /></svg>;
export const Key = (p: P) => <svg {...base} {...p}><circle cx="8" cy="15" r="4" /><path d="m11 12 9-9M16 7l3 3" /></svg>;
export const Land = (p: P) => <svg {...base} {...p}><path d="M3 19 9 7l4 8 3-5 5 9z" /></svg>;
export const Crane = (p: P) => <svg {...base} {...p}><path d="M4 21V8l8-5v18M12 8h9M18 8v5" /><circle cx="18" cy="15" r="1.5" /></svg>;
export const Trend = (p: P) => <svg {...base} {...p}><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></svg>;
export const Wrench = (p: P) => <svg {...base} {...p}><path d="M14.7 6.3a4 4 0 0 0 5 5L21 12.6 12.6 21a2.1 2.1 0 0 1-3-3L18 9.7" /><path d="M9.5 9.5 3 3" /></svg>;
export const Pin = (p: P) => <svg {...base} {...p}><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" /><circle cx="12" cy="10" r="2.5" /></svg>;
export const Check = (p: P) => <svg {...base} {...p}><path d="m5 12 5 5L20 7" /></svg>;
export const Arrow = (p: P) => <svg {...base} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const Menu = (p: P) => <svg {...base} {...p}><path d="M4 7h16M4 12h16M4 17h16" /></svg>;
export const Close = (p: P) => <svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>;
export const Chat = (p: P) => <svg {...base} {...p}><path d="M21 12a8 8 0 0 1-11.7 7L4 20l1.1-4.6A8 8 0 1 1 21 12Z" /></svg>;
export const Shield = (p: P) => <svg {...base} {...p}><path d="M12 3 4 6v6c0 5 3.4 8 8 9 4.6-1 8-4 8-9V6l-8-3Z" /><path d="m9 12 2 2 4-4" /></svg>;

/** Official WhatsApp glyph (filled). Colour it with `text-*` or place it on the green brand background. */
export const WhatsApp = (p: P) => <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...p}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>;
export const Phone = (p: P) => <svg {...base} {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
export const Users = (p: P) => <svg {...base} {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.5-3.5 3-5.5 6.5-5.5s6 2 6.5 5.5" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c2 .6 3.2 2.3 3.5 5.2" /></svg>;
export const Doc = (p: P) => <svg {...base} {...p}><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 13h7M9 17h7" /></svg>;

/** Gmail glyph in its brand colours (does not follow text colour). */
export const Gmail = (p: P) => <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden {...p}><path fill="#4285F4" d="M2 7.2v10.3C2 18.3 2.7 19 3.5 19h3v-8.2L2 7.2Z" /><path fill="#34A853" d="M17.5 19h3c.8 0 1.5-.7 1.5-1.5V7.2l-4.5 3.6V19Z" /><path fill="#FBBC04" d="M17.5 5.5v5.3L22 7.2V6c0-1.7-1.9-2.7-3.3-1.7l-1.200 1.200Z" /><path fill="#EA4335" d="M6.5 10.8V5.5L12 9.7l5.500-4.200v5.300L12 15l-5.500-4.200Z" /><path fill="#C5221F" d="M2 6v1.200l4.500 3.600V5.500L5.300 4.300C3.900 3.300 2 4.300 2 6Z" /></svg>;

export const KIND_ICON: Record<Kind, (p: P) => React.ReactElement> = { rent: Key, house: Home, land: Land, offplan: Crane, build: Crane, invest: Trend };

export const KIND_BADGE: Record<Kind, string> = { rent: "badge-moss", house: "badge-terra", land: "badge-sand", offplan: "badge-terra", build: "badge-sand", invest: "badge-moss" };
