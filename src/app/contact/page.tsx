import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import OpenChatButton from "@/components/OpenChatButton";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact Us | OfficeCleaningCost.com",
  description:
    "Contact CARLOS LINGAN BORJA regarding OfficeCleaningCost.com editorial guides, benchmark data, privacy requests, or advertising.",
  alternates: { canonical: `${SITE_URL}/contact/` },
};

export default function ContactPage() {
  return (
    <SimplePage
      title="Contact Us"
      description="Reach the editorial and technical team behind OfficeCleaningCost.com."
      slug="contact"
    >
      <h2>Direct Email Contact</h2>
      <p>
        OfficeCleaningCost.com is owned and operated by{" "}
        <strong>{LEGAL_OWNER}</strong>, domiciled in{" "}
        <strong>{LEGAL_LOCATION}</strong>.
      </p>
      <ul>
        <li>
          <strong>General, Editorial &amp; Legal Inquiries:</strong>{" "}
          <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
        </li>
        <li>
          <strong>Typical Response Window:</strong> 1–2 business days (Mon–Fri,
          9:00 AM–6:00 PM EST/PET).
        </li>
      </ul>
      <h2>Need an Immediate Estimate?</h2>
      <p>
        For instant questions about square-footage pricing, restroom counts, or
        comparing two commercial bids, launch our English AI Cost Estimator below:
      </p>
      <p>
        <OpenChatButton className="btn btn-buy">
          Open AI Cost Estimator →
        </OpenChatButton>
      </p>
    </SimplePage>
  );
}
