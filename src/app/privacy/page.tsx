import Link from "next/link";
import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Privacy Policy | Sandalan",
  description: "How Sandalan collects, uses, and protects your personal information under the Data Privacy Act of 2012.",
};

const LAST_UPDATED = "April 5, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold mb-8 text-foreground">
            <BrandMark className="h-8 w-8" />
            Sandalan
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            This Privacy Policy explains how Sandalan (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, stores, and protects
            your personal information in accordance with Republic Act No. 10173, also known as the
            <strong> Data Privacy Act of 2012</strong> of the Philippines, and its implementing rules and regulations.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-sm leading-relaxed text-foreground">
          <section>
            <h2 className="text-lg font-semibold mb-3">1. Who We Are (Data Controller)</h2>
            <p className="text-muted-foreground">
              Sandalan is a personal finance and adulting guide application designed for individuals in the Philippines,
              developed by Jet Timothy Cerezo. We act as the Personal Information Controller for the data you provide when
              using our services.
            </p>
            <p className="mt-2 text-muted-foreground">
              Contact: <a href="mailto:privacy@sandalan.com" className="text-primary hover:underline">privacy@sandalan.com</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">2. Information We Collect</h2>
            <p className="text-muted-foreground mb-3">
              We collect only the information necessary to provide the app&apos;s features:
            </p>
            <div className="space-y-3">
              <div>
                <p className="font-medium">Account Information:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                  <li>Email address (for authentication and communication)</li>
                  <li>Full name (for personalization)</li>
                  <li>Profile photo / avatar (optional, for account personalization)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Financial Data (all manually entered by you):</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                  <li>Transactions (income and expenses)</li>
                  <li>Accounts and balances</li>
                  <li>Budgets</li>
                  <li>Financial goals</li>
                  <li>Debts</li>
                  <li>Bills</li>
                  <li>Insurance policies</li>
                  <li>Government contributions (SSS, PhilHealth, Pag-IBIG)</li>
                  <li>Tax records</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Usage Data:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                  <li>Life stage selection</li>
                  <li>Checklist progress (adulting journey milestones)</li>
                  <li>Feature usage patterns</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Device Information:</p>
                <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
                  <li>Device token (for push notifications only)</li>
                </ul>
              </div>
            </div>
            <p className="mt-3 text-muted-foreground">
              We do <strong>NOT</strong> collect bank account numbers, credit card numbers, government ID numbers
              (TIN, SSS number, PhilHealth number), or any payment credentials. All financial figures are manually entered by you.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">3. Legal Basis for Processing</h2>
            <p className="text-muted-foreground">
              We process your personal data based on your freely given, specific, informed, and unambiguous consent,
              provided when you create an account and agree to this Privacy Policy. You may withdraw your consent at any
              time by deleting your account.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">4. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>To provide, maintain, and improve the core service (financial tracking, budgeting, adulting guides)</li>
              <li>To generate personalized insights and recommendations</li>
              <li>To send notifications and reminders (bill due dates, contribution schedules, etc.)</li>
              <li>To improve the app experience</li>
              <li>To authenticate your identity and secure your account</li>
              <li>To respond to bug reports and support requests</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              We do <strong>NOT</strong> sell, rent, or share your personal data with third parties for marketing purposes.
              We do not use your data for profiling, behavioral advertising, or any purpose beyond operating the app.
              No advertising trackers are used.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">5. Data Storage</h2>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Cloud Storage:</p>
                <p>
                  Your data is stored on Supabase, hosted on Amazon Web Services (AWS) in the Singapore region.
                  Supabase is SOC 2 Type II certified and ISO 27001 compliant.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Local Storage:</p>
                <p>
                  A cached copy of your data is stored locally on your device using SQLite to enable offline access
                  and faster load times. This data remains on your device and is not shared with any third party.
                </p>
              </div>
              <div>
                <p className="font-medium text-foreground">Guest Mode:</p>
                <p>
                  When using the app in guest mode, all data is stored locally on your device only. No data is uploaded
                  to our servers. Guest mode data is never synced to the cloud unless you create an account.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">6. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your personal data for as long as your account is active. When you delete your account, all
              associated data — including transactions, accounts, goals, debts, budgets, contributions, bills, insurance
              records, and tax records — is permanently deleted from our systems within 30 days. Backups may retain data
              for up to 30 additional days before being overwritten.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">7. Data Sharing</h2>
            <p className="text-muted-foreground mb-3">
              We do <strong>NOT</strong> sell or share your personal data with third parties. The only third-party services used are:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-2">
              <li>
                <strong>Supabase</strong> (supabase.com): Database and authentication infrastructure. All user data is stored
                on Supabase servers. Data may be stored in servers outside the Philippines.
              </li>
              <li>
                <strong>Google Sign-In</strong> (optional): If you sign in with Google, we receive your name, email, and profile
                photo. We do not access your Google Drive, Gmail, contacts, or any other Google service data.
              </li>
              <li>
                <strong>ExchangeRate-API</strong> (open.er-api.com): Currency exchange rates. No personal data is sent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">8. Your Rights Under RA 10173</h2>
            <p className="text-muted-foreground mb-3">As a data subject, you have the following rights:</p>
            <div className="space-y-3 text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Right to be Informed:</p>
                <p>Know what data we collect and why — this Privacy Policy fulfills that obligation.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Right to Access:</p>
                <p>Request a copy of all personal data we hold about you via the Data Export feature in Settings &gt; Privacy &amp; Data.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Right to Object:</p>
                <p>Object to processing by withdrawing consent (deleting your account).</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Right to Erasure:</p>
                <p>Delete your account and all associated data permanently via Settings &gt; Privacy &amp; Data &gt; Delete Account.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Right to Data Portability:</p>
                <p>Export all your data in JSON format via Settings &gt; Privacy &amp; Data &gt; Download My Data.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Right to Rectification:</p>
                <p>Correct inaccurate data directly within the app at any time (edit your profile, transactions, accounts, etc.).</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Right to File a Complaint:</p>
                <p>
                  If you believe your rights under RA 10173 have been violated, you may file a complaint with the National
                  Privacy Commission at <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.privacy.gov.ph</a>.
                </p>
              </div>
            </div>
            <p className="mt-3 text-muted-foreground">
              To exercise any right not available in-app, email us at <a href="mailto:privacy@sandalan.com" className="text-primary hover:underline">privacy@sandalan.com</a>.
              We will respond within 15 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">9. Data Security</h2>
            <p className="text-muted-foreground mb-3">We implement the following security measures to protect your data:</p>
            <ul className="list-disc list-inside text-muted-foreground ml-2 space-y-1">
              <li>All data is encrypted in transit using TLS (HTTPS)</li>
              <li>All data is encrypted at rest using AES-256 on Supabase infrastructure</li>
              <li>Row-Level Security (RLS) ensures users can only access their own data</li>
              <li>Passwords are hashed using bcrypt via Supabase Auth — we never store plaintext passwords</li>
              <li>Local database on your device is protected by the operating system&apos;s app sandbox</li>
              <li>Administrative access is limited and does not include individual financial figures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">10. Data Breach Notification</h2>
            <p className="text-muted-foreground">
              In the event of a personal data breach that is likely to result in harm to affected individuals, we will
              notify the National Privacy Commission (NPC) within 72 hours of becoming aware of the breach, and notify
              affected users within a reasonable period, in accordance with NPC Circular No. 16-03.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">11. Children&apos;s Privacy</h2>
            <p className="text-muted-foreground">
              Sandalan is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. Users between 13 and 17 must have parent or guardian consent to use
              the app, as stated in our Terms of Service. If you believe a child under 13 has created an account,
              please contact us at <a href="mailto:privacy@sandalan.com" className="text-primary hover:underline">privacy@sandalan.com</a> and
              we will delete the account promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">12. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting a
              notice within the app. Your continued use of Sandalan after changes take effect constitutes acceptance of
              the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">13. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related concerns, contact us at:<br />
              Email: <a href="mailto:privacy@sandalan.com" className="text-primary hover:underline">privacy@sandalan.com</a>
            </p>
            <p className="mt-2 text-muted-foreground">
              If you believe your rights under RA 10173 have been violated, you may file a complaint with the National
              Privacy Commission at <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.privacy.gov.ph</a>.
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
