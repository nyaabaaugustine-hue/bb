"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Consultant = dynamic(() => import("./Consultant"), { ssr: false });

/**
 * The assistant is not needed for first paint. Load its chunk once the browser
 * is idle, or immediately if the visitor interacts first.
 */
export default function DeferredConsultant() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (ready) return;
    let idle = 0;
    let timer = 0;
    const load = () => setReady(true);
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };

    if (typeof idleWindow.requestIdleCallback === "function") {
      idle = idleWindow.requestIdleCallback(load, { timeout: 2500 });
    } else {
      timer = window.setTimeout(load, 1800);
    }

    window.addEventListener("pointerdown", load, { once: true, passive: true });
    window.addEventListener("keydown", load, { once: true });
    window.addEventListener("scroll", load, { once: true, passive: true });

    return () => {
      idleWindow.cancelIdleCallback?.(idle);
      window.clearTimeout(timer);
      window.removeEventListener("pointerdown", load);
      window.removeEventListener("keydown", load);
      window.removeEventListener("scroll", load);
    };
  }, [ready]);

  return ready ? <Consultant /> : null;
}
