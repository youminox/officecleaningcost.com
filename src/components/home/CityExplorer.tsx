"use client";

import Link from "next/link";
import { useState } from "react";
import type { CityBenchmark } from "@/lib/content";

export default function CityExplorer({ cities }: { cities: CityBenchmark[] }) {
  const [q, setQ] = useState("");
  const shown = q.trim()
    ? cities
        .filter((c) =>
          `${c.city} ${c.state} ${c.stateCode} ${c.region}`
            .toLowerCase()
            .includes(q.toLowerCase())
        )
        .slice(0, 12)
    : cities.slice(0, 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter all 150 US cities (e.g., Austin, Chicago, NY, Seattle)..."
          aria-label="Filter US cities"
          className="w-full max-w-md rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-occink focus:outline-none focus:border-occblue"
        />
        <Link
          href="/city-cleaning-costs/"
          className="text-sm font-bold text-occbluedeep hover:underline"
        >
          Browse all 150 US city benchmarks →
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shown.map((c) => {
          const monthly5kLow = Math.round(5000 * 0.09 * 0.95 * c.costMultiplier * 13);
          const monthly5kHigh = Math.round(5000 * 0.15 * 0.95 * c.costMultiplier * 13);
          return (
            <Link
              key={c.slug}
              href={`/city-cleaning-costs/office-cleaning-cost-${c.slug}/`}
              className="card spot p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-occbluedeep">
                    {c.stateCode} · {c.region}
                  </span>
                  <span className="rounded-full bg-occsky px-2 py-0.5 text-[11px] font-extrabold text-occink">
                    {c.costMultiplier.toFixed(2)}x index
                  </span>
                </div>
                <p className="mt-2 font-display text-lg font-extrabold text-occink">
                  {c.city}, {c.stateCode}
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Hourly: ${c.hourlyRange[0]}–${c.hourlyRange[1]}/hr
                </p>
              </div>
              <div className="mt-4 border-t border-[var(--line)] pt-3 text-xs">
                <span className="text-[var(--muted)]">5,000 sq ft (3x/wk): </span>
                <strong className="text-occink">
                  ${monthly5kLow.toLocaleString()}–${monthly5kHigh.toLocaleString()}/mo
                </strong>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
