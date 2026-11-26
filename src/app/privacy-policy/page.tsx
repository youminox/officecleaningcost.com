import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy | OfficeCleaningCost.com",
  description:
    "Privacy Policy for OfficeCleaningCost.com covering analytics, AI chat session storage, CCPA rights, and Peru Law No. 29733 compliance.",
  alternates: { canonical: `${SITE_URL}/privacy-policy/` },
};

export default function PrivacyPolicyPage() {
  return (
    <SimplePage
      title="Privacy Policy"
      description="Last updated: November 25, 2026."
      slug="privacy-policy"
    >
      <h2>1. Data Controller</h2>
      <p>
        This website (<strong>OfficeCleaningCost.com</strong>) is owned and
        operated by <strong>{LEGAL_OWNER}</strong>, domiciled in{" "}
        <strong>{LEGAL_LOCATION}</strong>, contact email{" "}
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
      </p>
      <h2>2. Information Collected</h2>
      <ul>
        <li>
          <strong>Calculator &amp; Quote Tool Inputs:</strong> Calculations run
          locally in your browser; inputs inside the interactive calculator are
          not sold to lead brokers.
        </li>
        <li>
          <strong>AI Chat Estimator Messages:</strong> When you send a message
          in our AI chat widget, an anonymous browser visitor ID, the page URL,
          and your chat transcript are processed via Supabase and OpenAI to
          generate your response. Do not submit sensitive personal, payment, or
          confidential employee records in chat.
        </li>
        <li>
          <strong>Advertising &amp; Affiliate Links:</strong> Google AdSense and
          Amazon Associates (<code>officecleaningcost-20</code>) may place
          cookies or read standard referral headers when you view ads or click
          outbound Amazon.com links.
        </li>
      </ul>
      <h2>3. US State Privacy Rights (CCPA/CPRA) &amp; Peru Law No. 29733</h2>
      <p>
        We do not sell personal information. California residents (under the
        CCPA/CPRA) and individuals covered under Peru&apos;s Personal Data
        Protection Law (Law No. 29733) may request access, correction, or
        deletion of any chat session data tied to their visitor identifier by
        emailing <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>.
      </p>
    </SimplePage>
  );
}
