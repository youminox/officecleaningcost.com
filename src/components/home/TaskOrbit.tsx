"use client";

import Link from "next/link";
import { useState } from "react";

export interface TaskOrbitItem {
  k: string;
  name: string;
  icon: string;
  role: string;
  d: string;
  href: string;
}

export default function TaskOrbit({ items }: { items: TaskOrbitItem[] }) {
  const [active, setActive] = useState(0);
  const a = items[active];

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_1fr]">
      <div className="orbit mx-auto w-full max-w-[500px]">
        <div className="orbit-ring" />
        <div className="orbit-ring r2" />
        <div className="absolute inset-[24%] grid place-items-center rounded-full bg-gradient-to-br from-occsky via-white to-[#ecfccb]/70 text-center p-4 shadow-[inset_0_10px_40px_rgba(2,132,199,0.14)]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-occbluedeep">
              Active Scope
            </p>
            <p className="mt-1 font-display text-xl font-extrabold text-occink leading-tight">
              {a.name}
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-700">{a.role}</p>
          </div>
        </div>
        <div className="orbit-spin">
          {items.map((it, i) => {
            const ang = (i / items.length) * Math.PI * 2 - Math.PI / 2;
            const x = 50 + Math.cos(ang) * 44;
            const y = 50 + Math.sin(ang) * 44;
            const on = i === active;
            return (
              <div
                key={it.k}
                className="orbit-item absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${x}%`, top: `${y}%` }}
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={on}
                    aria-label={`Inspect ${it.name}`}
                    className={`grid h-14 w-14 place-items-center rounded-full border-[3px] bg-white shadow-lg transition-all duration-300 sm:h-[72px] sm:w-[72px] cursor-pointer ${
                      on
                        ? "scale-110 border-occblue shadow-[0_12px_30px_-10px_rgba(2,132,199,0.8)]"
                        : "border-white hover:border-occblue/60"
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl" aria-hidden>
                      {it.icon}
                    </span>
                  </button>
                  <span
                    className={`pointer-events-none absolute left-1/2 top-full mt-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold sm:block ${
                      on
                        ? "bg-occblue text-white"
                        : "bg-white/95 text-occink shadow"
                    }`}
                  >
                    {it.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <span className="eyebrow">Scope of Work Breakdown</span>
        <h2 className="section-title mt-3">
          What is inside a <span className="text-occblue">standard quote</span>
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          Tap any task around the orbit to see how janitorial vendors price each
          station—and which specialty services are billed outside monthly base
          retainers.
        </p>

        <div
          key={active}
          className="card card-static spot mt-7 p-7"
          style={{ animation: "fadeup .45s ease both" }}
        >
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-occsky text-3xl">
              <span aria-hidden>{a.icon}</span>
            </div>
            <div>
              <p className="font-display text-2xl font-extrabold leading-tight">
                {a.name}
              </p>
              <p className="text-sm font-semibold text-occbluedeep">{a.role}</p>
            </div>
          </div>
          <p className="mt-4 text-base leading-relaxed text-[var(--muted)]">
            {a.d}
          </p>
          <Link
            href={a.href}
            className="mt-5 inline-flex items-center gap-2 font-semibold text-occbluedeep hover:underline"
          >
            Read Task Pricing Guide: {a.name} →
          </Link>
        </div>

        <div
          className="mt-5 flex flex-wrap gap-2"
          role="tablist"
          aria-label="Janitorial scope tasks"
        >
          {items.map((it, i) => (
            <button
              key={it.k}
              type="button"
              role="tab"
              aria-selected={i === active}
              onClick={() => setActive(i)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                i === active
                  ? "border-occblue bg-occblue text-white"
                  : "border-[var(--line)] bg-white hover:border-occblue"
              }`}
            >
              {it.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
