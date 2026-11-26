"use client";

import {
  AMAZON_TAG_US,
  AmazonProduct,
  buildAmazonUrl,
} from "@/lib/amazon";
import { trackClick } from "@/lib/client-constants";

interface AmazonAffiliateBoxProps {
  variant: "verdict" | "vs" | "inline" | "showcase" | "sidebar" | "compact";
  sectionTitle: string;
  sectionSubtitle?: string;
  products: AmazonProduct[];
  source?: string;
}

function CategoryBadgeIcon({ cat }: { cat: string }) {
  const map: Record<string, string> = {
    "backpack-vacuums": "🎒",
    "upright-vacuums": "🧹",
    "carpet-extractors": "💦",
    "floor-machines": "⚙️",
    "mops-and-buckets": "🪣",
    "carts-and-bins": "🛒",
    "restroom-dispensers": "🧻",
    "paper-and-liners": "📦",
    "chemicals-disinfectants": "🧪",
    "cloths-window-safety": "🪟",
    "entrance-mats": "🚪",
    "air-purifiers": "🌬️",
  };
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071923] text-[#bef264] border border-[#0284c7]/40 text-xl">
      <span aria-hidden>{map[cat] || "🏢"}</span>
    </div>
  );
}

export default function AmazonAffiliateBox({
  variant,
  sectionTitle,
  sectionSubtitle,
  products,
  source = "page",
}: AmazonAffiliateBoxProps) {
  if (!products || products.length === 0) return null;
  const primary = products[0];

  const onAmazonClick = (prod: AmazonProduct, pos: string) => {
    const url = buildAmazonUrl(prod);
    trackClick(`${source}-${variant}-${pos}`, {
      article_slug: prod.id,
      article_title: prod.title,
      category: "amazon",
      target_url: url,
    });
  };

  if (variant === "compact") {
    const url = buildAmazonUrl(primary);
    return (
      <aside
        aria-label="Recommended Commercial Supply on Amazon"
        className="my-8 rounded-2xl border border-[var(--line)] bg-gradient-to-r from-[#f0f7fb] via-white to-[#ecfccb]/45 p-5"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <CategoryBadgeIcon cat={primary.category} />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-occbluedeep">
                {primary.badge} · Amazon US ({AMAZON_TAG_US})
              </p>
              <p className="font-display text-base font-extrabold text-occink">
                {primary.title}
              </p>
              <p className="text-xs text-[var(--muted)]">{primary.subtitle}</p>
            </div>
          </div>
          <a
            href={url}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={() => onAmazonClick(primary, "compact")}
            className="btn btn-amber shrink-0 !px-5 !py-2.5 text-xs"
          >
            {primary.ctaLabel} →
          </a>
        </div>
        <p className="mt-2.5 text-[11px] text-[var(--muted)]">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      </aside>
    );
  }

  if (variant === "sidebar") {
    return (
      <aside
        aria-label="Commercial Equipment Picks on Amazon"
        className="rounded-2xl bg-gradient-to-b from-[#071923] to-[#0d2838] p-5 text-white shadow-xl"
      >
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#bef264]">
          Commercial Supply Picks
        </p>
        <p className="mt-1 font-display text-lg font-extrabold leading-snug">
          {sectionTitle}
        </p>
        <div className="mt-4 space-y-3">
          {products.slice(0, 2).map((prod, idx) => (
            <div
              key={prod.id}
              className="rounded-xl border border-white/15 bg-white/5 p-3.5"
            >
              <p className="text-[10px] font-bold uppercase tracking-wider text-sky-300">
                {prod.brand} · {prod.specs.capacityOrSize}
              </p>
              <p className="mt-1 font-display text-sm font-bold leading-snug text-white">
                {prod.title}
              </p>
              <p className="mt-1 text-xs text-white/70 line-clamp-2">
                {prod.subtitle}
              </p>
              <a
                href={buildAmazonUrl(prod)}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                onClick={() => onAmazonClick(prod, `sidebar-${idx}`)}
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-2 text-xs font-extrabold text-white transition hover:brightness-110"
              >
                {prod.ctaLabel} →
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[10px] leading-relaxed text-white/60">
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      </aside>
    );
  }

  if (variant === "verdict") {
    const url = buildAmazonUrl(primary);
    return (
      <section
        aria-label="Top Commercial Equipment Recommendation on Amazon"
        className="my-8 rounded-3xl border-2 border-[#0284c7]/35 bg-gradient-to-br from-[#f0f7fb] via-white to-[#ecfccb]/45 p-5 sm:p-7 shadow-[0_20px_50px_-28px_rgba(2,132,199,0.28)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--line)]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#071923] px-3 py-1 text-xs font-extrabold text-[#bef264]">
            {primary.badge}
          </span>
          <span className="text-xs font-bold text-slate-600">
            Amazon US Commercial Gear · ID: {AMAZON_TAG_US}
          </span>
        </div>

        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <div className="flex items-start gap-3.5">
              <CategoryBadgeIcon cat={primary.category} />
              <div>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                  {primary.title}
                </h3>
                <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                  {primary.subtitle}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 rounded-2xl bg-white/95 border border-[var(--line)] p-3.5 text-xs">
              <div>
                <span className="font-extrabold text-occbluedeep uppercase block">
                  Capacity / Size
                </span>
                <span className="text-slate-800 font-semibold">
                  {primary.specs.capacityOrSize}
                </span>
              </div>
              <div>
                <span className="font-extrabold text-emerald-700 uppercase block">
                  Spec / Grade
                </span>
                <span className="text-slate-800 font-semibold">
                  {primary.specs.filtrationOrGrade}
                </span>
              </div>
              <div>
                <span className="font-extrabold text-slate-700 uppercase block">
                  Footprint
                </span>
                <span className="text-slate-800 font-semibold">
                  {primary.specs.footprintOrReach}
                </span>
              </div>
              <div>
                <span className="font-extrabold text-amber-700 uppercase block">
                  Duty Profile
                </span>
                <span className="text-slate-800 font-semibold">
                  {primary.specs.dutyProfile}
                </span>
              </div>
            </div>

            <ul className="mt-4 space-y-1.5 text-xs sm:text-sm text-slate-700">
              {primary.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 font-extrabold text-emerald-700">
                    ✓
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-stretch md:w-64 gap-2.5 rounded-2xl bg-[#071923] p-4 text-white">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 text-center">
              Amazon.com Commercial Listing
            </span>
            <a
              href={url}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              onClick={() => onAmazonClick(primary, "verdict-cta")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ea580c] px-4 py-3.5 text-center font-display text-sm font-extrabold text-white shadow-lg hover:brightness-105 transition"
            >
              <span>{primary.ctaLabel}</span>
              <span aria-hidden>→</span>
            </a>
            <p className="text-[11px] text-center text-white/70 leading-snug">
              As an Amazon Associate I earn from qualifying purchases.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (variant === "vs" && products.length >= 2) {
    const pair = products.slice(0, 2);
    return (
      <section
        aria-label="Head-to-Head Commercial Supply Comparison on Amazon"
        className="my-8 rounded-3xl border border-[var(--line)] bg-[#f8fbfd] p-5 sm:p-7"
      >
        <div className="mb-5">
          <p className="eyebrow">Side-by-Side Equipment Spec Match</p>
          <h3 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            {sectionTitle}
          </h3>
          {sectionSubtitle && (
            <p className="mt-1 text-sm text-[var(--muted)]">{sectionSubtitle}</p>
          )}
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {pair.map((prod, idx) => (
            <div
              key={prod.id}
              className="flex flex-col justify-between rounded-2xl border border-[var(--line)] bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-[#071923] px-2.5 py-0.5 text-[11px] font-bold text-[#bef264]">
                    Option {idx === 0 ? "A" : "B"} · {prod.brand}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {prod.specs.dutyProfile}
                  </span>
                </div>
                <h4 className="mt-3 font-display text-lg font-extrabold text-slate-900">
                  {prod.title}
                </h4>
                <p className="mt-1 text-xs text-slate-600">{prod.subtitle}</p>
                <dl className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3 text-xs">
                  <div>
                    <dt className="font-bold text-slate-500">Capacity</dt>
                    <dd className="font-semibold text-slate-900">
                      {prod.specs.capacityOrSize}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">Grade</dt>
                    <dd className="font-semibold text-slate-900">
                      {prod.specs.filtrationOrGrade}
                    </dd>
                  </div>
                </dl>
              </div>
              <a
                href={buildAmazonUrl(prod)}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                onClick={() => onAmazonClick(prod, `vs-${idx}`)}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ea580c] px-4 py-2.5 text-xs font-extrabold text-white transition hover:brightness-105"
              >
                {prod.ctaLabel} →
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-[var(--muted)]">
          As an Amazon Associate I earn from qualifying purchases. Specs reflect manufacturer listings.
        </p>
      </section>
    );
  }

  // "inline" and "showcase" grid
  return (
    <section
      aria-label={sectionTitle}
      className="my-10 rounded-3xl border border-[var(--line)] bg-gradient-to-b from-white to-[#f0f7fb] p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-end justify-between gap-3 pb-4 border-b border-[var(--line)]">
        <div>
          <p className="eyebrow">Amazon US Commercial Supply Picks</p>
          <h3 className="mt-1 font-display text-xl sm:text-2xl font-extrabold text-slate-900">
            {sectionTitle}
          </h3>
          {sectionSubtitle && (
            <p className="mt-1 text-sm text-[var(--muted)]">{sectionSubtitle}</p>
          )}
        </div>
        <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-[11px] font-bold text-slate-600">
          Affiliate ID: {AMAZON_TAG_US}
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.slice(0, variant === "showcase" ? 6 : 3).map((prod, idx) => (
          <div
            key={prod.id}
            className="card flex flex-col justify-between p-4 sm:p-5"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <CategoryBadgeIcon cat={prod.category} />
                <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-occbluedeep">
                  {prod.brand}
                </span>
              </div>
              <h4 className="mt-3 font-display text-base font-extrabold text-slate-900 leading-snug">
                {prod.title}
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                {prod.subtitle}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-semibold text-slate-700">
                <span className="rounded-md bg-slate-100 px-2 py-0.5">
                  {prod.specs.capacityOrSize}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5">
                  {prod.specs.filtrationOrGrade}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5">
                  {prod.specs.dutyProfile}
                </span>
              </div>
            </div>
            <a
              href={buildAmazonUrl(prod)}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              onClick={() => onAmazonClick(prod, `${variant}-${idx}`)}
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#f59e0b] to-[#ea580c] px-3.5 py-2.5 text-xs font-extrabold text-white transition hover:brightness-105"
            >
              {prod.ctaLabel} →
            </a>
          </div>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-[var(--muted)]">
        As an Amazon Associate I earn from qualifying purchases. Always verify live stock and pack sizing directly on Amazon.com.
      </p>
    </section>
  );
}
