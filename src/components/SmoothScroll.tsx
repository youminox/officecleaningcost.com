"use client";

import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let destroyed = false;
    let raf = 0;
    let lenisInstance: { raf: (t: number) => void; destroy: () => void } | null = null;

    const init = async () => {
      const { default: Lenis } = await import("lenis");
      if (destroyed) return;
      lenisInstance = new Lenis({
        duration: 1.05,
        smoothWheel: true,
      });
      const loop = (time: number) => {
        if (destroyed) return;
        lenisInstance?.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ric = (window as any).requestIdleCallback || ((f: () => void) => setTimeout(f, 250));
    ric(init);

    return () => {
      destroyed = true;
      cancelAnimationFrame(raf);
      lenisInstance?.destroy();
    };
  }, []);

  return null;
}
