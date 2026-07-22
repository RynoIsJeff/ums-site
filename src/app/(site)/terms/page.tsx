import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — UMS",
  description:
    "The terms and conditions governing the use of Ultimate Marketing Smash (Pty) Ltd services, including web development, digital marketing, and advertising management.",
};

export default function TermsPage() {
  return (
    <main className="bg-white py-16">
      <div className="container max-w-3xl">
        <span className="kicker">Legal</span>
        <h1 className="mt-2 text-4xl font-bold">Terms of Service</h1>
        <p className="mt-3 text-sm text-black/50">Effective date: 22 July 2026 · Last updated: 22 July 2026</p>

        <div className="prose prose-neutral mt-10 max-w-none text-black/80 [&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-black [&_h3]:mt-6 [&_h3]:font-semibold [&_h3]:text-black [&_p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_ul]:list-disc">

          <p>
            These Terms of Service (<strong>"Terms"</strong>) govern your use of the website at{" "}
            <a href="https://ultimatemarketingsmash.com" className="text-(--primary) hover:underline">
              ultimatemarketingsmash.com
            </a>{" "}
            and any services provided by <strong>Ultimate Marketing Smash (Pty) Ltd</strong> (<strong>"UMS"</strong>,{" "}
            <strong>"we"</strong>, <strong>"us"</strong>, or <strong>"our"</strong>). By accessing our website or
            engaging our services, you agree to be bound by these Terms. If you do not agree, please do not use our
            website or services.
          </p>

          <h2>1. About Us</h2>
          <p>
            Ultimate Marketing Smash (Pty) Ltd is a South African digital studio providing web and app development,
            digital marketing, social media management, paid advertising, and related services. We are incorporated in
            South Africa and operate primarily from Pongola, KwaZulu-Natal.
          </p>

          <h2>2. Services</h2>
          <p>
            UMS offers the following categories of services (collectively, the <strong>"Services"</strong>):
          </p>
          <ul>
            <li>
              <strong>Web &amp; App Development</strong> — design, development, and deployment of websites, web
              applications, e-commerce platforms, job portals, HR tools, and internal dashboards.
            </li>
            <li>
              <strong>Digital Marketing</strong> — social media strategy, content creation, community management, and
              social media scheduling across platforms including Facebook and Instagram.
            </li>
            <li>
              <strong>Paid Advertising</strong> — campaign creation, management, and optimisation on Meta (Facebook
              &amp; Instagram Ads), Google (Search, Display, YouTube), and other platforms.
            </li>
            <li>
              <strong>Analytics &amp; Reporting</strong> — performance tracking, GA4 setup, and monthly reporting.
            </li>
            <li>
              <strong>Hosting &amp; Maintenance</strong> — website hosting, uptime monitoring, content updates, and
              ongoing technical support.
            </li>
          </ul>
          <p>
            The specific scope, deliverables, timelines, and fees for each engagement are agreed upon in a written
            proposal or service agreement (<strong>"Agreement"</strong>) signed by both parties. These Terms apply in
            addition to, and where not inconsistent with, the Agreement.
          </p>

          <h2>3. Use of Our Website</h2>
          <p>By accessing our website, you agree that you will not:</p>
          <ul>
            <li>Use the website in any way that is unlawful, fraudulent, or harmful.</li>
            <li>
              Attempt to gain unauthorised access to any part of the website, its servers, or any connected systems.
            </li>
            <li>
              Transmit any unsolicited or unauthorised advertising or promotional material (spam).
            </li>
            <li>
              Use automated tools (bots, scrapers, crawlers) to extract content from the website without our prior
              written consent.
            </li>
            <li>
              Reproduce, duplicate, copy, sell, or exploit any portion of the website or its content for commercial
              purposes without our express written permission.
            </li>
          </ul>

          <h2>4. Client Responsibilities</h2>
          <p>
            Where you engage us for Services, you agree to:
          </p>
          <ul>
            <li>
              Provide accurate, complete, and timely information and materials necessary for us to perform the Services
              (including brand assets, logins, copy, and approvals).
            </li>
            <li>
              Ensure that any content, materials, or assets you provide to us do not infringe the intellectual property
              rights of any third party and comply with applicable laws.
            </li>
            <li>
              Designate a primary point of contact who has authority to approve deliverables and make decisions on your
              behalf.
            </li>
            <li>
              Respond to requests for feedback, approval, or information within the timeframes specified in the
              Agreement (or, where not specified, within 5 business days).
            </li>
          </ul>
          <p>
            Delays caused by failure to provide required materials or approvals may affect delivery timelines. UMS
            shall not be held liable for delays resulting from client inaction.
          </p>

          <h2>5. Fees and Payment</h2>
          <p>
            Fees for Services are set out in the applicable Agreement or invoice. Unless otherwise agreed in writing:
          </p>
          <ul>
            <li>
              Invoices are due and payable within <strong>7 days</strong> of the invoice date, unless an alternative
              payment term is specified in the Agreement.
            </li>
            <li>
              Retainer and recurring fees are due on the first business day of each month (or as otherwise agreed).
            </li>
            <li>
              Late payment may result in the suspension of Services until outstanding amounts are settled.
            </li>
            <li>
              We reserve the right to charge interest on overdue amounts at the rate permissible under the National
              Credit Act or as agreed in the relevant Agreement.
            </li>
            <li>
              All fees are quoted in South African Rand (ZAR) and are exclusive of VAT unless otherwise stated.
            </li>
          </ul>

          <h2>6. Intellectual Property</h2>

          <h3>6.1 Our intellectual property</h3>
          <p>
            All content on this website — including text, graphics, logos, images, and software — is owned by or
            licensed to UMS and is protected by South African and international copyright and intellectual property
            laws. You may not reproduce, distribute, or create derivative works from our website content without our
            prior written consent.
          </p>

          <h3>6.2 Work product and deliverables</h3>
          <p>
            Unless otherwise agreed in writing in the relevant Agreement, upon receipt of full and final payment for
            Services:
          </p>
          <ul>
            <li>
              <strong>Custom-designed and custom-developed deliverables</strong> (e.g., website designs, custom code
              written exclusively for your project) are transferred to you upon full payment.
            </li>
            <li>
              <strong>Third-party components</strong> — including open-source libraries, licensed fonts, stock imagery,
              plugins, and platform tools used in delivering the Services — remain subject to their respective
              third-party licences and are not transferred to you as UMS's intellectual property.
            </li>
            <li>
              <strong>Marketing creative assets</strong> (social media graphics, ad creatives, copy) produced for your
              brand are transferred to you upon full payment.
            </li>
            <li>
              UMS retains the right to display the work in its portfolio and case studies unless you request otherwise
              in writing.
            </li>
          </ul>

          <h3>6.3 Your intellectual property</h3>
          <p>
            You retain all intellectual property rights in materials, brand assets, and content you provide to us. You
            grant UMS a limited, non-exclusive licence to use those materials solely for the purpose of performing the
            Services.
          </p>

          <h2>7. Confidentiality</h2>
          <p>
            Both parties agree to keep confidential any proprietary or sensitive information disclosed in the course of
            the engagement that is reasonably understood to be confidential. This obligation does not apply to
            information that is publicly available, independently developed, or required to be disclosed by law.
          </p>

          <h2>8. Warranties and Disclaimers</h2>
          <p>
            UMS warrants that it will perform the Services with reasonable care and skill in accordance with industry
            standards. We do not guarantee specific business outcomes, including (but not limited to) particular search
            engine rankings, advertising return on investment, follower growth, or sales results, as these are
            influenced by many factors beyond our control.
          </p>
          <p>
            Our website is provided on an <strong>"as is"</strong> and <strong>"as available"</strong> basis. We make
            no warranties, express or implied, regarding the accuracy, completeness, or suitability of the content on
            our website.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by South African law, UMS shall not be liable for any indirect,
            incidental, special, or consequential damages — including loss of revenue, loss of profits, loss of
            business, or loss of data — arising from your use of our website or our Services, even if we have been
            advised of the possibility of such damages.
          </p>
          <p>
            Our total aggregate liability to you in connection with any Services shall not exceed the total fees paid
            by you to UMS in the three (3) months immediately preceding the event giving rise to the claim.
          </p>
          <p>
            Nothing in these Terms limits liability for fraud, gross negligence, or wilful misconduct, or for any
            liability that cannot be excluded under applicable South African law.
          </p>

          <h2>10. Termination</h2>
          <p>
            Either party may terminate an engagement by providing written notice as specified in the applicable
            Agreement. Where no notice period is specified, 30 days&apos; written notice is required.
          </p>
          <p>Upon termination:</p>
          <ul>
            <li>
              All fees for work completed up to the termination date, including any applicable notice period, become
              immediately due and payable.
            </li>
            <li>
              Each party shall return or destroy confidential information of the other party upon request.
            </li>
            <li>
              Ownership of deliverables for which full payment has been received transfers to you in accordance with
              Section 6.
            </li>
          </ul>

          <h2>11. Governing Law and Dispute Resolution</h2>
          <p>
            These Terms and any dispute arising from them shall be governed by the laws of the Republic of South
            Africa. The parties agree to first attempt to resolve any dispute through good-faith negotiation. If
            unresolved within 30 days, either party may refer the dispute to mediation or the courts of South Africa
            with jurisdiction over the matter.
          </p>

          <h2>12. Changes to These Terms</h2>
          <p>
            We may update these Terms from time to time. The "Last updated" date at the top of this page indicates
            when the Terms were last revised. Your continued use of our website or Services after changes are posted
            constitutes your acceptance of the updated Terms. We encourage you to review these Terms periodically.
          </p>

          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us:
          </p>
          <p>
            <strong>Ultimate Marketing Smash (Pty) Ltd</strong>
            <br />
            Pongola, KwaZulu-Natal, South Africa
            <br />
            <a href="mailto:Manager@ultimatemarketingsmash.com" className="text-(--primary) hover:underline">
              Manager@ultimatemarketingsmash.com
            </a>
            <br />
            <Link href="/contact" className="text-(--primary) hover:underline">
              Contact form
            </Link>
          </p>
        </div>

        <div className="mt-12 border-t border-black/8 pt-6 text-sm text-black/50">
          See also:{" "}
          <Link href="/privacy" className="text-(--primary) hover:underline">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
