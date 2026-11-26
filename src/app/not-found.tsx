import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AmazonAffiliateBox from "@/components/AmazonAffiliateBox";
import { getContextualAmazonProducts } from "@/lib/amazon";

export default function NotFound() {
  const products = getContextualAmazonProducts({ slug: "not-found", count: 1 });
  return (
    <>
      <Header />
      <main className="pt-[68px]">
        <section className="wrap py-20 max-w-3xl text-center">
          <p className="eyebrow">404 — Page Not Found</p>
          <h1 className="mt-3 text-4xl font-extrabold text-occink sm:text-5xl">
            That cleaning guide moved or does not exist.
          </h1>
          <p className="mt-4 text-[var(--muted)]">
            Jump straight into our US Office Cleaning Cost Calculator or explore
            our 150 city pricing guides.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/office-cleaning-cost-calculator/" className="btn btn-lime">
              Open Cost Calculator
            </Link>
            <Link href="/" className="btn btn-ghost">
              Back to Home
            </Link>
          </div>
          <div className="mt-10 text-left">
            <AmazonAffiliateBox
              variant="compact"
              sectionTitle="Recommended Commercial Supply"
              products={products}
              source="404"
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
