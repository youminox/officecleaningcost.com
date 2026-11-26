"use client";

import { useState } from "react";
import { getContextualAmazonProducts } from "@/lib/amazon";
import AmazonAffiliateBox from "./AmazonAffiliateBox";

interface BidRow {
  vendorName: string;
  monthlyPrice: number;
  visitsPerWeek: number;
  sqFt: number;
  restrooms: number;
  includesConsumables: boolean;
  hasGeneralLiability: boolean;
  hasWorkersComp: boolean;
  hasJanitorialBond: boolean;
  w2Crew: boolean;
  thirtyDayCancel: boolean;
}

const DEFAULT_BIDS: BidRow[] = [
  {
    vendorName: "Vendor A (Low Bid)",
    monthlyPrice: 1250,
    visitsPerWeek: 3,
    sqFt: 5000,
    restrooms: 3,
    includesConsumables: false,
    hasGeneralLiability: true,
    hasWorkersComp: false,
    hasJanitorialBond: false,
    w2Crew: false,
    thirtyDayCancel: false,
  },
  {
    vendorName: "Vendor B (Mid-Market Pro)",
    monthlyPrice: 1850,
    visitsPerWeek: 3,
    sqFt: 5000,
    restrooms: 3,
    includesConsumables: false,
    hasGeneralLiability: true,
    hasWorkersComp: true,
    hasJanitorialBond: true,
    w2Crew: true,
    thirtyDayCancel: true,
  },
  {
    vendorName: "Vendor C (Turnkey + Supplies)",
    monthlyPrice: 2350,
    visitsPerWeek: 3,
    sqFt: 5000,
    restrooms: 3,
    includesConsumables: true,
    hasGeneralLiability: true,
    hasWorkersComp: true,
    hasJanitorialBond: true,
    w2Crew: true,
    thirtyDayCancel: true,
  },
];

function scoreBid(b: BidRow) {
  const visitsMo = Math.max(1, b.visitsPerWeek * 4.33);
  const perVisit = b.monthlyPrice / visitsMo;
  const perSqFt = b.sqFt > 0 ? perVisit / b.sqFt : 0;
  let compliance = 0;
  if (b.hasGeneralLiability) compliance += 25;
  if (b.hasWorkersComp) compliance += 25;
  if (b.hasJanitorialBond) compliance += 20;
  if (b.w2Crew) compliance += 15;
  if (b.thirtyDayCancel) compliance += 15;
  const flags: string[] = [];
  if (!b.hasWorkersComp) flags.push("Missing Workers' Comp COI");
  if (!b.hasJanitorialBond) flags.push("Unbonded keyholders");
  if (!b.w2Crew) flags.push("1099 subcontractor turnover risk");
  if (!b.thirtyDayCancel) flags.push("Long lock-in / auto-renewal");
  if (perSqFt < 0.04) flags.push("Suspiciously low rate (<$0.04/sq ft)");
  return { perVisit, perSqFt, compliance, flags };
}

export default function QuoteComparisonTool() {
  const [bids, setBids] = useState<BidRow[]>(DEFAULT_BIDS);
  const products = getContextualAmazonProducts({
    pillar: "comparing-quotes-and-contracts",
    slug: "compare-cleaning-quotes",
    count: 3,
  });

  const updateBid = <K extends keyof BidRow>(
    idx: number,
    key: K,
    val: BidRow[K]
  ) => {
    setBids((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [key]: val } : row))
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-5 lg:grid-cols-3">
        {bids.map((b, idx) => {
          const st = scoreBid(b);
          return (
            <div
              key={idx}
              className="card flex flex-col justify-between p-5 sm:p-6"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={b.vendorName}
                    onChange={(e) => updateBid(idx, "vendorName", e.target.value)}
                    aria-label={`Vendor ${idx + 1} name`}
                    className="w-full rounded-xl border border-[var(--line)] bg-occsky px-3 py-1.5 font-display text-base font-extrabold text-occink"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="block">
                    <span className="font-bold text-slate-600">Monthly ($)</span>
                    <input
                      type="number"
                      min={100}
                      max={100000}
                      value={b.monthlyPrice}
                      onChange={(e) =>
                        updateBid(idx, "monthlyPrice", Number(e.target.value) || 0)
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold text-slate-600">Visits / Wk</span>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={b.visitsPerWeek}
                      onChange={(e) =>
                        updateBid(idx, "visitsPerWeek", Number(e.target.value) || 1)
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold text-slate-600">Office Sq Ft</span>
                    <input
                      type="number"
                      min={200}
                      max={200000}
                      value={b.sqFt}
                      onChange={(e) =>
                        updateBid(idx, "sqFt", Number(e.target.value) || 1000)
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 font-bold"
                    />
                  </label>
                  <label className="block">
                    <span className="font-bold text-slate-600">Restrooms</span>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={b.restrooms}
                      onChange={(e) =>
                        updateBid(idx, "restrooms", Number(e.target.value) || 0)
                      }
                      className="mt-1 w-full rounded-lg border border-[var(--line)] px-2.5 py-1.5 font-bold"
                    />
                  </label>
                </div>

                <div className="space-y-2 border-t border-[var(--line)] pt-3 text-xs">
                  {[
                    ["includesConsumables", "Paper towels, soap & liners included"],
                    ["hasGeneralLiability", "$1M/$2M General Liability COI verified"],
                    ["hasWorkersComp", "Workers' Compensation COI verified"],
                    ["hasJanitorialBond", "Janitorial Surety Bond (keyholders)"],
                    ["w2Crew", "W-2 employees (not 1099 subs)"],
                    ["thirtyDayCancel", "30-day termination without penalty"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="flex cursor-pointer items-center gap-2 text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(b[key as keyof BidRow])}
                        onChange={(e) =>
                          updateBid(
                            idx,
                            key as keyof BidRow,
                            e.target.checked as never
                          )
                        }
                        className="h-4 w-4 accent-sky-600"
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-[#071923] p-4 text-white">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-white/70">Per Visit / Sq Ft</span>
                  <span className="font-display text-lg font-extrabold text-[#bef264]">
                    ${Math.round(st.perVisit).toLocaleString()} ($
                    {st.perSqFt.toFixed(3)}/sf)
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/70">
                    Compliance Score
                  </span>
                  <span
                    className={`font-display text-sm font-extrabold ${
                      st.compliance >= 85
                        ? "text-emerald-400"
                        : st.compliance >= 60
                        ? "text-amber-300"
                        : "text-rose-400"
                    }`}
                  >
                    {st.compliance} / 100
                  </span>
                </div>
                {st.flags.length > 0 ? (
                  <ul className="mt-2.5 space-y-1 border-t border-white/10 pt-2 text-[11px] text-rose-300">
                    {st.flags.map((f) => (
                      <li key={f}>⚠ {f}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2.5 border-t border-white/10 pt-2 text-[11px] text-emerald-300">
                    ✓ Passes core insurance, bonding & cancellation checks
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <AmazonAffiliateBox
        variant="inline"
        sectionTitle="If You Exclude Consumables From Vendor Bids: Buy Bulk Supplies Direct"
        sectionSubtitle="Most facility managers save 15%–25% by purchasing paper, soap, liners, and carts separately on Amazon US."
        products={products}
        source="quote-comparator"
      />
    </div>
  );
}
