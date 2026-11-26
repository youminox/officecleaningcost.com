"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import { calculateCleaningEstimate } from "@/lib/pricing";

function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let running = false;
    let w = 0,
      h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * dpr;
      c.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const COLORS = [
      "56,189,248",
      "2,132,199",
      "132,204,22",
      "16,185,129",
      "251,191,36",
    ];
    const N = w < 700 ? 40 : 95;
    const ps = Array.from({ length: N }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2.3 + 0.6,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.05,
      c: COLORS[(Math.random() * COLORS.length) | 0],
      a: Math.random() * 0.55 + 0.25,
    }));
    let mx = -999,
      my = -999;
    const onMove = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        const dx = p.x - mx,
          dy = p.y - my,
          d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = (16000 - d2) / 16000;
          p.vx += (dx / 4000) * f;
          p.vy += (dy / 4000) * f;
        }
        p.vx *= 0.975;
        p.vy = p.vy * 0.975 - 0.006;
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${p.a})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    const play = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) =>
      e.isIntersecting ? play() : pause()
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ric = (window as any).requestIdleCallback || ((f: () => void) => setTimeout(f, 300));
    ric(() => io.observe(c));
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      pause();
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 -z-[1] h-full w-full"
      aria-hidden
    />
  );
}

export default function Hero() {
  const card = useRef<HTMLDivElement>(null);
  const [sqFt, setSqFt] = useState(5000);
  const [restrooms, setRestrooms] = useState(3);
  const [freq, setFreq] = useState<"1x-week" | "3x-week" | "5x-week">("3x-week");

  const est = calculateCleaningEstimate({
    sqFt,
    restrooms,
    flooring: "mixed",
    frequency: freq,
  });

  useEffect(() => {
    const el = card.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    let tx = 0,
      ty = 0,
      cx = 0,
      cy = 0,
      raf = 0;
    const loop = () => {
      cx += (tx - cx) * 0.08;
      cy += (ty - cy) * 0.08;
      el.style.transform = `rotateY(${cx}deg) rotateX(${cy}deg)`;
      if (Math.abs(tx - cx) > 0.01 || Math.abs(ty - cy) > 0.01)
        raf = requestAnimationFrame(loop);
      else raf = 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      tx = (e.clientX / window.innerWidth - 0.5) * 14;
      ty = -(e.clientY / window.innerHeight - 0.5) * 10;
      kick();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  const words = ["Office", "Cleaning", "Cost"];

  return (
    <section className="hero min-h-[100svh] pt-[68px]">
      <div className="hero-aurora" />
      <div className="hero-grid" />
      <Particles />
      <div className="wrap grid min-h-[calc(100svh-68px)] items-center gap-10 py-12 lg:grid-cols-[1.08fr_1fr] lg:py-0">
        <div className="relative z-10">
          <span className="chip">
            <span className="h-2 w-2 animate-pulse rounded-full bg-occlime" />{" "}
            US Commercial Benchmarks · 150 Cities · Free Cost Calculator
          </span>
          <h1 className="hero-title mt-6">
            <span className="block">
              {words.map((w, i) => (
                <span key={w}>
                  <span
                    className="hw"
                    style={{
                      animationDelay: `${0.08 + i * 0.12}s, ${-i * 1.2}s`,
                    }}
                  >
                    {w}
                  </span>
                  {i < words.length - 1 ? " " : ""}
                </span>
              ))}
            </span>
            <span className="mt-4 block text-[0.42em] font-bold leading-[1.22] tracking-[-0.02em] text-white/95">
              {["Estimate", "per-visit", "&", "monthly", "rates"].map(
                (w, i) => (
                  <Fragment key={w + i}>
                    <span className="reveal-word">
                      <span style={{ animationDelay: `${0.4 + i * 0.06}s` }}>
                        {w}
                      </span>
                    </span>{" "}
                  </Fragment>
                )
              )}
              <span className="reveal-word">
                <span
                  style={{ animationDelay: "0.78s" }}
                  className="text-[#bef264]"
                >
                  before you sign a bid.
                </span>
              </span>
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
            Built for US office managers and business owners. Calculate real
            budgets by <strong className="text-white">square footage</strong>,{" "}
            <strong className="text-white">restrooms</strong>,{" "}
            <strong className="text-white">flooring</strong>, and{" "}
            <strong className="text-white">weekly frequency</strong> across 150
            US metro markets.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#calculator"
              className="btn btn-lime shine text-base"
              data-magnetic
            >
              Launch Full Calculator ↓
            </a>
            <Link
              href="/compare-cleaning-quotes/"
              className="btn btn-glass"
              data-magnetic
            >
              Compare Vendor Quotes →
            </Link>
          </div>
          <ul
            className="mt-10 grid max-w-lg grid-cols-3 gap-2.5 sm:gap-3"
            aria-label="US National Commercial Benchmarks"
          >
            {[
              ["$0.07–$0.20", "", "per sq ft / visit"],
              ["$35–$65", "/hr", "standard labor"],
              ["150", "", "US city indexes"],
            ].map(([v, u, l], i) => (
              <li
                key={l}
                className="glass px-3 py-3 sm:px-4"
                style={{
                  animation: `fadeup .8s ${0.85 + i * 0.1}s cubic-bezier(.2,.8,.2,1) both`,
                }}
              >
                <p className="font-display text-lg font-extrabold text-white sm:text-xl">
                  {v}
                  {u && (
                    <span className="ml-0.5 text-xs font-bold text-white/70">
                      {u}
                    </span>
                  )}
                </p>
                <p className="text-[0.72rem] leading-tight text-white/70 sm:text-xs">
                  {l}
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* 3D Tilt Interactive Quick Estimator */}
        <div className="tilt-stage relative z-10 mx-auto w-full max-w-[540px]">
          <div ref={card} className="tilt-card relative">
            <div className="tilt-glow" />
            <div className="halo-ring" />
            <div
              className="relative rounded-3xl border border-white/20 bg-[#071923]/90 p-6 shadow-[0_35px_80px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl"
              style={{ transform: "translateZ(40px)" }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#bef264]">
                  Quick Office Estimator
                </span>
                <span className="text-[11px] font-semibold text-white/70">
                  US National Avg
                </span>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-white/80">Office Size</span>
                    <span className="text-[#bef264]">
                      {sqFt.toLocaleString()} sq ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={30000}
                    step={500}
                    value={sqFt}
                    onChange={(e) => setSqFt(Number(e.target.value))}
                    aria-label="Quick estimator square footage"
                    className="mt-2 w-full accent-lime-400 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block font-bold text-white/80">
                      Restrooms
                    </span>
                    <div className="mt-1.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setRestrooms((r) => Math.max(1, r - 1))}
                        className="h-8 w-8 rounded-lg border border-white/20 bg-white/10 font-bold cursor-pointer"
                      >
                        −
                      </button>
                      <span className="flex-1 text-center font-display text-base font-extrabold">
                        {restrooms}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRestrooms((r) => Math.min(30, r + 1))}
                        className="h-8 w-8 rounded-lg border border-white/20 bg-white/10 font-bold cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="block font-bold text-white/80">
                      Frequency
                    </span>
                    <div className="mt-1.5 grid grid-cols-3 gap-1">
                      {(["1x-week", "3x-week", "5x-week"] as const).map((f) => (
                        <button
                          key={f}
                          type="button"
                          onClick={() => setFreq(f)}
                          className={`rounded-lg py-1.5 text-[11px] font-bold cursor-pointer ${
                            freq === f
                              ? "bg-[#84cc16] text-[#071923]"
                              : "bg-white/10 text-white/80"
                          }`}
                        >
                          {f.replace("-week", "x")}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/15 bg-white/5 p-3.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      Per Visit
                    </p>
                    <p className="font-display text-xl font-extrabold text-[#bef264]">
                      ${est.perVisitTotal[0]}–${est.perVisitTotal[1]}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-white/60">
                      Per Month
                    </p>
                    <p className="font-display text-xl font-extrabold text-white">
                      ${est.monthlyTotal[0].toLocaleString()}–$
                      {est.monthlyTotal[1].toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="price-badge -right-3 -top-6 hidden sm:grid"
              aria-label="National US benchmark $0.07 to $0.20 per sq ft"
            >
              <svg viewBox="0 0 124 124" aria-hidden>
                <defs>
                  <path
                    id="occ-circle"
                    d="M62,62 m-49,0 a49,49 0 1,1 98,0 a49,49 0 1,1 -98,0"
                  />
                </defs>
                <text
                  fontSize="8.5"
                  fontWeight="700"
                  fill="#162903"
                  fontFamily="Outfit, sans-serif"
                >
                  <textPath
                    href="#occ-circle"
                    textLength="300"
                    lengthAdjust="spacing"
                  >
                    US OFFICE BENCHMARK · PER SQ FT · 2026 RATES ·
                  </textPath>
                </text>
              </svg>
              <div className="relative">
                <p className="font-display text-xl font-extrabold leading-none">
                  $0.07+
                </p>
                <p className="mt-0.5 text-[0.62rem] font-bold">per sq ft</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
