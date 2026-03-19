import Link from "next/link";
import type { Metadata } from "next";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "Terms of Service | Sandalan",
  description: "Terms and conditions for using Sandalan.",
};

const LAST_UPDATED = "March 18, 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold mb-8 text-foreground">
            <BrandMark className="h-8 w-8" />
            Sandalan
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mt-6">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before using Sandalan. By creating an account,
            you agree to be bound by these terms.
          </p>
        </div>

        <div className="space-y-8 text-foreground">

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              By accessing or using Sandalan, you agree to these Terms of Service and our Privacy Policy.
              If you do not agree, do not use the app. We reserve the right to update these terms at any time.
              Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">2. Description of Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sandalan is a personal finance and adulting guide application available on the web and as a
              mobile application on the Google Play Store. It helps you record and monitor your
              income, expenses, accounts, budgets, goals, debts, insurance policies, tax records,
              government contributions, and life milestones through the adulting checklist.
              Sandalan is a <strong>tracking tool only</strong> — it does not hold money, process payments,
              provide financial advice, or act as a bank, lending institution, or financial intermediary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">3. Eligibility</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You must be at least 18 years old to use Sandalan. By using the app, you represent
              that you meet this requirement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">4. Your Account</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activity that occurs under your account. Notify us immediately at{" "}
              <a href="mailto:support@exitplan.app" className="text-primary hover:underline">support@exitplan.app</a>{" "}
              if you suspect unauthorized access. We are not liable for losses caused by unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">5. Acceptable Use</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">You agree not to:</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {[
                "Use the app for any unlawful purpose or in violation of Philippine law",
                "Attempt to gain unauthorized access to other users' accounts or data",
                "Reverse engineer, decompile, or attempt to extract the app's source code",
                "Use automated tools to scrape, crawl, or extract data from the app",
                "Introduce malicious code, viruses, or disruptive components",
                "Misrepresent your identity or impersonate any person or entity",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">6. Financial Information Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sandalan provides tools to help you track your personal finances. <strong>Nothing in this app
              constitutes financial, investment, tax, or legal advice.</strong> The calculations shown
              (including government contributions, tax estimates, and net worth) are for informational
              purposes only. Always consult a qualified professional for financial decisions.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">7. Data and Privacy</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your use of Sandalan is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>,
              which is incorporated into these Terms by reference. You retain ownership of all financial
              data you enter into the app. We do not claim any rights to your data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">8. Intellectual Property</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              All content, design, branding, logos, and code that make up Sandalan are owned by us and
              protected under Philippine intellectual property law. You may not copy, modify, distribute,
              or create derivative works from any part of the app without our written consent.
              Your financial data remains yours — we claim no ownership over content you enter into the app.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">9. Pricing and Free Service</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sandalan is currently offered free of charge. We reserve the right to introduce paid features,
              subscription plans, or pricing changes in the future. If we do, existing free features at the
              time of any pricing change will remain accessible, and we will provide advance notice before
              any changes take effect.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">10. Mobile Application</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When you download Sandalan from the Google Play Store, you also agree to Google Play&apos;s
              Terms of Service. We are solely responsible for the app and its content — Google has no
              obligation to provide maintenance, support, or warranty for the app. In the event of any
              third-party claim that the app infringes intellectual property rights, we, not Google,
              are responsible for the investigation and resolution of such claims.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">11. Offline Functionality</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sandalan supports limited offline access through on-device caching. Data entered while
              offline is stored locally and synced when connectivity is restored. We are not responsible
              for data loss caused by clearing app data, uninstalling the app, or device failure while
              data is pending synchronization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">12. Service Availability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access.
              We may perform maintenance, updates, or experience outages. We are not liable for
              losses resulting from service unavailability.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">13. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To the maximum extent permitted by Philippine law, Sandalan and its operators shall not
              be liable for any indirect, incidental, special, or consequential damages arising from
              your use of the app, including but not limited to financial decisions made based on
              information displayed in the app.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">14. Termination</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              You may terminate your account at any time through Settings. We reserve the right to
              suspend or terminate accounts that violate these Terms. Upon termination, your data
              will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">15. Governing Law</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              These Terms are governed by the laws of the Republic of the Philippines.
              Any disputes shall be subject to the exclusive jurisdiction of the courts of the Philippines.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">16. Contact</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              For questions about these Terms, contact us at{" "}
              <a href="mailto:support@exitplan.app" className="text-primary hover:underline">support@exitplan.app</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Sandalan. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/home" className="hover:text-foreground transition-colors">Back to App</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
