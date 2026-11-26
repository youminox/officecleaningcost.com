"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  PRICING_DATA,
  calculateCleaningEstimate,
  type FlooringKey,
  type FrequencyKey,
} from "@/lib/pricing";
import citiesData from "@/data/cities.json";
import { getContextualAmazonProducts } from "@/lib/amazon";
import AmazonAffiliateBox from "./AmazonAffiliateBox";
import OpenChatButton from "./OpenChatButton";

const FLOOR_LIST = Object.entries(PRICING_DATA.flooringTypes) as Array<
  [FlooringKey, { label: string; multiplier: number; note: string }]
>;
const FREQ_LIST = Object.entries(PRICING_DATA.frequencies) as Array<
  [
    FrequencyKey,
    { label: string; visitsPerMonth: number; multiplier: number; shortLabel: string },
  ]
>;

export default function CalculatorWidget({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [sqFt, setSqFt] = useState<number>(5000);
  const [restrooms, setRestrooms] = useState<number>(3);
  const [flooring, setFlooring] = useState<FlooringKey>("mixed");
  const [frequency, setFrequency] = useState<FrequencyKey>("3x-week");
  const [citySlug, setCitySlug] = useState<string>("national");
  const [includeBreakroom, setIncludeBreakroom] = useState<boolean>(true);
  const [includeInteriorGlass, setIncludeInteriorGlass] =
    useState<boolean>(false);
  const [includeConsumables, setIncludeConsumables] = useState<boolean>(false);
  const [includeDeepFloorProgram, setIncludeDeepFloorProgram] =
    useState<boolean>(false);

  const selectedCity = useMemo(
    () => citiesData.find((c) => c.slug === citySlug) || null,
    [citySlug]
  );

  const est = useMemo(
    () =>
      calculateCleaningEstimate({
        sqFt,
        restrooms,
        flooring,
        frequency,
        cityMultiplier: selectedCity?.costMultiplier ?? 1.0,
        cityName: selectedCity
          ? `${selectedCity.city}, ${selectedCity.stateCode}`
          : "US National Average",
        includeBreakroom,
        includeInteriorGlass,
        includeConsumables,
        includeDeepFloorProgram,
      }),
    [
      sqFt,
      restrooms,
      flooring,
      frequency,
      selectedCity,
      includeBreakroom,
      includeInteriorGlass,
      includeConsumables,
      includeDeepFloorProgram,
    ]
  );

  const floorProducts = useMemo(
    () =>
      getContextualAmazonProducts({
        flooring,
        slug: `calculator-${flooring}`,
        count: 3,
      }),
    [flooring]
  );

  const chatPrompt = `Estimate & audit my office: ${sqFt.toLocaleString()} sq ft, ${restrooms} restrooms, ${PRICING_DATA.flooringTypes[flooring].label}, ${PRICING_DATA.frequencies[frequency].label} in ${est.input.cityName}. Calculator shows $${est.perVisitTotal[0].toLocaleString()}-$${est.perVisitTotal[1].toLocaleString()}/visit ($${est.monthlyTotal[0].toLocaleString()}-$${est.monthlyTotal[1].toLocaleString()}/mo). What should I check in vendor quotes?`;

  return (
    <div id="calculator" className="space-y-8">
      <div className="rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-8 shadow-[0_28px_70px_-35px_rgba(2,132,199,0.28)]">
        <div className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr]">
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="calc-sqft"
                  className="font-display text-sm font-bold uppercase tracking-wider text-occslate"
                >
                  Office Square Footage
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="calc-sqft-num"
                    type="number"
                    min={300}
                    max={150000}
                    step={100}
                    value={sqFt}
                    onChange={(e) =>
                      setSqFt(Math.max(300, Math.min(150000, Number(e.target.value) || 500)))
                    }
                    className="w-28 rounded-xl border border-[var(--line)] bg-occsky px-3 py-1.5 text-right font-display text-lg font-extrabold text-occink"
                  />
                  <span className="text-xs font-bold text-[var(--muted)]">
                    sq ft
                  </span>
                </div>
              </div>
              <input
                id="calc-sqft"
                type="range"
                min={500}
                max={60000}
                step={250}
                value={Math.min(60000, sqFt)}
                onChange={(e) => setSqFt(Number(e.target.value))}
                className="mt-3 w-full accent-sky-600 cursor-pointer"
              />
              <div className="mt-1.5 flex justify-between text-[11px] font-semibold text-[var(--muted)]">
                <span>500 sq ft</span>
                <span>15,000 sq ft</span>
                <span>35,000 sq ft</span>
                <span>60,000+ sq ft</span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="calc-restrooms"
                  className="font-display text-xs font-bold uppercase tracking-wider text-occslate"
                >
                  Restrooms ($15–$30 / visit each)
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRestrooms((r) => Math.max(0, r - 1))}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-occsky font-bold text-occink hover:border-occblue"
                    aria-label="Decrease restrooms"
                  >
                    −
                  </button>
                  <input
                    id="calc-restrooms"
                    type="number"
                    min={0}
                    max={60}
                    value={restrooms}
                    onChange={(e) =>
                      setRestrooms(Math.max(0, Math.min(60, Number(e.target.value) || 0)))
                    }
                    className="h-10 w-full rounded-xl border border-[var(--line)] text-center font-display text-lg font-extrabold text-occink"
                  />
                  <button
                    type="button"
                    onClick={() => setRestrooms((r) => Math.min(60, r + 1))}
                    className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--line)] bg-occsky font-bold text-occink hover:border-occblue"
                    aria-label="Increase restrooms"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="calc-city"
                  className="font-display text-xs font-bold uppercase tracking-wider text-occslate"
                >
                  US City Market (150 Metros)
                </label>
                <select
                  id="calc-city"
                  value={citySlug}
                  onChange={(e) => setCitySlug(e.target.value)}
                  className="mt-2 h-10 w-full rounded-xl border border-[var(--line)] bg-white px-3 text-sm font-semibold text-occink"
                >
                  <option value="national">
                    US National Average (1.00x)
                  </option>
                  {citiesData.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.city}, {c.stateCode} ({c.costMultiplier.toFixed(2)}x)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-occslate">
                Primary Flooring Type
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FLOOR_LIST.map(([key, info]) => {
                  const active = flooring === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFlooring(key)}
                      className={`rounded-xl border px-3 py-2.5 text-left text-xs transition cursor-pointer ${
                        active
                          ? "border-occblue bg-sky-50 font-bold text-occink shadow-xs"
                          : "border-[var(--line)] bg-white text-slate-700 hover:border-sky-300"
                      }`}
                    >
                      <span className="block leading-tight">{info.label}</span>
                      <span className="mt-0.5 block text-[10px] font-semibold text-occbluedeep">
                        {info.multiplier.toFixed(2)}x labor factor
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-occslate">
                Cleaning Frequency
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {FREQ_LIST.map(([key, info]) => {
                  const active = frequency === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFrequency(key)}
                      className={`rounded-full border px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                        active
                          ? "border-occink bg-occink text-white"
                          : "border-[var(--line)] bg-white text-slate-700 hover:border-occblue"
                      }`}
                    >
                      {info.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="font-display text-xs font-bold uppercase tracking-wider text-occslate">
                Optional Scope Add-Ons
              </span>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {[
                  [
                    includeBreakroom,
                    setIncludeBreakroom,
                    "Breakroom & Kitchenette (+$12–$25/visit)",
                  ],
                  [
                    includeInteriorGlass,
                    setIncludeInteriorGlass,
                    "Interior Glass Partitions (+$15–$35/visit)",
                  ],
                  [
                    includeConsumables,
                    setIncludeConsumables,
                    "Vendor Supplies Paper & Soap",
                  ],
                  [
                    includeDeepFloorProgram,
                    setIncludeDeepFloorProgram,
                    "Quarterly Deep Floor Care (Amortized)",
                  ],
                ].map(([checked, setter, label]) => (
                  <label
                    key={String(label)}
                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-medium text-slate-700 hover:bg-occsky/60"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checked)}
                      onChange={(e) =>
                        (setter as (v: boolean) => void)(e.target.checked)
                      }
                      className="h-4 w-4 accent-sky-600"
                    />
                    <span>{String(label)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Live Estimate Output */}
          <div className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#071923] via-[#0d2838] to-[#0a2f3a] p-6 text-white shadow-2xl">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#bef264]">
                  {est.bracketLabel} · {est.input.cityName}
                </span>
                <span className="text-xs font-semibold text-sky-300">
                  {est.visitsPerMonth} visits/mo
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/65">
                    Estimated Per Visit
                  </p>
                  <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-[#bef264]">
                    ${est.perVisitTotal[0].toLocaleString()}–$
                    {est.perVisitTotal[1].toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    ${est.effectiveRatePerSqFtPerVisit[0].toFixed(2)}–$
                    {est.effectiveRatePerSqFtPerVisit[1].toFixed(2)} / sq ft
                  </p>
                </div>

                <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                    Estimated Monthly
                  </p>
                  <p className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">
                    ${est.monthlyTotal[0].toLocaleString()}–$
                    {est.monthlyTotal[1].toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-white/70">
                    ~${est.annualTotal[0].toLocaleString()}–$
                    {est.annualTotal[1].toLocaleString()} / yr
                  </p>
                </div>
              </div>

              {est.minimumApplied && (
                <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
                  Minimum visit trip charge ($90+ adjusted for city) applies to
                  smaller suites.
                </p>
              )}

              <dl className="mt-5 space-y-2 border-t border-white/15 pt-4 text-xs">
                <div className="flex justify-between">
                  <dt className="text-white/70">Base square-footage labor</dt>
                  <dd className="font-bold">
                    ${est.perVisitBase[0]}–${est.perVisitBase[1]} / visit
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-white/70">
                    Restrooms ({restrooms} fixtures/rooms)
                  </dt>
                  <dd className="font-bold">
                    ${est.restroomCostPerVisit[0]}–${est.restroomCostPerVisit[1]}{" "}
                    / visit
                  </dd>
                </div>
                {(est.addOnsPerVisit[0] > 0 || est.addOnsPerVisit[1] > 0) && (
                  <div className="flex justify-between">
                    <dt className="text-white/70">Selected per-visit add-ons</dt>
                    <dd className="font-bold">
                      ${est.addOnsPerVisit[0]}–${est.addOnsPerVisit[1]} / visit
                    </dd>
                  </div>
                )}
                {est.monthlyDeepFloorAmortized[1] > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-white/70">
                      Quarterly deep floor care (monthly)
                    </dt>
                    <dd className="font-bold">
                      +${est.monthlyDeepFloorAmortized[0]}–$
                      {est.monthlyDeepFloorAmortized[1]} / mo
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-white/10 pt-2">
                  <dt className="text-white/70">
                    Est. ISSA crew time / visit
                  </dt>
                  <dd className="font-bold text-sky-300">
                    {est.estimatedLaborHoursPerVisit[0]}–
                    {est.estimatedLaborHoursPerVisit[1]} hrs ($
                    {est.impliedHourlyRate[0]}–${est.impliedHourlyRate[1]}/hr)
                  </dd>
                </div>
              </dl>
            </div>

            <div className="mt-6 flex flex-col gap-2.5">
              <OpenChatButton
                prompt={chatPrompt}
                className="btn btn-lime shine w-full text-sm"
              >
                Ask AI Estimator About This Budget →
              </OpenChatButton>
              <Link
                href="/compare-cleaning-quotes/"
                className="btn btn-glass w-full text-xs"
              >
                Compare Real Vendor Quotes Against This Range
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!compact && (
        <AmazonAffiliateBox
          variant="inline"
          sectionTitle={`Recommended Gear for ${PRICING_DATA.flooringTypes[flooring].label}`}
          sectionSubtitle="Matching equipment and chemical picks on Amazon US if you maintain supplies in-house or specify vendor gear."
          products={floorProducts}
          source={`calc-${flooring}`}
        />
      )}
    </div>
  );
}
