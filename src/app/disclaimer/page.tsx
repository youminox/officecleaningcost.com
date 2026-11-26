import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pricing & Legal Disclaimer | OfficeCleaningCost.com",
  description:
    "Important disclaimer regarding estimated commercial cleaning quotes, local regulations, and contractor vetting.",
  alternates: { canonical: `${SITE_URL}/disclaimer/` },
};

export default function DisclaimerPage() {
  return (
    <SimplePage
      title="Pricing &amp; Legal Disclaimer"
      description="Why online cleaning estimates are planning benchmarks rather than formal bids."
      slug="disclaimer"
    >
      <h2>Estimation Disclaimer</h2>
      <p>
        All per-visit, monthly, and annual cleaning estimates displayed on
        OfficeCleaningCost.com (owned by <strong>{LEGAL_OWNER}</strong>,{" "}
        {LEGAL_LOCATION}, <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>)
        are informational US market benchmarks. Actual contractor quotes vary
        based on walk-through condition, soil buildup, freight elevator
        schedules, union/prevailing wage rules, parking fees, and custom scope
        requests.
      </p>
      <h2>No Legal, Tax, or Compliance Counsel</h2>
      <p>
        Articles covering OSHA Bloodborne Pathogens, Cal/OSHA AB 1978, HIPAA
        BAAs, Workers&apos; Compensation, or tax deductibility are educational
        summaries only. Always consult licensed legal, insurance, or CPA
        advisors before executing vendor agreements.
      </p>
    </SimplePage>
  );
}
