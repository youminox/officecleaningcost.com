import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticleLayout from "@/components/ArticleLayout";
import {
  SITE_URL,
  absolute,
  getAllContent,
  getArticle,
} from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllContent()
    .filter((a) => !a.isPillar)
    .map((a) => ({ categoria: a.pillar, slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}): Promise<Metadata> {
  const { categoria, slug } = await params;
  const a = getArticle(categoria, slug);
  if (!a) return {};
  return {
    title: a.seoTitle || a.title,
    description: a.metaDescription || a.excerpt,
    alternates: { canonical: `${SITE_URL}${a.path}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}${a.path}`,
      title: a.seoTitle || a.title,
      description: a.metaDescription || a.excerpt,
      publishedTime: a.datePublished,
      modifiedTime: a.dateModified,
      images: [
        {
          url: absolute(a.imageUrl),
          width: 1200,
          height: 800,
          alt: a.image.alt,
        },
      ],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;
  const a = getArticle(categoria, slug);
  if (!a) notFound();
  return <ArticleLayout a={a} />;
}
