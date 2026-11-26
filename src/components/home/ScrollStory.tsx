"use client";

import { useEffect, useRef } from "react";

const STEPS = [
  {
    n: "01",
    t: "Walkthrough & Sq Ft Audit",
    d: "Measure usable carpet vs. hard floors, restroom fixture counts, and high-touch breakrooms.",
  },
  {
    n: "02",
    t: "Scope & Supplies Lock",
    d: "Separate base janitorial labor from paper/soap consumables and quarterly floor restoration.",
  },
  {
    n: "03",
    t: "Compare 3 Vetted Bids",
    d: "Verify $1M/$2M General Liability, Workers' Comp, janitorial bonding, and implied hourly rates.",
  },
  {
    n: "04",
    t: "Spotless Nightly Execution",
    d: "Launch predictable weekly or 5x/week service with APPA inspection scorecards and zero surprise fees.",
  },
];

export default function ScrollStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    let io: IntersectionObserver | null = null;

    const init = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
        const q = gsap.utils.selector(el);
        if (reduce) {
          gsap.set(q(".step"), { opacity: 1 });
          gsap.set(q(".bar"), { scaleX: 1 });
          gsap.set(q(".zone"), { opacity: 1 });
          return;
        }
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: "+=1700",
            scrub: 0.7,
            pin: q(".pin")[0],
            anticipatePin: 1,
          },
        });
        tl.to(q(".bar"), { scaleX: 1, duration: 3 }, 0)
          .to(q(".step-0"), { opacity: 1, duration: 0.3 }, 0)
          .to(q(".step-0 .dot"), { backgroundColor: "#0284c7", color: "#fff" }, 0)
          .to(q(".zone-1"), { opacity: 1, duration: 0.5 }, 0.2)
          .to(q(".step-1"), { opacity: 1, duration: 0.3 }, 0.8)
          .to(q(".step-1 .dot"), { backgroundColor: "#10b981", color: "#fff" }, 0.8)
          .to(q(".zone-2"), { opacity: 1, duration: 0.5 }, 1.0)
          .to(q(".step-2"), { opacity: 1, duration: 0.3 }, 1.6)
          .to(q(".step-2 .dot"), { backgroundColor: "#f59e0b", color: "#fff" }, 1.6)
          .to(q(".zone-3"), { opacity: 1, duration: 0.5 }, 1.8)
          .to(q(".step-3"), { opacity: 1, duration: 0.3 }, 2.3)
          .to(q(".step-3 .dot"), { backgroundColor: "#84cc16", color: "#071923" }, 2.3)
          .to(q(".zone-4"), { opacity: 1, duration: 0.5 }, 2.4);
      }, el);
    };

    io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io?.disconnect();
          init();
        }
      },
      { rootMargin: "600px 0px" }
    );
    io.observe(el);
    return () => {
      cancelled = true;
      io?.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <section
      id="walkthrough-to-spotless"
      ref={root}
      className="relative bg-gradient-to-b from-white via-occsky to-white"
    >
      <div className="pin flex min-h-[100svh] items-center overflow-hidden py-12 lg:py-16">
        <div className="wrap grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <span className="eyebrow">From Walkthrough to Spotless</span>
            <h2 className="section-title mt-3">
              Four steps. <span className="text-occblue">Zero billing surprises.</span>
            </h2>
            <div className="mt-4 h-1.5 w-full max-w-sm overflow-hidden rounded bg-[var(--line)]">
              <div className="bar h-full origin-left scale-x-0 bg-gradient-to-r from-[#0284c7] via-[#10b981] to-[#84cc16]" />
            </div>
            <ol className="mt-6 space-y-3 sm:mt-8 sm:space-y-4">
              {STEPS.map((s, i) => (
                <li
                  key={s.n}
                  className={`step step-${i} flex gap-4`}
                  style={{ opacity: 0.72 }}
                >
                  <span className="dot grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white font-display font-extrabold text-occink shadow-md">
                    {s.n}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold sm:text-xl">
                      {s.t}
                    </p>
                    <p className="text-sm text-[var(--muted)] sm:text-base">
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative mx-auto w-full max-w-[440px]">
            <svg
              viewBox="0 0 420 360"
              className="w-full drop-shadow-[0_30px_50px_rgba(7,25,35,0.18)]"
              role="img"
              aria-label="Animated office blueprint showing open desks, restrooms, breakroom, and reception zone cleanup stages"
            >
              <rect
                x="10"
                y="10"
                width="400"
                height="340"
                rx="28"
                fill="#071923"
                stroke="#1e3a4c"
                strokeWidth="3"
              />
              {/* Blueprint Grid */}
              <g stroke="rgba(56,189,248,0.12)" strokeWidth="1">
                {[70, 140, 210, 280, 350].map((x) => (
                  <line key={`vx-${x}`} x1={x} y1="24" x2={x} y2="336" />
                ))}
                {[80, 150, 220, 290].map((y) => (
                  <line key={`hy-${y}`} x1="24" y1={y} x2="396" y2={y} />
                ))}
              </g>
              {/* Zone 1: Workstations */}
              <g className="zone zone-1" opacity="0.25">
                <rect
                  x="30"
                  y="32"
                  width="210"
                  height="145"
                  rx="14"
                  fill="#0284c7"
                  fillOpacity="0.25"
                  stroke="#38bdf8"
                  strokeWidth="2"
                />
                <text x="48" y="60" fill="#e0f2fe" fontSize="13" fontWeight="700">
                  WORKSTATIONS &amp; CARPET
                </text>
                <text x="48" y="82" fill="#7dd3fc" fontSize="11">
                  3,500 sq ft/hr HEPA pass
                </text>
              </g>
              {/* Zone 2: Restrooms */}
              <g className="zone zone-2" opacity="0.25">
                <rect
                  x="255"
                  y="32"
                  width="135"
                  height="145"
                  rx="14"
                  fill="#10b981"
                  fillOpacity="0.25"
                  stroke="#34d399"
                  strokeWidth="2"
                />
                <text x="272" y="60" fill="#d1fae5" fontSize="13" fontWeight="700">
                  RESTROOMS
                </text>
                <text x="272" y="82" fill="#6ee7b7" fontSize="11">
                  +$15–$30 / room
                </text>
              </g>
              {/* Zone 3: Breakroom */}
              <g className="zone zone-3" opacity="0.25">
                <rect
                  x="30"
                  y="192"
                  width="170"
                  height="136"
                  rx="14"
                  fill="#f59e0b"
                  fillOpacity="0.22"
                  stroke="#fbbf24"
                  strokeWidth="2"
                />
                <text x="48" y="220" fill="#fef3c7" fontSize="13" fontWeight="700">
                  BREAKROOM
                </text>
                <text x="48" y="242" fill="#fcd34d" fontSize="11">
                  +$12–$25 / visit add-on
                </text>
              </g>
              {/* Zone 4: Lobby & Glass */}
              <g className="zone zone-4" opacity="0.25">
                <rect
                  x="215"
                  y="192"
                  width="175"
                  height="136"
                  rx="14"
                  fill="#84cc16"
                  fillOpacity="0.22"
                  stroke="#bef264"
                  strokeWidth="2"
                />
                <text x="232" y="220" fill="#ecfccb" fontSize="13" fontWeight="700">
                  LOBBY &amp; GLASS
                </text>
                <text x="232" y="242" fill="#bef264" fontSize="11">
                  Spotless first impression
                </text>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
