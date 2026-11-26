import type { Metadata } from "next";
import SimplePage from "@/components/SimplePage";
import { SITE_URL, LEGAL_OWNER, LEGAL_LOCATION, LEGAL_EMAIL } from "@/lib/content";

export const metadata: Metadata = {
  title: "Cookie Policy | OfficeCleaningCost.com",
  description:
    "How OfficeCleaningCost.com uses local storage, essential session tokens, advertising cookies, and Amazon affiliate attribution.",
  alternates: { canonical: `${SITE_URL}/cookie-policy/` },
};

export default function CookiePolicyPage() {
  return (
    <SimplePage
      title="Cookie Policy"
      description="How cookies and browser storage work on OfficeCleaningCost.com."
      slug="cookie-policy"
    >
      <h2>1. Operator Details</h2>
      <p>
        OfficeCleaningCost.com is owned by <strong>{LEGAL_OWNER}</strong>,
        domiciled in <strong>{LEGAL_LOCATION}</strong> (
        <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>).
      </p>
      <h2>2. Types of Storage &amp; Cookies</h2>
      <ul>
        <li>
          <strong>Essential Local Storage:</strong> Stores your anonymous AI
          chat visitor/session ID (`occ_visitor_id`, `occ_chat_session_id`) so
          your active conversation persists across page views.
        </li>
        <li>
          <strong>Advertising Cookies (Google AdSense):</strong> Google and its
          partners use cookies to serve ads based on prior visits. You can
          manage personalized ad preferences via Google Ad Settings.
        </li>
        <li>
          <strong>Affiliate Attribution (Amazon.com):</strong> Clicking any
          outbound Amazon product button sets Amazon&apos;s standard referral
          attribution cookie for 24 hours under tag{" "}
          <code>officecleaningcost-20</code>.
        </li>
      </ul>
      <h2>3. Managing Cookies</h2>
      <p>
        You may block or clear cookies and local storage anytime through your
        browser settings without losing access to our calculators or pricing
        guides.
      </p>
    </SimplePage>
  );
}
