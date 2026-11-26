"use client";

import Link from "next/link";
import { useState } from "react";

interface SearchHit {
  slug: string;
  pillar: string;
  title: string;
  path: string;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchHit[] | null>(null);

  const openSearch = async () => {
    setSearchOpen(true);
    if (!index) {
      try {
        const res = await fetch("/search-index.json");
        if (res.ok) setIndex(await res.json());
      } catch {
        setIndex([]);
      }
    }
  };

  const results =
    query.trim().length >= 2 && index
      ? index
          .filter((item) =>
            `${item.title} ${item.pillar}`
              .toLowerCase()
              .includes(query.toLowerCase())
          )
          .slice(0, 8)
      : [];

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur-md">
        <div className="wrap flex h-[68px] items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-display text-lg font-extrabold tracking-tight text-occink"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0284c7] to-[#071923] text-sm font-black text-[#bef264]">
              OC
            </span>
            <span>
              OfficeCleaning<span className="text-occblue">Cost</span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-6 text-sm font-semibold text-slate-700 lg:flex"
            aria-label="Primary navigation"
          >
            <Link
              href="/office-cleaning-cost-calculator/"
              className="hover:text-occblue transition"
            >
              Cost Calculator
            </Link>
            <Link
              href="/compare-cleaning-quotes/"
              className="hover:text-occblue transition"
            >
              Compare Quotes
            </Link>
            <Link
              href="/city-cleaning-costs/"
              className="hover:text-occblue transition"
            >
              150 City Rates
            </Link>
            <Link
              href="/commercial-vacuums-and-floor-machines/"
              className="hover:text-occblue transition"
            >
              Amazon Gear
            </Link>
            <Link
              href="/office-cleaning-cost-guides/"
              className="hover:text-occblue transition"
            >
              Pricing Guides
            </Link>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={openSearch}
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] bg-occsky text-sm text-occink hover:border-occblue cursor-pointer"
              aria-label="Search guides"
            >
              🔍
            </button>
            <Link
              href="/office-cleaning-cost-calculator/"
              className="btn btn-lime !px-4 !py-2 text-xs hidden sm:inline-flex"
              data-magnetic
            >
              Calculate Cost
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] text-occink lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[var(--line)] bg-white px-5 py-4 lg:hidden">
            <nav className="flex flex-col gap-3 text-sm font-bold text-occink">
              <Link
                href="/office-cleaning-cost-calculator/"
                onClick={() => setMenuOpen(false)}
              >
                Office Cleaning Cost Calculator
              </Link>
              <Link
                href="/compare-cleaning-quotes/"
                onClick={() => setMenuOpen(false)}
              >
                Compare Janitorial Quotes
              </Link>
              <Link
                href="/city-cleaning-costs/"
                onClick={() => setMenuOpen(false)}
              >
                Cost by City (150 Metros)
              </Link>
              <Link
                href="/facility-cleaning-costs/"
                onClick={() => setMenuOpen(false)}
              >
                Cost by Facility Type
              </Link>
              <Link
                href="/commercial-vacuums-and-floor-machines/"
                onClick={() => setMenuOpen(false)}
              >
                Amazon Commercial Equipment
              </Link>
            </nav>
          </div>
        )}
      </header>

      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-20 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-[var(--line)] bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2">
              <input
                type="search"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search 1,213 US office cleaning guides, cities, or gear..."
                className="flex-1 rounded-2xl border border-[var(--line)] bg-occsky px-4 py-3 text-sm font-medium text-occink focus:outline-none focus:border-occblue"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>
            {query.trim().length >= 2 && (
              <div className="mt-4 max-h-80 space-y-2 overflow-y-auto">
                {results.length === 0 ? (
                  <p className="text-xs text-[var(--muted)] p-2">
                    No guides matched &ldquo;{query}&rdquo;. Try a city name, sq ft size, or equipment brand.
                  </p>
                ) : (
                  results.map((r) => (
                    <Link
                      key={r.path}
                      href={r.path}
                      onClick={() => setSearchOpen(false)}
                      className="block rounded-xl border border-[var(--line)] p-3 hover:bg-occsky transition"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-occbluedeep">
                        {r.pillar.replace(/-/g, " ")}
                      </p>
                      <p className="text-sm font-bold text-occink">
                        {r.title}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
