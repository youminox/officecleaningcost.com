import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Use | OfficeCleaningCost.com",
  description:
    "Terms and conditions governing the use of OfficeCleaningCost.com calculators, city guides, and AI estimator.",
  alternates: { canonical: `${SITE_URL}/terms-of-use/` },
};

export default function TermsOfUsePage() {
  return (
    <SimplePage
      title="Terms of Use"
      description="Conditions for using OfficeCleaningCost.com calculators, tools, and content."
      slug="terms-of-use"
    >
      <h2>1. Acceptance &amp; Ownership</h2>
      <p>
        By accessing OfficeCleaningCost.com—owned and operated by{" "}
        <strong>{LEGAL_OWNER}</strong>, domiciled in{" "}
        <strong>{LEGAL_LOCATION}</strong> (
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>)—you agree to these
        Terms of Use.
      </p>
      <h2>2. Informational Benchmarks Only</h2>
      <p>
        All calculator figures, hourly wage indexes, and quote audit rubrics are
        informational planning estimates, not binding commercial bids, legal
        advice, or OSHA regulatory counsel. Always obtain written Certificates of
        Insurance and signed scopes of work directly from licensed contractors.
      </p>
      <h2>3. Intellectual Property</h2>
      <p>
        All custom calculators, structured cost tables, editorial guides, and
        site code are copyright {LEGAL_OWNER}. You may link to or cite short
        benchmarks with clear attribution to OfficeCleaningCost.com.
      </p>
    </SimplePage>
  );
}
