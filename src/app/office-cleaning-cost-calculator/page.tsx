import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs, { JsonLd } from "@/components/Breadcrumbs";
import CalculatorWidget from "@/components/CalculatorWidget";
import ClientEffects from "@/components/ClientEffects";
import { SITE_URL, OG_DEFAULT } from "@/lib/content";

export const metadata: Metadata = {
  title:
    "Office Cleaning Cost Calculator (2026–2027) | Per-Visit & Monthly Quotes",
  description:
    "Free US commercial cleaning cost estimator. Enter square footage, restroom count, floor surface, weekly frequency, and city to compute per-visit and monthly budgets.",
  alternates: { canonical: `${SITE_URL}/office-cleaning-cost-calculator/` },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/office-cleaning-cost-calculator/`,
    images: [{ url: OG_DEFAULT(), width: 1200, height: 800 }],
  },
};

export default function CalculatorPage() {
  return (
    <>
      <Header />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Office Cleaning Cost Calculator",
          url: `${SITE_URL}/office-cleaning-cost-calculator/`,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }}
      />
      <main className="pt-[68px]">
        <section className="bg-gradient-to-b from-occsky via-white to-white py-12">
          <div className="wrap">
            <Breadcrumbs
              items={[
                {
                  name: "Office Cleaning Cost Calculator",
                  href: "/office-cleaning-cost-calculator/",
                },
              ]}
            />
            <h1 className="mt-4 text-3xl font-extrabold text-occink sm:text-5xl">
              Office Cleaning Cost Calculator
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">
              Calculate realistic US janitorial budgets per visit, per month,
              and per year based on square footage, restrooms, flooring type,
              weekly schedule, and 150 local city wage indexes.
            </p>
          </div>
        </section>

        <section className="wrap pb-16">
          <CalculatorWidget />
        </section>
      </main>
      <Footer />
      <ClientEffects />
    </>
  );
}
