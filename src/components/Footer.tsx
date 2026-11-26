import Link from "next/link";
import {
  AFFILIATE_DISCLOSURE,
  LEGAL_EMAIL,
  LEGAL_LINE,
  getCategories,
} from "@/lib/content";

export default function Footer() {
  const cats = getCategories();
  return (
    <footer className="mt-20 bg-[#071923] text-white">
      <div className="wrap py-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 font-display text-xl font-extrabold text-white"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#0284c7] to-[#10b981] text-sm font-black text-[#071923]">
                OC
              </span>
              <span>OfficeCleaningCost.com</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Independent US commercial cleaning cost estimator, 150-city rate
              benchmarks, janitorial quote audit checklists, and commercial
              equipment buying guides.
            </p>
            <p className="mt-4 rounded-xl border border-white/15 bg-white/5 p-3 text-xs text-white/80">
              <strong className="text-[#bef264]">Amazon Disclosure:</strong>{" "}
              {AFFILIATE_DISCLOSURE} Affiliate tracking ID:{" "}
              <code>officecleaningcost-20</code> (Amazon.com US).
            </p>
          </div>

          <div>
            <p className="font-display text-sm font-extrabold uppercase tracking-wider text-[#bef264]">
              Tools & Pricing Silos
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link
                  href="/office-cleaning-cost-calculator/"
                  className="hover:text-white"
                >
                  Office Cleaning Cost Calculator
                </Link>
              </li>
              <li>
                <Link
                  href="/compare-cleaning-quotes/"
                  className="hover:text-white"
                >
                  Compare Cleaning Quotes
                </Link>
              </li>
              {cats.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}/`} className="hover:text-white">
                    {c.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-extrabold uppercase tracking-wider text-[#bef264]">
              More Guides & Amazon Picks
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              {cats.slice(6).map((c) => (
                <li key={c.slug}>
                  <Link href={`/${c.slug}/`} className="hover:text-white">
                    {c.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-display text-sm font-extrabold uppercase tracking-wider text-[#bef264]">
              Company & Legal Policies
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/75">
              <li>
                <Link href="/about/" className="hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact/" className="hover:text-white">
                  Contact ({LEGAL_EMAIL})
                </Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure/" className="hover:text-white">
                  Affiliate Disclosure
                </Link>
              </li>
              <li>
                <Link href="/editorial-policy/" className="hover:text-white">
                  Editorial Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy/" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookie-policy/" className="hover:text-white">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-of-use/" className="hover:text-white">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/disclaimer/" className="hover:text-white">
                  Pricing Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/15 pt-6 text-xs text-white/65 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>{LEGAL_LINE}</p>
          <p>
            © {new Date().getFullYear()} OfficeCleaningCost.com · All estimates
            are informational US market benchmarks.
          </p>
        </div>
      </div>
    </footer>
  );
}
