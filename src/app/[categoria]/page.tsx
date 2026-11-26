import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/ArticleLayout";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import ArticleCard from "@/components/ArticleCard";
import AmazonAffiliateBox from "@/components/AmazonAffiliateBox";
import { getContextualAmazonProducts } from "@/lib/amazon";
import {
  SITE_URL,
  OG_DEFAULT,
  absolute,
  getArticlesIn,
  getCategories,
  getCategory,
  getPillar,
} from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string }>;
}): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  const p = getPillar(categoria);
  if (!cat) return {};
  const title = p?.seoTitle || `${cat.name} | OfficeCleaningCost.com`;
  const description = p?.metaDescription || cat.description;
  const img = p ? absolute(p.imageUrl) : absolute(OG_DEFAULT());
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/${cat.slug}/` },
    openGraph: {
      type: "website",
      url: `${SITE_URL}/${cat.slug}/`,
      title,
      description,
      images: [{ url: img, width: 1200, height: 800 }],
    },
  };
}

export default async function PillarPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria } = await params;
  const cat = getCategory(categoria);
  if (!cat) notFound();

  const p = getPillar(categoria);
  if (p) return <ArticleLayout a={p} />;

  // Fallback collection view if pillar JSON hasn't been authored yet
  const children = getArticlesIn(categoria);
  const products = getContextualAmazonProducts({
    pillar: cat.slug,
    count: 3,
  });

  return (
    <>
      <Header />
      <main className="pt-[68px]">
        <section className="bg-gradient-to-b from-occsky via-white to-white py-12">
          <div className="wrap">
            <Breadcrumbs items={[{ name: cat.name, href: `/${cat.slug}/` }]} />
            <p className="eyebrow mt-4">{cat.eyebrow}</p>
            <h1 className="mt-2 text-4xl font-extrabold text-occink sm:text-5xl">
              {cat.name}
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-[var(--muted)]">
              {cat.description}
            </p>
          </div>
        </section>

        <section className="wrap pb-14">
          <AmazonAffiliateBox
            variant="inline"
            sectionTitle={`Top Commercial Supplies for ${cat.shortName}`}
            products={products}
            source={`pillar-${cat.slug}`}
          />
          {children.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {children.map((a) => (
                <ArticleCard key={a.path} a={a} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
