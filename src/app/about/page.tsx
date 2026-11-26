import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "About OfficeCleaningCost.com | Publisher & Methodology",
  description:
    "Learn who runs OfficeCleaningCost.com, how our US commercial cleaning cost benchmarks are modeled, and our independence standards.",
  alternates: { canonical: `${SITE_URL}/about/` },
};

export default function AboutPage() {
  return (
    <SimplePage
      title="About OfficeCleaningCost.com"
      description="Transparent commercial office cleaning cost benchmarks for US business owners, office managers, and facility directors."
      slug="about"
    >
      <h2>Our Mission</h2>
      <p>
        OfficeCleaningCost.com helps US companies estimate realistic per-visit
        and monthly janitorial budgets before requesting vendor proposals. Every
        rate table on this site connects directly to a unified calculation model
        covering office square footage brackets, restroom surcharges, flooring
        types, weekly schedules, and 150 local US metro multipliers.
      </p>
      <h2>Owner &amp; Operator</h2>
      <p>
        This website is owned and operated by <strong>{LEGAL_OWNER}</strong>,
        domiciled in <strong>{LEGAL_LOCATION}</strong>. For editorial inquiries,
        benchmark corrections, or partnership questions, reach us directly at{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
      </p>
      <h2>How We Sustain This Resource</h2>
      <p>
        All calculators, quote audit checklists, and city pricing guides are
        100% free. We fund ongoing maintenance through display advertising and
        the Amazon Services LLC Associates Program (tracking ID{" "}
        <code>officecleaningcost-20</code>), recommending commercial-grade
        vacuums, dispensers, and supplies sold on Amazon.com.
      </p>
    </SimplePage>
  );
}
