import fs from "node:fs";
import path from "node:path";
import categories from "@/data/categories.json";
import keywordMap from "@/data/keyword_map.json";
import cities from "@/data/cities.json";

export const SITE_URL = "https://officecleaningcost.com";
export const SITE_NAME = "OfficeCleaningCost.com";
export const LEGAL_OWNER = "CARLOS LINGAN BORJA";
export const LEGAL_LOCATION = "Lima, Peru";
export const LEGAL_EMAIL = "info@charlielingan.com";
export const LEGAL_LINE =
  "Owned and operated by CARLOS LINGAN BORJA, domiciled in Lima, Peru · Email: info@charlielingan.com";
export const AFFILIATE_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";
export const PUBLISHED = "2026-11-25";
export const VERIFIED_LABEL = "November 25, 2026";

export type Block =
  | { type: "p" | "h2" | "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "table"; caption?: string; headers: string[]; rows: string[][] }
  | {
      type: "callout";
      variant: "benchmark" | "warning" | "compliance" | "tip";
      title?: string;
      text: string;
    }
  | { type: "steps"; items: { name: string; text: string }[] }
  | { type: "cta"; text: string };

export type Article = {
  slug: string;
  pillar: string;
  path: string;
  isPillar: boolean;
  isTransactional: boolean;
  primaryKeyword: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  excerpt: string;
  quickAnswer: string;
  readingMinutes: number;
  image: { prompt: string; alt: string };
  blocks: Block[];
  faqs: { q: string; a: string }[];
  amazonProductIds?: string[];
  sources?: { label: string; url: string }[];
  related: string[];
  datePublished: string;
  dateModified: string;
  imageUrl: string;
  imageUrl640: string;
};

export type Category = (typeof categories)[number];
export type CityBenchmark = (typeof cities)[number];

const DIR = path.join(process.cwd(), "src/content/articles");
const PUBLIC = path.join(process.cwd(), "public");

let cacheList: Article[] | null = null;
let cacheByPath: Map<string, Article> | null = null;
let cacheByKey: Map<string, Article> | null = null;
let cacheByPillar: Map<string, Article[]> | null = null;

function isValidArticle(a: Partial<Article>): a is Article {
  return Boolean(
    a && a.slug && a.pillar && a.path && a.title && Array.isArray(a.blocks)
  );
}

function resolveImageUrls(a: Article): { full: string; small: string } {
  const artFull = path.join(PUBLIC, "img/articles", `${a.slug}.webp`);
  if (fs.existsSync(artFull)) {
    const art640 = path.join(PUBLIC, "img/articles", `${a.slug}-640.webp`);
    return {
      full: `/img/articles/${a.slug}.webp`,
      small: fs.existsSync(art640)
        ? `/img/articles/${a.slug}-640.webp`
        : `/img/articles/${a.slug}.webp`,
    };
  }
  const catPath = path.join(PUBLIC, "img/ambient", `cat-${a.pillar}.webp`);
  if (fs.existsSync(catPath)) {
    return {
      full: `/img/ambient/cat-${a.pillar}.webp`,
      small: `/img/ambient/cat-${a.pillar}.webp`,
    };
  }
  return {
    full: "/img/ambient/og-default.webp",
    small: "/img/ambient/og-default.webp",
  };
}

export function getAllContent(): Article[] {
  if (cacheList) return cacheList;
  const orderMap = new Map<string, number>();
  (keywordMap as Array<{ path: string }>).forEach((k, idx) =>
    orderMap.set(k.path, idx)
  );

  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
    : [];

  const list: Article[] = [];
  const byPath = new Map<string, Article>();
  const byKey = new Map<string, Article>();
  const byPillar = new Map<string, Article[]>();

  for (const f of files) {
    try {
      const a = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
      if (!isValidArticle(a) || byPath.has(a.path)) continue;
      const imgs = resolveImageUrls(a);
      const normalized: Article = {
        ...a,
        isPillar: Boolean(a.isPillar),
        isTransactional: Boolean(a.isTransactional),
        image:
          a.image && a.image.alt ? a.image : { prompt: "", alt: a.title },
        faqs: Array.isArray(a.faqs) ? a.faqs : [],
        related: Array.isArray(a.related) ? a.related : [],
        quickAnswer: a.quickAnswer || a.excerpt || "",
        excerpt: a.excerpt || a.metaDescription || "",
        seoTitle: a.seoTitle || a.title,
        metaDescription: a.metaDescription || a.excerpt || "",
        datePublished: a.datePublished || PUBLISHED,
        dateModified: a.dateModified || PUBLISHED,
        imageUrl: imgs.full,
        imageUrl640: imgs.small,
      };
      list.push(normalized);
      byPath.set(normalized.path, normalized);
      byKey.set(`${normalized.pillar}/${normalized.slug}`, normalized);
      if (!normalized.isPillar) {
        const arr = byPillar.get(normalized.pillar) || [];
        arr.push(normalized);
        byPillar.set(normalized.pillar, arr);
      }
    } catch {
      // skip incomplete json
    }
  }

  list.sort((x, y) => {
    const ix = orderMap.get(x.path) ?? 99999;
    const iy = orderMap.get(y.path) ?? 99999;
    return ix - iy || x.path.localeCompare(y.path);
  });

  for (const arr of byPillar.values()) {
    arr.sort((x, y) => {
      const ix = orderMap.get(x.path) ?? 99999;
      const iy = orderMap.get(y.path) ?? 99999;
      return ix - iy;
    });
  }

  cacheList = list;
  cacheByPath = byPath;
  cacheByKey = byKey;
  cacheByPillar = byPillar;
  return list;
}

export const getCategories = (): Category[] => categories;
export const getCities = (): CityBenchmark[] => cities;
export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);

export const getPillar = (slug: string) => {
  getAllContent();
  return cacheByPath?.get(`/${slug}/`);
};

export const getArticle = (pillar: string, slug: string) => {
  getAllContent();
  return cacheByKey?.get(`${pillar}/${slug}`);
};

export const getArticlesIn = (pillar: string) => {
  getAllContent();
  return cacheByPillar?.get(pillar) || [];
};

export const getByPath = (p: string) => {
  getAllContent();
  return cacheByPath?.get(p);
};

export function safeHref(p: string): string {
  if (getByPath(p)) return p;
  if (
    p === "/office-cleaning-cost-calculator/" ||
    p === "/compare-cleaning-quotes/"
  ) {
    return p;
  }
  const pillar = p.split("/").filter(Boolean)[0];
  if (pillar && getCategory(pillar)) return `/${pillar}/`;
  return "/";
}

export function ambient(name: string, fallback = "/img/ambient/og-default.webp"): string {
  const rel = `/img/ambient/${name}.webp`;
  return fs.existsSync(path.join(PUBLIC, rel)) ? rel : fallback;
}

export const OG_DEFAULT = () => ambient("og-default");

export function absolute(url: string) {
  return url.startsWith("http") ? url : `${SITE_URL}${url}`;
}

export const organizationLd = {
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon.svg`,
  founder: { "@id": `${SITE_URL}/#carlos` },
  areaServed: "US",
  description:
    "Independent US commercial office cleaning cost calculator, 150-city rate index, janitorial quote audit guide, and commercial supply catalog.",
};

export const personLd = {
  "@type": "Person",
  "@id": `${SITE_URL}/#carlos`,
  name: "Carlos Lingan Borja",
  jobTitle: "Publisher & Owner",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Lima",
    addressCountry: "PE",
  },
  email: LEGAL_EMAIL,
  url: `${SITE_URL}/about/`,
};
