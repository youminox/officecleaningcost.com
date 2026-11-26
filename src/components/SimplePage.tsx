import Header from "./Header";
import Footer from "./Footer";
import Breadcrumbs from "./Breadcrumbs";
import AmazonAffiliateBox from "./AmazonAffiliateBox";
import { getContextualAmazonProducts } from "@/lib/amazon";
import { LEGAL_LINE } from "@/lib/content";

export default function SimplePage({
  title,
  description,
  slug,
  children,
}: {
  title: string;
  description: string;
  slug: string;
  children: React.ReactNode;
}) {
  const products = getContextualAmazonProducts({ slug, count: 1 });
  return (
    <>
      <Header />
      <main className="pt-[68px]">
        <section className="bg-gradient-to-b from-occsky via-white to-white py-12">
          <div className="wrap max-w-4xl">
            <Breadcrumbs items={[{ name: title, href: `/${slug}/` }]} />
            <h1 className="mt-4 text-3xl font-extrabold sm:text-5xl text-occink">
              {title}
            </h1>
            <p className="mt-3 text-lg text-[var(--muted)]">{description}</p>
          </div>
        </section>
        <section className="wrap max-w-4xl pb-12">
          <div className="prose-fx">{children}</div>
          <aside className="mt-8 rounded-2xl border border-[var(--line)] bg-occsky p-5 text-sm text-occink">
            <strong>Site Ownership &amp; Operator Notice:</strong> {LEGAL_LINE}
          </aside>
          <AmazonAffiliateBox
            variant="compact"
            sectionTitle="Top Commercial Office Cleaning Supply Pick on Amazon US"
            products={products}
            source={`legal-${slug}`}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
