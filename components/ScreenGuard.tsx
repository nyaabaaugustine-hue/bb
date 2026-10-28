"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Discourages saving and screenshotting property images.
 * A browser cannot truly block screenshots (phones and OS tools are out of its reach). This adds friction and a traceable watermark:
 *  - blocks right-click and drag on images, and Ctrl/Cmd+S and Ctrl/Cmd+P
 *  - blurs images and maps when the tab is hidden or PrintScreen is pressed
 *  - hides the page when printing
 *  - draws a faint "B B Homes" watermark over the page
 * Form fields stay fully usable.
 */
const MARK = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='200'%3E%3Ctext x='24' y='110' transform='rotate(-24 140 100)' font-family='sans-serif' font-size='17' font-weight='700' letter-spacing='2' fill='%2318261f'%3EB B HOMES%3C/text%3E%3C/svg%3E\")";

export default function ScreenGuard() {
  const [toast, setToast] = useState(""); const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const root = document.documentElement; let hold: ReturnType<typeof setTimeout>;
    const say = (m: string) => { setToast(m); clearTimeout(t.current); t.current = setTimeout(() => setToast(""), 3200); };
    const shield = (on: boolean) => root.classList.toggle("shield", on);
    const protectedEl = (e: Event) => (e.target as HTMLElement | null)?.closest?.("img, picture, iframe, [data-protect]");
    const editable = (e: Event) => (e.target as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable]");

    const onCtx = (e: MouseEvent) => { if (protectedEl(e) && !editable(e)) { e.preventDefault(); say("Images are protected. Contact us for photos and brochures."); } };
    const onDrag = (e: DragEvent) => { if (protectedEl(e)) e.preventDefault(); };
    const onKey = (e: KeyboardEvent) => {
      const k = typeof e.key === "string" ? e.key.toLowerCase() : "", mod = e.ctrlKey || e.metaKey;
      if (mod && (k === "s" || k === "p")) { e.preventDefault(); say("Saving and printing are disabled on this site."); }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== "PrintScreen") return;
      shield(true); try { navigator.clipboard.writeText(""); } catch { /* clipboard unavailable */ }
      say("Screenshots of property images are discouraged. Please contact us for photos."); clearTimeout(hold); hold = setTimeout(() => shield(false), 2500);
    };
    const onVis = () => shield(document.hidden);
    const onBlur = () => { if (document.activeElement?.tagName !== "IFRAME") shield(true); }; // clicking the map is not a screenshot
    const onFocus = () => shield(false);

    document.addEventListener("contextmenu", onCtx); document.addEventListener("dragstart", onDrag);
    document.addEventListener("keydown", onKey); document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVis); window.addEventListener("blur", onBlur); window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("contextmenu", onCtx); document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("keydown", onKey); document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVis); window.removeEventListener("blur", onBlur); window.removeEventListener("focus", onFocus);
      clearTimeout(hold); clearTimeout(t.current); shield(false);
    };
  }, []);

  return (<>
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[35] opacity-[.05]" style={{ backgroundImage: MARK }} />
    <div role="status" aria-live="polite" className={`pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-4 transition duration-300 ${toast ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
      {toast && <p className="max-w-sm rounded-full bg-ink px-5 py-2.5 text-center text-sm font-semibold text-sand shadow-2xl">{toast}</p>}
    </div></>);
}
