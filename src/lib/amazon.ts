import productsData from "@/data/amazon-products.json";

export const AMAZON_TAG_US = "officecleaningcost-20";

export interface AmazonProduct {
  id: string;
  category: string;
  badge: string;
  brand: string;
  title: string;
  subtitle: string;
  specs: {
    capacityOrSize: string;
    filtrationOrGrade: string;
    footprintOrReach: string;
    dutyProfile: string;
  };
  features: string[];
  bestForFloor: string;
  queryUS: string;
  ctaLabel: string;
}

export const AMAZON_PRODUCTS: AmazonProduct[] = productsData as AmazonProduct[];

const BY_ID = new Map<string, AmazonProduct>(
  AMAZON_PRODUCTS.map((p) => [p.id, p])
);

export function buildAmazonUrl(product: AmazonProduct): string {
  return `https://www.amazon.com/s?k=${encodeURIComponent(
    product.queryUS
  )}&tag=${AMAZON_TAG_US}`;
}

export function getAmazonProductById(id: string): AmazonProduct | undefined {
  return BY_ID.get(id);
}

export function getProductsByIds(ids?: string[], count = 3): AmazonProduct[] {
  const out: AmazonProduct[] = [];
  const used = new Set<string>();
  if (Array.isArray(ids)) {
    for (const id of ids) {
      const p = BY_ID.get(id);
      if (p && !used.has(p.id)) {
        used.add(p.id);
        out.push(p);
      }
    }
  }
  for (const p of AMAZON_PRODUCTS) {
    if (out.length >= count) break;
    if (!used.has(p.id)) {
      used.add(p.id);
      out.push(p);
    }
  }
  return out.slice(0, Math.max(count, out.length));
}

export function getContextualAmazonProducts(opts: {
  productIds?: string[];
  pillar?: string;
  slug?: string;
  flooring?: string;
  count?: number;
}): AmazonProduct[] {
  const count = opts.count ?? 3;
  if (opts.productIds && opts.productIds.length > 0) {
    return getProductsByIds(opts.productIds, count);
  }

  const hay = `${opts.pillar || ""} ${opts.slug || ""} ${opts.flooring || ""}`.toLowerCase();
  const scored = AMAZON_PRODUCTS.map((p, idx) => {
    let score = 0;
    if (opts.flooring && p.bestForFloor === opts.flooring) score += 8;
    if (/vacuum|carpet|extractor|allergen/.test(hay) && (p.category === "backpack-vacuums" || p.category === "upright-vacuums" || p.category === "carpet-extractors")) score += 6;
    if (/vct|vinyl|wax|strip|burnish|scrubber|concrete|hardwood|tile|grout/.test(hay) && (p.category === "floor-machines" || p.category === "mops-and-buckets")) score += 6;
    if (/restroom|bathroom|toilet|soap|paper|towel|breakroom/.test(hay) && (p.category === "restroom-dispensers" || p.category === "paper-and-liners")) score += 6;
    if (/green|osha|disinfect|sanitiz|compliance|medical|dental/.test(hay) && (p.category === "chemicals-disinfectants" || p.category === "air-purifiers")) score += 6;
    if (/cart|janitor|in-house|quote|supply|mat|window|glass/.test(hay) && (p.category === "carts-and-bins" || p.category === "cloths-window-safety" || p.category === "entrance-mats")) score += 5;
    // deterministic tie-breaker spread by slug hash
    const hash = Array.from(hay).reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) % 997, 7);
    return { p, score: score * 100 - ((idx + hash) % 37) };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, count).map((s) => s.p);
}
