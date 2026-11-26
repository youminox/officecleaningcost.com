"use client";

import { useCallback, useRef, useState } from "react";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export default function DayNightSlider() {
  const [v, setV] = useState(25);
  const scene = useRef<HTMLDivElement>(null);
  const t = v / 100;
  const night = clamp((t - 0.35) / 0.5);
  const isNight = t >= 0.5;

  const fromPointer = useCallback((clientX: number) => {
    const el = scene.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setV(Math.round(clamp((clientX - r.left) / r.width) * 100));
  }, []);

  return (
    <div className="daynight bg-[#071923] shadow-[0_40px_80px_-40px_rgba(7,25,35,0.7)]">
      <div
        ref={scene}
        className="relative aspect-[4/5] cursor-ew-resize select-none sm:aspect-[16/9]"
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") e.preventDefault();
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          fromPointer(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1 || e.pointerType === "touch") {
            if ((e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId))
              fromPointer(e.clientX);
          }
        }}
      >
        <svg
          viewBox="0 0 800 450"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="occ-day" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#7dd3fc" />
              <stop offset="1" stopColor="#f0f9ff" />
            </linearGradient>
            <linearGradient id="occ-night" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#04111a" />
              <stop offset="1" stopColor="#0d2838" />
            </linearGradient>
          </defs>
          <rect width="800" height="450" fill="url(#occ-day)" />
          <rect width="800" height="450" fill="url(#occ-night)" opacity={night} />
          {/* Office Glass Curtain Wall Silhouette */}
          <g
            fill={isNight ? "#0b2230" : "#bae6fd"}
            stroke={isNight ? "#1e3a4c" : "#ffffff"}
            strokeWidth="2"
          >
            <rect x="60" y="70" width="680" height="310" rx="18" />
            <line x1="230" y1="70" x2="230" y2="380" />
            <line x1="400" y1="70" x2="400" y2="380" />
            <line x1="570" y1="70" x2="570" y2="380" />
            <line x1="60" y1="225" x2="740" y2="225" />
          </g>
          {/* Interior Lights & Floor */}
          <rect
            x="0"
            y="380"
            width="800"
            height="70"
            fill={isNight ? "#071923" : "#e2e8f0"}
          />
          <g opacity={night}>
            <circle cx="400" cy="140" r="9" fill="#bef264" />
            <circle cx="150" cy="140" r="7" fill="#38bdf8" />
            <circle cx="650" cy="140" r="7" fill="#38bdf8" />
          </g>
          {/* Shift Badge Overlay inside SVG */}
          <rect
            x="90"
            y="255"
            width="620"
            height="95"
            rx="16"
            fill={isNight ? "rgba(7,25,35,0.88)" : "rgba(255,255,255,0.92)"}
          />
          <text
            x="120"
            y="292"
            fill={isNight ? "#bef264" : "#0369a1"}
            fontSize="20"
            fontWeight="800"
          >
            {isNight
              ? "After-Hours Night Crew (6 PM – 11 PM)"
              : "Daytime Porter & Green Cleaning (8 AM – 5 PM)"}
          </text>
          <text
            x="120"
            y="324"
            fill={isNight ? "#e2e8f0" : "#334155"}
            fontSize="15"
            fontWeight="600"
          >
            {isNight
              ? "Higher vacuum/floor speed (no foot traffic) · Full floor scrub & strip · Requires alarm/key bond"
              : "Saves night HVAC & lighting energy · Quiet <70 dBA vacuums · Immediate midday restroom resets"}
          </text>
        </svg>

        <div className="pointer-events-none absolute inset-x-4 top-4 flex items-center justify-between gap-2">
          <span className="rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-extrabold text-occink shadow">
            {isNight ? "🌙 Night Shift Mode" : "☀️ Daytime Shift Mode"} ({v}%)
          </span>
          <span className="rounded-full bg-[#071923]/85 px-3.5 py-1.5 text-xs font-bold text-[#bef264]">
            Drag slider to compare shifts
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-white/15 bg-[#071923] px-5 py-4 text-white">
        <span className="text-xs font-bold text-sky-300 shrink-0">
          ☀️ Day Porter
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
          aria-label="Slide between Daytime Porter and Night Crew cleaning"
        />
        <span className="text-xs font-bold text-[#bef264] shrink-0">
          🌙 Night Crew
        </span>
      </div>
    </div>
  );
}
