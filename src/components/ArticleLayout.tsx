import Link from "next/link";
import Header from "./Header";
import Footer from "./Footer";
import Breadcrumbs, { JsonLd } from "./Breadcrumbs";
import ArticleBody from "./ArticleBody";
import ArticleCard from "./ArticleCard";
import AmazonAffiliateBox from "./AmazonAffiliateBox";
import ClientEffects from "./ClientEffects";
import ReadingProgress from "./ReadingProgress";
import OpenChatButton from "./OpenChatButton";
import ResponsiveImg from "./ResponsiveImg";
import { slugify, stripMd } from "./Inline";
import { getContextualAmazonProducts, buildAmazonUrl } from "@/lib/amazon";
import type { Article, Block } from "@/lib/content";
import {
  SITE_URL,
  LEGAL_OWNER,
  absolute,
  getArticlesIn,
  getByPath,
  getCategory,
  safeHref,
} from "@/lib/content";

const fmt = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

export default function ArticleLayout({ a }: { a: Article }) {
  const cat = getCategory(a.pillar)!;
  const url = `${SITE_URL}${a.path}`;
  const h2s = a.blocks.filter((b) => b.type === "h2") as {
    type: "h2";
    text: string;
  }[];
  const steps = a.blocks.find((b) => b.type === "steps") as
    | { type: "steps"; items: { name: string; text: string }[] }
    | undefined;
  const related = a.related
    .map((p) => getByPath(p))
    .filter(Boolean) as Article[];
  const children = a.isPillar ? getArticlesIn(a.pillar) : [];
  const crumbs = a.isPillar
    ? [{ name: cat.name, href: `/${cat.slug}/` }]
    : [
        { name: cat.name, href: `/${cat.slug}/` },
        { name: a.title, href: a.path },
      ];
  const image = absolute(a.imageUrl);

  const h2Indices = a.blocks
    .map((b, idx) => (b.type === "h2" ? idx : -1))
    .filter((idx) => idx >= 0);
  const splitIndex =
    h2Indices.length >= 3
      ? h2Indices[2]
      : h2Indices.length >= 2
      ? h2Indices[1]
      : Math.ceil(a.blocks.length / 2);
  const firstHalfBlocks: Block[] = a.blocks.slice(0, splitIndex);
  const secondHalfBlocks: Block[] = a.blocks.slice(splitIndex);

  const products = getContextualAmazonProducts({
    productIds: a.amazonProductIds,
    pillar: a.pillar,
    slug: a.slug,
    count: a.isTransactional ? 6 : 3,
  });

  const isVsPage = a.isTransactional && a.slug.includes("-vs-");

  const graph: Record<string, unknown>[] = [
    {
      "@type": a.isPillar ? "CollectionPage" : "Article",
      "@id": `${url}#article`,
      ...(a.isPillar ? { name: a.title } : { headline: a.title }),
      description: a.metaDescription,
      image,
      inLanguage: "en-US",
      datePublished: a.datePublished,
      dateModified: a.dateModified,
      author: { "@id": `${SITE_URL}/#carlos` },
      publisher: { "@id": `${SITE_URL}/#org` },
      mainEntityOfPage: url,
      ...(a.isPillar
        ? {
            hasPart: children.slice(0, 60).map((c) => ({
              "@type": "Article",
              headline: c.title,
              url: `${SITE_URL}${c.path}`,
            })),
          }
        : {}),
    },
  ];
  if (a.faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: a.faqs.map((f) => ({
        "@type": "Question",
        name: stripMd(f.q),
        acceptedAnswer: { "@type": "Answer", text: stripMd(f.a) },
      })),
    });
  }
  if (steps) {
    graph.push({
      "@type": "HowTo",
      "@id": `${url}#howto`,
      name: a.title,
      image,
      totalTime: "PT10M",
      step: steps.items.map((s, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: s.name,
        text: stripMd(s.text),
      })),
    });
  }
  if (a.isTransactional && products.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${url}#products`,
      name: a.title,
      itemListElement: products.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.title,
        url: buildAmazonUrl(p),
      })),
    });
  }

  return (
    <>
      <ReadingProgress />
      <Header />
      <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
      <main className="pt-[68px]">
        <section className="relative overflow-hidden bg-gradient-to-b from-occsky via-white to-white">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-occblue/10 blur-3xl" />
          <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-occemerald/10 blur-3xl" />
          <div className="wrap relative pb-10 pt-10">
            <Breadcrumbs items={crumbs} />
            <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/${cat.slug}/`} className="eyebrow hover:underline">
                    {a.isPillar ? "Silo Hub" : cat.name}
                  </Link>
                  {a.isTransactional && (
                    <span className="rounded-full bg-amber-300/90 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-950">
                      Amazon US Commercial Buying Guide
                    </span>
                  )}
                </div>
                <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.06] sm:text-5xl">
                  {a.title}
                </h1>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--muted)]">
                  <span>
                    Published by{" "}
                    <Link
                      href="/about/"
                      className="font-semibold text-occink hover:text-occblue"
                    >
                      {LEGAL_OWNER}
                    </Link>
                  </span>
                  <span aria-hidden>·</span>
                  <time dateTime={a.dateModified}>
                    Updated {fmt(a.dateModified)}
                  </time>
                  <span aria-hidden>·</span>
                  <span>{a.readingMinutes || 7} min read</span>
                </div>
                <div className="mt-6 rounded-2xl border-l-4 border-occblue bg-white p-5 shadow-[0_10px_40px_-25px_rgba(2,132,199,0.4)]">
                  <p className="text-xs font-bold uppercase tracking-wider text-occbluedeep">
                    Quick Answer
                  </p>
                  <p className="mt-1.5 text-[1.02rem] leading-relaxed text-occink">
                    {stripMd(a.quickAnswer)}
                  </p>
                </div>
              </div>

              <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-2xl border border-[var(--line)] bg-occsky">
                <ResponsiveImg
                  src={a.imageUrl}
                  src640={a.imageUrl640}
                  alt={a.image.alt}
                  width={1200}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 560px"
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <div className="wrap grid grid-cols-1 gap-12 pb-10 lg:grid-cols-[minmax(0,1fr)_310px]">
          <article className="min-w-0">
            {isVsPage ? (
              <AmazonAffiliateBox
                variant="vs"
                sectionTitle="Head-to-Head Commercial Spec Comparison on Amazon"
                sectionSubtitle="Compare verified capacity, filtration, and commercial duty specs directly on Amazon.com."
                products={products}
                source={a.slug}
              />
            ) : a.isTransactional ? (
              <AmazonAffiliateBox
                variant="verdict"
                sectionTitle="Top Commercial Recommendation on Amazon US"
                products={products}
                source={a.slug}
              />
            ) : null}

            {h2s.length > 2 && (
              <details className="toc mb-6 rounded-2xl border border-[var(--line)] p-4 text-sm lg:hidden">
                <summary className="cursor-pointer font-display font-bold text-occink">
                  In this guide
                </summary>
                <ol className="mt-3 space-y-2">
                  {h2s.map((h) => (
                    <li key={h.text}>
                      <a href={`#${slugify(h.text)}`}>{stripMd(h.text)}</a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <ArticleBody blocks={firstHalfBlocks} source={a.slug} />

            <AmazonAffiliateBox
              variant="inline"
              sectionTitle={
                a.isTransactional
                  ? "Compare Top-Rated Commercial Picks on Amazon US"
                  : "Recommended Commercial Equipment & Supplies for This Scope"
              }
              sectionSubtitle="Commercial-grade supplies matched to this guide (Amazon.com affiliate ID: officecleaningcost-20)."
              products={products}
              source={a.slug}
            />

            {secondHalfBlocks.length > 0 && (
              <ArticleBody blocks={secondHalfBlocks} source={`${a.slug}-b`} />
            )}

            {a.isPillar && children.length > 0 && (
              <section className="mt-14">
                <h2
                  className="font-display text-3xl font-extrabold"
                  id="all-guides"
                >
                  All Guides in {cat.name} ({children.length})
                </h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  {children.map((c) => (
                    <ArticleCard key={c.path} a={c} />
                  ))}
                </div>
              </section>
            )}

            {a.faqs?.length > 0 && (
              <section className="mt-14" aria-labelledby="faq">
                <h2 id="faq" className="font-display text-3xl font-extrabold">
                  Frequently Asked Questions
                </h2>
                <div className="mt-5 space-y-3">
                  {a.faqs.map((f) => (
                    <details key={f.q} className="card group p-5">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
                        {stripMd(f.q)}
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-occsky text-occblue transition group-open:rotate-45">
                          +
                        </span>
                      </summary>
                      <p className="mt-3 text-[var(--muted)]">{stripMd(f.a)}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            <AmazonAffiliateBox
              variant={a.isTransactional ? "showcase" : "compact"}
              sectionTitle="Facility Equipment & Supply Picks on Amazon US"
              sectionSubtitle="Stock your janitorial closet or audit vendor supply lists."
              products={products}
              source={`${a.slug}-end`}
            />

            <div className="mt-10 rounded-3xl bg-gradient-to-r from-[#071923] to-[#0369a1] p-6 text-white sm:flex sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#bef264]">
                  Interactive US Pricing Tools
                </p>
                <p className="mt-1 font-display text-xl font-extrabold">
                  Calculate your exact office cleaning quote in 30 seconds
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                <Link
                  href="/office-cleaning-cost-calculator/"
                  className="btn btn-lime !px-5 !py-2.5 text-xs"
                >
                  Cost Calculator
                </Link>
                <OpenChatButton
                  prompt={`Explain ${a.title} for a 5,000 sq ft US office`}
                  className="btn btn-glass !px-5 !py-2.5 text-xs"
                >
                  Ask AI Estimator
                </OpenChatButton>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-14">
                <h2 className="font-display text-2xl font-extrabold">
                  Related Guides
                </h2>
                <div className="mt-5 grid gap-5 sm:grid-cols-2">
                  {related.slice(0, 4).map((r) => (
                    <ArticleCard key={r.path} a={r} />
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-5">
              {h2s.length > 2 && (
                <nav
                  className="toc rounded-2xl border border-[var(--line)] p-5 text-sm"
                  aria-label="Table of contents"
                >
                  <p className="mb-3 font-display font-bold text-occink">
                    In This Guide
                  </p>
                  <ol className="space-y-2">
                    {h2s.map((h) => (
                      <li key={h.text}>
                        <a href={`#${slugify(h.text)}`}>{stripMd(h.text)}</a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              <div className="rounded-2xl border border-[var(--line)] bg-occsky p-5">
                <p className="font-display text-base font-extrabold text-occink">
                  Estimate Your Office Rate
                </p>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Enter sq ft, restrooms, floor type, and weekly frequency for an
                  instant per-visit &amp; monthly budget.
                </p>
                <Link
                  href={safeHref("/office-cleaning-cost-calculator/")}
                  className="btn btn-buy mt-4 w-full !py-2.5 text-xs"
                >
                  Open Cost Calculator →
                </Link>
              </div>

              <AmazonAffiliateBox
                variant="sidebar"
                sectionTitle="Amazon Commercial Gear"
                products={products}
                source={a.slug}
              />
            </div>
          </aside>
        </div>
      </main>
      <Footer />
      <ClientEffects />
    </>
  );
}
