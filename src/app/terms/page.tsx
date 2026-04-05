import Link from "next/link";
import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Terms of Service | Sandalan",
  description: "Terms and conditions for using Sandalan.",
};

const LAST_UPDATED = "April 5, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold mb-8 text-foreground">
            <BrandMark className="h-8 w-8" />
            Sandalan
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before using Sandalan. By creating an account, you agree to be
            bound by these terms.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Sandalan, you agree to these Terms of Service and our Privacy Policy. If you do not
              agree, do not use the app. We reserve the right to update these terms at any time. Continued use after
              changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Description of Service</h2>
            <p className="text-muted-foreground">
              Sandalan is a personal finance and adulting guide application available on the web and as a mobile
              application on the Google Play Store. It helps you record and monitor your income, expenses, accounts,
              budgets, goals, debts, insurance policies, tax records, government contributions, and life milestones
              through the adulting checklist. Sandalan is a tracking tool only — it does not hold money, process
              payments, provide financial advice, or act as a bank, lending institution, or financial intermediary.
            </p>
            <p className="mt-3 text-muted-foreground">
              <strong>Sandalan is NOT regulated by the Bangko Sentral ng Pilipinas (BSP).</strong> We are not a bank,
              electronic money issuer, virtual asset service provider, or any other BSP-regulated financial entity. We
              do not hold, transfer, or process money on your behalf. All financial figures displayed in the app are
              manually entered by you and are stored only as records — no actual funds are moved or managed by Sandalan.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Eligibility</h2>
            <p className="text-muted-foreground">
              You must be at least 13 years old to use Sandalan. If you are under 18, you represent that you have
              obtained consent from a parent or legal guardian to use the app and agree to these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. Account Registration and Responsibilities</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity
              that occurs under your account. You agree to provide accurate and complete information during registration.
              Notify us immediately at <a href="mailto:support@sandalan.com" className="text-primary hover:underline">support@sandalan.com</a> if
              you suspect unauthorized access. We are not liable for losses caused by unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Prohibited Uses</h2>
            <p className="text-muted-foreground mb-3">You agree not to:</p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>Use the app for any unlawful purpose or in violation of Philippine law</li>
              <li>Attempt to gain unauthorized access to other users&apos; accounts or data</li>
              <li>Reverse engineer, decompile, or attempt to extract the app&apos;s source code</li>
              <li>Use automated tools to scrape, crawl, or extract data from the app</li>
              <li>Introduce malicious code, viruses, or disruptive components</li>
              <li>Misrepresent your identity or impersonate any person or entity</li>
              <li>Use the app to launder money or facilitate any illegal financial activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Financial Disclaimer</h2>
            <p className="text-muted-foreground">
              Sandalan provides tools to help you track your personal finances. <strong>NOTHING IN THIS APP CONSTITUTES
              FINANCIAL, INVESTMENT, TAX, OR LEGAL ADVICE.</strong> The calculations shown (including government
              contributions, tax estimates, and net worth) are for informational purposes only and may not reflect the
              latest rates or regulations. Always consult a qualified professional (accountant, financial advisor, lawyer)
              for financial decisions. We are not responsible for any financial losses resulting from reliance on
              information displayed in the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Data and Privacy</h2>
            <p className="text-muted-foreground">
              Your use of Sandalan is also governed by our <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. You retain ownership of all financial data you enter
              into the app. We do not claim any rights to your data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, design, branding, logos, and code that make up Sandalan are owned by us and protected under
              Philippine intellectual property law. You may not copy, modify, distribute, or create derivative works
              from any part of the app without our written consent. Your financial data remains yours — we claim no
              ownership over content you enter into the app.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Pricing &amp; Subscriptions</h2>
            <p className="text-muted-foreground mb-3">
              Sandalan offers a free tier and a Premium subscription. Core features (expense tracking, budgets, goals,
              bills, debts, adulting guide, government contribution calculators) are free forever. Premium unlocks
              additional features such as the AI Chat assistant, receipt scanner, investments tracker, advanced reports,
              bill splitting, CSV import/export, and app vault.
            </p>
            <p className="text-muted-foreground mb-3">
              Premium is offered via Google Play as an auto-renewing subscription:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>Monthly: ₱79 per month</li>
              <li>Yearly: ₱649 per year (save ~32%)</li>
              <li>A free trial may be offered at Google&apos;s discretion</li>
            </ul>
            <p className="mt-3 text-muted-foreground mb-3">
              <strong>How subscriptions work:</strong>
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>Billing begins immediately upon purchase confirmation by Google Play</li>
              <li>
                Subscriptions auto-renew at the end of each billing period unless you cancel at least 24 hours before
                the renewal date
              </li>
              <li>You may cancel anytime through your Google Play account settings (Play Store → Profile → Payments &amp; subscriptions → Subscriptions)</li>
              <li>Cancellation takes effect at the end of your current billing period — you keep Premium access until then</li>
              <li>Once the subscription expires, Premium features revert to the Free tier automatically</li>
              <li>Refund requests are handled by Google Play according to their refund policy — Sandalan does not process refunds directly</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We reserve the right to modify Premium pricing or the features included in each tier with at least 30
              days&apos; advance notice. Changes will not affect your current billing period.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Service Availability</h2>
            <p className="text-muted-foreground">
              We strive to maintain high availability but do not guarantee uninterrupted access. We may perform
              maintenance, updates, or experience outages. We are not liable for losses resulting from service unavailability.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Offline Functionality</h2>
            <p className="text-muted-foreground">
              Sandalan supports limited offline access through on-device caching. Data entered while offline is stored
              locally and synced when connectivity is restored. We are not responsible for data loss caused by clearing
              app data, uninstalling the app, or device failure while data is pending synchronization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-3">
              To the maximum extent permitted by Philippine law, Sandalan and its operators shall not be liable for any
              indirect, incidental, special, or consequential damages arising from your use of the app, including but
              not limited to financial decisions made based on information displayed in the app. Our total liability for
              any claim arising from or related to these Terms shall not exceed the greater of (a) the amount you have
              paid us in the 12 months preceding the claim, or (b) PHP 1,000.
            </p>
            <p className="text-muted-foreground">
              <strong>This limitation does not apply to damages caused by our gross negligence, willful misconduct, or
              violations of applicable Philippine law</strong> — including violations of the Data Privacy Act of 2012
              (RA 10173) and the Consumer Act of the Philippines (RA 7394).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">13. Termination</h2>
            <p className="text-muted-foreground">
              You may terminate your account at any time through Settings &gt; Privacy &amp; Data. We reserve the right
              to suspend or terminate accounts that violate these Terms without prior notice. Upon termination, your
              data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">14. Governing Law</h2>
            <p className="text-muted-foreground">
              These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be subject to
              the exclusive jurisdiction of the courts of the Philippines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">15. Dispute Resolution</h2>
            <p className="text-muted-foreground">
              Before filing a formal legal claim, you agree to first contact us at <a href="mailto:support@sandalan.com" className="text-primary hover:underline">support@sandalan.com</a> to
              attempt to resolve the dispute informally. We will endeavor to resolve any dispute within 30 days. If the
              dispute cannot be resolved informally, it shall be submitted to the appropriate courts of the Philippines.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">16. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these Terms, contact us at:<br />
              Email: <a href="mailto:support@sandalan.com" className="text-primary hover:underline">support@sandalan.com</a>
            </p>
            <p className="mt-2 text-muted-foreground">
              For privacy-related concerns: <a href="mailto:privacy@sandalan.com" className="text-primary hover:underline">privacy@sandalan.com</a>
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border/50 text-center">
          <Link href="/" className="text-sm text-primary hover:underline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
