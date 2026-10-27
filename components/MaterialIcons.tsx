import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const base = { width: 32, height: 32, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

const Cement = (p: P) => <svg {...base} {...p}><path d="M6.5 7h11l1.500 13h-14z" /><path d="M6.500 7C7.500 4.500 9.500 3.500 12 3.500s4.500 1 5.500 3.500" /><path d="M9 12.500h6M9.500 15.500h5" /></svg>;
const Steel = (p: P) => <svg {...base} {...p}><path d="M4 16 16 4M8 20 20 8" /><path d="M7 13l2 2M10 10l2 2M12.500 15.500l2 2M13 7.500l2 2" /></svg>;
const Roof = (p: P) => <svg {...base} {...p}><path d="M4 18 8 6h12l-4 12z" /><path d="M10 6 6.500 18M14 6l-3.500 12M18 6l-3.500 12" /></svg>;
const Pipe = (p: P) => <svg {...base} {...p}><rect x="5" y="8" width="14" height="8" rx="1" /><path d="M3 7v10M21 7v10M9 8v8M15 8v8" /></svg>;
const Cable = (p: P) => <svg {...base} {...p}><circle cx="11" cy="11" r="7.500" /><circle cx="11" cy="11" r="2.500" /><path d="M11 3.500v4M11 14.500v4M3.500 11h4M14.500 11h4" /><path d="M17 17c2 0 4 1 4 4" /></svg>;
const Door = (p: P) => <svg {...base} {...p}><path d="M6 21V3h12v18M4 21h16" /><path d="M9 6.500h6v4.500H9zM9 14h6v4H9z" /><circle cx="16.200" cy="12.500" r=".7" fill="currentColor" /></svg>;
const Paint = (p: P) => <svg {...base} {...p}><path d="M5 9h14l-1.500 11h-11z" /><path d="M5 9c0-2 3-3 7-3s7 1 7 3" /><path d="M5.500 8C6 3.500 18 3.500 18.500 8" /><path d="M10 13v3M14 13v2" /></svg>;
const Tiles = (p: P) => <svg {...base} {...p}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>;
const Sanitary = (p: P) => <svg {...base} {...p}><path d="M7 3h10v6H7z" /><path d="M4 11h16c0 4-3 7-6 7h-4c-3 0-6-3-6-7z" /><path d="m9 18-1 3h8l-1-3" /><path d="M15 5.500h.01" strokeWidth="2.500" /></svg>;
const Tools = (p: P) => <svg {...base} {...p}><path d="M3 9h18v11H3z" /><path d="M9 9V6h6v3M3 14h18" /><path d="M11 12.500h2v3h-2z" /></svg>;
const Box = (p: P) => <svg {...base} {...p}><path d="m12 3 8 4v10l-8 4-8-4V7z" /><path d="m4 7 8 4 8-4M12 11v10" /></svg>;

/** Picks an icon from the material's name, so new catalogue items still get a sensible icon. */
export function materialIcon(name: string): (p: P) => React.ReactElement {
  const n = name.toLowerCase();
  if (/cement|sand|gravel|block/.test(n)) return Cement;
  if (/steel|rod|rebar|nail|wire/.test(n)) return Steel;
  if (/roof|sheet|zinc|aluminium/.test(n)) return Roof;
  if (/pipe|pvc|plumb|tap/.test(n)) return Pipe;
  if (/cable|electric|socket|switch|bulb/.test(n)) return Cable;
  if (/door|window|lock|gate/.test(n)) return Door;
  if (/paint|primer|varnish/.test(n)) return Paint;
  if (/tile|floor|ceramic/.test(n)) return Tiles;
  if (/sanitary|toilet|basin|sink|shower/.test(n)) return Sanitary;
  if (/tool|hammer|drill|kit/.test(n)) return Tools;
  return Box;
}
