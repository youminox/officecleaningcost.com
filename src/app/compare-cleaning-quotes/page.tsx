import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuoteComparisonTool from "@/components/QuoteComparisonTool";
import ClientEffects from "@/components/ClientEffects";
import { SITE_URL, OG_DEFAULT } from "@/lib/content";

export const metadata: Metadata = {
  title:
    "Compare Office Cleaning Quotes Side-by-Side | Bid Audit Checklist",
  description:
    "Audit up to 3 commercial janitorial proposals on implied per-sq-ft cost, consumables inclusion, General Liability, Workers' Comp, bonding, and contract exit clauses.",
  alternates: { canonical: `${SITE_URL}/compare-cleaning-quotes/` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/compare-cleaning-quotes/`,
    images: [{ url: OG_DEFAULT(), width: 1200, height: 800 }],
  },
};

export default function CompareQuotesPage() {
  return (
    <>
      <Header />
      <main className="pt-[68px]">
        <section className="bg-gradient-to-b from-occsky via-white to-white py-12">
          <div className="wrap">
            <Breadcrumbs
              items={[
                {
                  name: "Compare Cleaning Quotes",
                  href: "/compare-cleaning-quotes/",
                },
              ]}
            />
            <h1 className="mt-4 text-3xl font-extrabold text-occink sm:text-5xl">
              Compare Janitorial Quotes Side-by-Side
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">
              Plug in up to three commercial cleaning proposals to verify
              per-visit math, detect uninsured 1099 subcontractor risks, and
              spot hidden supply markups.
            </p>
          </div>
        </section>

        <section className="wrap pb-16">
          <QuoteComparisonTool />
        </section>
      </main>
      <Footer />
      <ClientEffects />
    </>
  );
}
