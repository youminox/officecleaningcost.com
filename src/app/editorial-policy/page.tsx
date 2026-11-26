import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Editorial Policy | OfficeCleaningCost.com",
  description:
    "How we calculate office cleaning benchmarks, avoid keyword overlap, and evaluate commercial supplies.",
  alternates: { canonical: `${SITE_URL}/editorial-policy/` },
};

export default function EditorialPolicyPage() {
  return (
    <SimplePage
      title="Editorial Policy"
      description="Our methodology for pricing accuracy, city indexes, and commercial equipment reviews."
      slug="editorial-policy"
    >
      <h2>1. Unified Pricing Model</h2>
      <p>
        Every cost range published across OfficeCleaningCost.com—owned by{" "}
        <strong>{LEGAL_OWNER}</strong> ({LEGAL_LOCATION},{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>)—draws from one
        transparent mathematical model factoring square-footage economies of
        scale, ISSA cleaning production benchmarks (~3,500 sq ft/hr), restroom
        fixture times, surface multipliers, and metro wage differences.
      </p>
      <h2>2. Equipment Evaluation Independence</h2>
      <p>
        Our 200 commercial equipment and supply buying guides focus on objective
        manufacturer specifications: tank/bag capacity, HEPA filtration seals,
        decibel ratings for daytime cleaning, NSF/NFSI or EPA List N
        certifications, and dispenser roll compatibility. Editorial conclusions
        are never paid placements.
      </p>
      <h2>3. Corrections &amp; Updates</h2>
      <p>
        Notice an outdated municipal wage ordinance or product spec update?
        Email <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a> and we will
        audit and update the affected guide.
      </p>
    </SimplePage>
  );
}
