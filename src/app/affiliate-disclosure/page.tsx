import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import {
  SITE_URL,
  LEGAL_OWNER,
  LEGAL_LOCATION,
  LEGAL_EMAIL,
  AFFILIATE_DISCLOSURE,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Affiliate Disclosure | OfficeCleaningCost.com",
  description:
    "FTC and Amazon Associates affiliate disclosure for OfficeCleaningCost.com (tag: officecleaningcost-20).",
  alternates: { canonical: `${SITE_URL}/affiliate-disclosure/` },
};

export default function AffiliateDisclosurePage() {
  return (
    <SimplePage
      title="Affiliate Disclosure"
      description="Transparency on how OfficeCleaningCost.com earns commissions from Amazon.com."
      slug="affiliate-disclosure"
    >
      <h2>Amazon Associates Program</h2>
      <p>
        <strong>{AFFILIATE_DISCLOSURE}</strong>
      </p>
      <p>
        OfficeCleaningCost.com, owned and operated by{" "}
        <strong>{LEGAL_OWNER}</strong> ({LEGAL_LOCATION},{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>), participates in the
        Amazon Services LLC Associates Program using US affiliate tracking ID{" "}
        <code>officecleaningcost-20</code>.
      </p>
      <h2>How Affiliate Links Work</h2>
      <p>
        When you click a &ldquo;Check Price on Amazon&rdquo; button or product
        link on our guides, calculator, or AI chat assistant, you are directed
        to Amazon.com. If you complete a qualifying purchase, Amazon pays a
        small referral commission at zero additional cost to you.
      </p>
      <h2>Pricing &amp; Availability Notice</h2>
      <p>
        Product pricing, stock availability, and third-party seller details on
        Amazon.com fluctuate continuously. We intentionally avoid publishing
        static prices or fabricated star counts—always verify live specs and
        pricing directly on Amazon before ordering.
      </p>
    </SimplePage>
  );
}
