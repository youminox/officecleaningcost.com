import type { MetadataRoute } from "next";
import { SITE_URL, getAllContent, absolute } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date("2026-11-25");
  const content = getAllContent().map((a) => ({
    url: `${SITE_URL}${a.path}`,
    lastModified: new Date(a.dateModified),
    changeFrequency: (a.isPillar ? "weekly" : "monthly") as
      | "weekly"
      | "monthly",
    priority: a.isPillar ? 0.9 : a.isTransactional ? 0.85 : 0.75,
    images: a.imageUrl ? [absolute(a.imageUrl)] : undefined,
  }));

  const fixed = [
    { path: "/", p: 1.0, f: "weekly" as const },
    { path: "/office-cleaning-cost-calculator/", p: 0.95, f: "weekly" as const },
    { path: "/compare-cleaning-quotes/", p: 0.9, f: "monthly" as const },
    { path: "/about/", p: 0.5, f: "yearly" as const },
    { path: "/contact/", p: 0.5, f: "yearly" as const },
    { path: "/affiliate-disclosure/", p: 0.4, f: "yearly" as const },
    { path: "/editorial-policy/", p: 0.4, f: "yearly" as const },
    { path: "/disclaimer/", p: 0.3, f: "yearly" as const },
    { path: "/privacy-policy/", p: 0.3, f: "yearly" as const },
    { path: "/cookie-policy/", p: 0.3, f: "yearly" as const },
    { path: "/terms-of-use/", p: 0.3, f: "yearly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.f,
    priority: r.p,
  }));

  return [...fixed, ...content];
}
