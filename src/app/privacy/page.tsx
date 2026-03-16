import Link from "next/link";
import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Privacy Policy | ExitPlan",
  description: "How ExitPlan collects, uses, and protects your personal information under the Data Privacy Act of 2012.",
};

const LAST_UPDATED = "March 17, 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold mb-8 text-foreground">
            <BrandMark className="h-8 w-8" />
            ExitPlan
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6">Privacy Policy</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            This Privacy Policy explains how ExitPlan (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) collects, uses, stores, and protects
            your personal information in accordance with Republic Act No. 10173, also known as the
            <strong> Data Privacy Act of 2012</strong> of the Philippines, and its implementing rules and regulations.
          </p>
        </div>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Who We Are</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ExitPlan is a personal finance tracking application designed for individuals in the Philippines.
              We act as the <strong>Personal Information Controller</strong> for the data you provide when
              using our services. If you have any privacy-related concerns, you may contact us at{" "}
              <a href="mailto:privacy@exitplan.app" className="text-primary hover:underline">privacy@exitplan.app</a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Information We Collect</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We collect only the information necessary to provide the app&apos;s features:</p>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide text-muted-foreground">Data</th>
                    <th className="text-left px-4 py-2.5 font-medium text-xs uppercase tracking-wide text-muted-foreground">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {[
                    ["Email address", "Account authentication and communication"],
                    ["Full name", "Personalization of your account"],
                    ["Profile photo (optional)", "Account personalization only"],
                    ["Financial transactions", "Core app functionality — tracking income and expenses"],
                    ["Account balances", "Net worth and budget calculations"],
                    ["Financial goals and budgets", "Goal tracking and spending management"],
                    ["Debt records", "Debt payoff tracking"],
                    ["Government contribution records (SSS, PhilHealth, Pag-IBIG)", "Contribution history tracking"],
                    ["Browser type (when filing bug reports)", "Diagnosing and fixing technical issues"],
                  ].map(([data, purpose]) => (
                    <tr key={data}>
                      <td className="px-4 py-2.5 text-xs font-medium">{data}</td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground">{purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do <strong>not</strong> collect bank account numbers, credit card numbers, government ID numbers (TIN, SSS number, PhilHealth number),
              or any payment credentials. All financial figures are manually entered by you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Legal Basis for Processing</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We process your personal data based on your <strong>freely given, specific, informed, and unambiguous consent</strong>, provided
              when you create an account and agree to this Privacy Policy. You may withdraw your consent at any time by deleting your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. How We Use Your Information</h2>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "To provide, maintain, and improve the app's features",
                "To authenticate your identity and secure your account",
                "To calculate financial summaries, net worth, and progress toward goals",
                "To respond to bug reports and support requests",
                "To send transactional emails (e.g., email confirmation, password reset)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We do <strong>not</strong> sell, rent, or share your personal data with third parties for marketing purposes.
              We do not use your data for profiling, behavioral advertising, or any purpose beyond operating the app.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Third-Party Services</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ExitPlan uses a limited number of third-party services, each acting as a <strong>Personal Information Processor</strong> on our behalf:
            </p>
            <div className="space-y-3">
              {[
                {
                  name: "Supabase (supabase.com)",
                  role: "Database and authentication infrastructure",
                  data: "All user data is stored on Supabase servers hosted on Amazon Web Services (AWS). Supabase is SOC 2 Type II certified and ISO 27001 compliant. Data may be stored in servers outside the Philippines.",
                },
                {
                  name: "OCR.space (ocr.space)",
                  role: "Receipt scanning (optional feature)",
                  data: "When you use the receipt scanner feature, the image you upload is sent to OCR.space for text extraction. No personally identifying information is attached to this request. Their privacy policy is available at ocr.space/privacy.",
                },
                {
                  name: "ExchangeRate-API (open.er-api.com)",
                  role: "Currency exchange rates",
                  data: "No personal data is sent. Only a request for current PHP exchange rates is made.",
                },
              ].map((s) => (
                <div key={s.name} className="rounded-lg border border-border/60 p-4 space-y-1">
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="text-xs text-muted-foreground"><span className="font-medium">Role:</span> {s.role}</p>
                  <p className="text-xs text-muted-foreground">{s.data}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Data Retention</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We retain your personal data for as long as your account is active. When you delete your account,
              all associated data — including transactions, accounts, goals, debts, budgets, and contributions —
              is permanently deleted from our systems within 30 days. Backups may retain data for up to 30 additional days
              before being overwritten.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Your Rights Under RA 10173</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">As a data subject, you have the following rights:</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                ["Right to be Informed", "Know what data we collect and why — this Privacy Policy fulfills that obligation."],
                ["Right to Access", "Request a copy of all personal data we hold about you via the Data Export feature in Settings."],
                ["Right to Rectification", "Correct inaccurate data directly within the app at any time."],
                ["Right to Erasure", "Delete your account and all associated data permanently via Settings → Danger Zone."],
                ["Right to Data Portability", "Export all your data in JSON format via Settings → Privacy."],
                ["Right to Object", "Object to processing by withdrawing consent (deleting your account)."],
              ].map(([right, desc]) => (
                <div key={right} className="rounded-lg border border-border/60 p-3 space-y-1">
                  <p className="text-xs font-semibold">{right}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To exercise any right not available in-app, email us at{" "}
              <a href="mailto:privacy@exitplan.app" className="text-primary hover:underline">privacy@exitplan.app</a>.
              We will respond within 15 business days.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Security Measures</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">We implement the following security measures to protect your data:</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "All data is encrypted in transit using TLS (HTTPS)",
                "All data is encrypted at rest using AES-256 on Supabase infrastructure",
                "Row-Level Security (RLS) ensures users can only access their own data",
                "Passwords are hashed using bcrypt via Supabase Auth — we never store plaintext passwords",
                "Administrative access is limited and does not include individual financial figures",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Data Breach Notification</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              In the event of a personal data breach that is likely to result in harm to affected individuals,
              we will notify the National Privacy Commission (NPC) within 72 hours of becoming aware of the breach,
              and notify affected users within a reasonable period, in accordance with NPC Circular No. 16-03.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Children&apos;s Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              ExitPlan is not intended for individuals under 18 years of age. We do not knowingly collect
              personal information from minors. If you believe a minor has created an account, please contact us
              and we will delete the account promptly.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">11. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting a notice within the app or by email. Your continued use of ExitPlan after changes
              take effect constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">12. Contact & Complaints</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For privacy-related concerns, contact our Data Protection Officer at{" "}
              <a href="mailto:privacy@exitplan.app" className="text-primary hover:underline">privacy@exitplan.app</a>.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you believe your rights under RA 10173 have been violated, you may file a complaint with the
              National Privacy Commission at{" "}
              <a href="https://www.privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.privacy.gov.ph</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} ExitPlan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="/dashboard" className="hover:text-foreground transition-colors">Back to App</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
