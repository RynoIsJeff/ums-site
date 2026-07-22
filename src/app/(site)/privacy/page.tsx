import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — UMS",
  description:
    "How Ultimate Marketing Smash (Pty) Ltd collects, uses, and protects your personal information in compliance with the Protection of Personal Information Act (POPIA).",
};

export default function PrivacyPage() {
  return (
    <main className="bg-white py-16">
      <div className="container max-w-3xl">
        <span className="kicker">Legal</span>
        <h1 className="mt-2 text-4xl font-bold">Privacy Policy</h1>
        <p className="mt-3 text-sm text-black/50">Effective date: 22 July 2026 · Last updated: 22 July 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none text-black/80 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-black [&_p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc">

          <p>
            Ultimate Marketing Smash (Pty) Ltd (<strong>"UMS"</strong>, <strong>"we"</strong>, <strong>"us"</strong>, or
            <strong>"our"</strong>) is committed to protecting your privacy and handling your personal information
            responsibly. This Privacy Policy explains what information we collect, how we use it, and your rights in
            terms of the <strong>Protection of Personal Information Act 4 of 2013 (POPIA)</strong> and other applicable
            South African privacy legislation.
          </p>
          <p>
            By using our website at{" "}
            <a href="https://ultimatemarketingsmash.com" className="text-(--primary) hover:underline">
              ultimatemarketingsmash.com
            </a>{" "}
            or engaging our services, you agree to the collection and use of information in accordance with this policy.
          </p>

          <h2>1. Who We Are</h2>
          <p>
            Ultimate Marketing Smash (Pty) Ltd is a South African digital studio offering web and app development,
            digital marketing, social media management, and advertising services. We are registered in South Africa and
            our principal place of business is Pongola, KwaZulu-Natal.
          </p>
          <p>
            <strong>Information Officer:</strong> Ryno van der Walt
            <br />
            <strong>Email:</strong>{" "}
            <a href="mailto:Manager@ultimatemarketingsmash.com" className="text-(--primary) hover:underline">
              Manager@ultimatemarketingsmash.com
            </a>
          </p>

          <h2>2. Information We Collect</h2>

          <h3>2.1 Information you provide directly</h3>
          <p>When you contact us through our website contact form or by email, we collect:</p>
          <ul>
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your phone number (if provided)</li>
            <li>The content of your enquiry or message</li>
            <li>Your company or business name (if provided)</li>
          </ul>
          <p>When you become a client and engage our services, we may also collect:</p>
          <ul>
            <li>Billing information (business name, address, VAT number)</li>
            <li>Social media account credentials or access tokens (solely to perform marketing services on your behalf)</li>
            <li>Brand assets, logos, and marketing materials provided to us for use in delivering services</li>
          </ul>

          <h3>2.2 Information collected automatically</h3>
          <p>When you visit our website, we and our third-party service providers may automatically collect:</p>
          <ul>
            <li>IP address and approximate geographic location</li>
            <li>Browser type and version</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website or search terms</li>
            <li>Device type and operating system</li>
          </ul>
          <p>This information is collected through cookies and similar tracking technologies (see Section 6 below).</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the personal information we collect to:</p>
          <ul>
            <li>Respond to your enquiries and communicate with you about our services</li>
            <li>Prepare and deliver proposals, invoices, and service agreements</li>
            <li>Deliver the web development, marketing, or advertising services you have contracted us to provide</li>
            <li>Send service-related notifications and updates</li>
            <li>Improve our website, content, and service offerings</li>
            <li>Comply with our legal obligations under South African law</li>
            <li>Prevent fraud and maintain the security of our systems</li>
          </ul>
          <p>
            We will only use your personal information for the purposes for which it was collected, or for a compatible
            purpose that you would reasonably expect.
          </p>

          <h2>4. Legal Basis for Processing</h2>
          <p>We process your personal information on the following lawful grounds:</p>
          <ul>
            <li>
              <strong>Consent</strong> — where you have voluntarily provided your information via our contact form or
              signed up to receive communications from us.
            </li>
            <li>
              <strong>Contractual necessity</strong> — where processing is necessary to perform a contract with you or
              to take steps at your request before entering into a contract.
            </li>
            <li>
              <strong>Legitimate interests</strong> — where processing is necessary for our legitimate business
              interests, such as improving our services and website analytics, provided those interests are not overridden
              by your rights.
            </li>
            <li>
              <strong>Legal obligation</strong> — where we are required to process your information to comply with
              South African law.
            </li>
          </ul>

          <h2>5. Sharing Your Information</h2>
          <p>
            We do not sell, rent, or trade your personal information to third parties. We may share your information
            with trusted service providers who assist us in operating our business, including:
          </p>
          <ul>
            <li>
              <strong>Vercel Inc.</strong> — website hosting and deployment (servers located primarily in the United
              States)
            </li>
            <li>
              <strong>Supabase Inc.</strong> — database and back-end infrastructure
            </li>
            <li>
              <strong>Google LLC</strong> — analytics (Google Analytics 4) and advertising (Google Ads)
            </li>
            <li>
              <strong>Meta Platforms Inc.</strong> — advertising campaign management (Meta Ads / Facebook Ads) and
              website analytics (Meta Pixel) where applicable
            </li>
            <li>
              <strong>Resend / email service providers</strong> — transactional email delivery
            </li>
          </ul>
          <p>
            Each of these providers is contractually bound to handle your information securely and only for the specific
            purpose for which we share it. Where information is transferred outside South Africa, we take appropriate
            steps to ensure an adequate level of protection as required by POPIA.
          </p>
          <p>
            We may also disclose your information where required to do so by law or in response to a valid order from a
            court or regulatory body.
          </p>

          <h2>6. Cookies</h2>
          <p>
            Our website uses cookies and similar technologies to enhance your browsing experience and to understand how
            visitors use the site. Cookies are small text files placed on your device.
          </p>
          <p>We use the following types of cookies:</p>
          <ul>
            <li>
              <strong>Essential cookies</strong> — necessary for the website to function correctly (e.g., session
              management).
            </li>
            <li>
              <strong>Analytics cookies</strong> — used by Google Analytics to collect aggregated information about
              website usage. This data helps us understand how our site is used so we can improve it.
            </li>
            <li>
              <strong>Marketing cookies</strong> — where a Meta Pixel or Google Ads tag is active, these track
              conversions and support ad targeting.
            </li>
          </ul>
          <p>
            You can control or disable cookies through your browser settings. Disabling certain cookies may affect the
            functionality of the website.
          </p>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information only for as long as is necessary for the purposes for which it was
            collected, or as required by law:
          </p>
          <ul>
            <li>
              <strong>Contact enquiries</strong> — retained for 2 years from the date of last contact, or for as long
              as a business relationship exists.
            </li>
            <li>
              <strong>Client records</strong> — retained for at least 5 years after the end of the service engagement
              to comply with South African tax and accounting requirements.
            </li>
            <li>
              <strong>Website analytics</strong> — retained in accordance with the data retention settings of Google
              Analytics (typically 14 months) or the applicable provider.
            </li>
          </ul>

          <h2>8. Security</h2>
          <p>
            We implement reasonable technical and organisational security measures to protect your personal information
            against unauthorised access, loss, disclosure, or destruction. These measures include encrypted
            communications (HTTPS), access controls, and secure hosting infrastructure.
          </p>
          <p>
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive
            to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>

          <h2>9. Your Rights Under POPIA</h2>
          <p>As a data subject under POPIA, you have the right to:</p>
          <ul>
            <li>
              <strong>Access</strong> — request a copy of the personal information we hold about you.
            </li>
            <li>
              <strong>Correction</strong> — request that we correct inaccurate or incomplete information.
            </li>
            <li>
              <strong>Deletion</strong> — request that we delete your personal information, subject to our legal
              obligations to retain certain records.
            </li>
            <li>
              <strong>Objection</strong> — object to the processing of your personal information where we are relying
              on legitimate interests as the legal basis.
            </li>
            <li>
              <strong>Withdraw consent</strong> — where processing is based on your consent, you may withdraw it at
              any time without affecting the lawfulness of processing before withdrawal.
            </li>
            <li>
              <strong>Lodge a complaint</strong> — submit a complaint to the Information Regulator of South Africa if
              you believe your rights have been infringed.
            </li>
          </ul>
          <p>
            To exercise any of these rights, please contact us at{" "}
            <a href="mailto:Manager@ultimatemarketingsmash.com" className="text-(--primary) hover:underline">
              Manager@ultimatemarketingsmash.com
            </a>
            . We will respond within a reasonable time, and no later than 30 days.
          </p>
          <p>
            You may also contact the Information Regulator (South Africa) at{" "}
            <a
              href="https://www.justice.gov.za/inforeg/"
              target="_blank"
              rel="noreferrer"
              className="text-(--primary) hover:underline"
            >
              www.justice.gov.za/inforeg
            </a>
            .
          </p>

          <h2>10. Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the privacy practices or
            content of those sites. We encourage you to review the privacy policies of any third-party site you visit.
          </p>

          <h2>11. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The "Last updated" date at the top of this page
            indicates when the policy was last revised. We encourage you to review this policy periodically. Continued
            use of our website after changes are posted constitutes your acceptance of the revised policy.
          </p>

          <h2>12. Contact Us</h2>
          <p>If you have any questions or concerns about this Privacy Policy or how we handle your personal information, please contact us:</p>
          <p>
            <strong>Ultimate Marketing Smash (Pty) Ltd</strong>
            <br />
            Pongola, KwaZulu-Natal, South Africa
            <br />
            <a href="mailto:Manager@ultimatemarketingsmash.com" className="text-(--primary) hover:underline">
              Manager@ultimatemarketingsmash.com
            </a>
          </p>
        </div>

        <div className="mt-12 border-t border-black/8 pt-6 text-sm text-black/50">
          See also:{" "}
          <Link href="/terms" className="text-(--primary) hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
