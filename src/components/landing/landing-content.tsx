"use client";

import Link from "next/link";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  BarChart3,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  CreditCard,
  BookOpen,
  Receipt,
  Download,
  Building2,
  GraduationCap,
  Bell,
  Map,
  Landmark,
  Blocks,
  Home,
  Mountain,
} from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useTranslation } from "@/lib/i18n";
import type { LucideIcon } from "lucide-react";

const featureKeys = [
  { icon: Map, key: "lifeStage" as const },
  { icon: Wallet, key: "trackPeso" as const },
  { icon: Building2, key: "govContributions" as const },
  { icon: Bell, key: "reminders" as const },
  { icon: Calculator, key: "budgetsGoals" as const },
  { icon: CreditCard, key: "debtManager" as const },
  { icon: Shield, key: "insuranceBills" as const },
  { icon: BarChart3, key: "insights" as const },
  { icon: Download, key: "privacy" as const },
];

const stageKeys = [
  { icon: GraduationCap, key: "unangHakbang" as const },
  { icon: Blocks, key: "pundasyon" as const },
  { icon: Home, key: "tahanan" as const },
  { icon: Mountain, key: "tugatog" as const },
  { icon: Clock, key: "paghahanda" as const },
  { icon: TrendingUp, key: "gintongTaon" as const },
];

const mockTransactions = [
  { desc: "Monthly Salary", cat: "salary", amount: 35000, date: "Today" },
  { desc: "Grocery Run", cat: "food", amount: -1247.5, date: "Today" },
  { desc: "SSS Contribution", cat: "government", amount: -1125, date: "Yesterday" },
  { desc: "Freelance Payment", cat: "freelance", amount: 8500, date: "Mar 15" },
  { desc: "Electric Bill", cat: "bills", amount: -2850, date: "Mar 14" },
];

const mockUpcoming = [
  { name: "Meralco", type: "Bill", amount: 2850, days: 3, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "SSS Contribution", type: "Gov't", amount: 1125, days: 5, color: "text-amber-500", bg: "bg-amber-500/10" },
  { name: "Credit Card Min.", type: "Debt", amount: 3500, days: 8, color: "text-violet-500", bg: "bg-violet-500/10" },
];

const builtForItems: { icon: LucideIcon; labelKey: "sss" | "import" | "guide" | "reminders"; descKey: "sssDesc" | "importDesc" | "guideDesc" | "remindersDesc" }[] = [
  { icon: Building2, labelKey: "sss", descKey: "sssDesc" },
  { icon: Receipt, labelKey: "import", descKey: "importDesc" },
  { icon: BookOpen, labelKey: "guide", descKey: "guideDesc" },
  { icon: Bell, labelKey: "reminders", descKey: "remindersDesc" },
];

export function LandingContent() {
  const { t } = useTranslation();

  const howItWorksSteps = [
    { step: "1", title: t.landing.howItWorks.step1, description: t.landing.howItWorks.step1Desc },
    { step: "2", title: t.landing.howItWorks.step2, description: t.landing.howItWorks.step2Desc },
    { step: "3", title: t.landing.howItWorks.step3, description: t.landing.howItWorks.step3Desc },
  ];

  const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.jvcerezo.exitplan";
  const PLAY_STORE_BADGE = "https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero — clean centered layout */}
      <section className="relative min-h-[80vh] flex flex-col">
        {/* Navigation */}
        <header className="pt-[env(safe-area-inset-top)]">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold tracking-tight">
              <BrandMark className="h-11 w-11" />
              <span className="text-[#14213D] dark:text-white">
                Sandal<span className="text-primary">an</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </nav>
        </header>

        {/* Centered hero content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-2xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t.landing.hero.headline.split(t.landing.hero.headlineHighlight)[0]}
              <span className="text-primary">{t.landing.hero.headlineHighlight}</span>
              {t.landing.hero.headline.split(t.landing.hero.headlineHighlight)[1]}
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {t.landing.hero.subheadline}
            </p>

            {/* Store badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-[52px] items-center gap-3 rounded-xl border border-foreground/80 bg-foreground px-5 text-background hover:opacity-90 transition-opacity">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.808 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
                </svg>
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[10px] uppercase tracking-wide opacity-80">Get it on</span>
                  <span className="text-[17px] font-semibold -mt-0.5">Google Play</span>
                </div>
              </a>
              <div
                aria-label="iOS coming soon"
                className="inline-flex h-[52px] items-center gap-3 rounded-xl border border-border/60 bg-foreground/90 px-5 text-background opacity-70 cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="flex flex-col leading-tight text-left">
                  <span className="text-[10px] uppercase tracking-wide opacity-80">Coming soon on</span>
                  <span className="text-[17px] font-semibold -mt-0.5">App Store</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview — Two panels */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left: Journey Map preview */}
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <div className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-3 text-xs text-muted-foreground">sandalan.com/guide</span>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">{t.landing.preview.journeyTitle}</p>
                <span className="text-xs text-muted-foreground">{t.landing.preview.journeyProgress}</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[5%] rounded-full bg-primary" />
              </div>
              <div className="space-y-3 pt-2">
                {stageKeys.map((stage, i) => {
                  const stageT = t.stages[stage.key];
                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${i === 0 ? "border-primary bg-primary/10" : "border-muted-foreground/20 bg-muted/40"}`}>
                        <stage.icon className={`h-4 w-4 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold ${i === 0 ? "" : "text-muted-foreground"}`}>{stageT.name}</p>
                        <p className="text-[10px] text-muted-foreground">{stageT.subtitle} · {stageT.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Upcoming Payments + Transactions */}
          <div className="space-y-4">
            {/* Upcoming Payments */}
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
              <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-green-400/70" />
                <span className="ml-3 text-xs text-muted-foreground">sandalan.com/home</span>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">{t.landing.preview.upcomingPayments}</p>
                  <p className="text-xs font-semibold">₱7,475.00</p>
                </div>
                {mockUpcoming.map((item) => (
                  <div key={item.name} className="flex items-center gap-3 rounded-lg border border-border/40 bg-background px-3 py-2.5">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.bg}`}>
                      <Landmark className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold">₱{item.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{item.days}d</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
              <div className="p-4 sm:p-5">
                <p className="text-sm font-bold mb-3">{t.landing.preview.recentTransactions}</p>
                <div className="space-y-2.5">
                  {mockTransactions.map((tx) => (
                    <div key={tx.desc} className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        tx.amount > 0
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-foreground"
                      }`}>
                        {tx.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{tx.desc}</p>
                        <p className="text-[10px] text-muted-foreground capitalize">{tx.cat} &middot; {tx.date}</p>
                      </div>
                      <span className={`text-xs font-semibold shrink-0 ${tx.amount > 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                        {tx.amount > 0 ? "+" : ""}₱{Math.abs(tx.amount).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* App Screenshots */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Take a <span className="text-primary">tour</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              See what Sandalan looks like on your phone
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { src: "/images/screenshots/store-1-home.png", label: "Your snapshot" },
              { src: "/images/screenshots/store-2-dashboard.png", label: "Track every peso" },
              { src: "/images/screenshots/store-3-chat.png", label: "AI assistant" },
              { src: "/images/screenshots/store-4-guide.png", label: "Adulting guide" },
              { src: "/images/screenshots/store-5-features.png", label: "All features" },
              { src: "/images/screenshots/store-6-quickadd.png", label: "Quick logging" },
              { src: "/images/screenshots/store-7-achievements.png", label: "Achievements" },
              { src: "/images/screenshots/store-8-goals.png", label: "Savings goals" },
            ].map((shot) => (
              <div key={shot.src} className="group">
                <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-lg transition-transform group-hover:scale-[1.02]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={shot.src} alt={shot.label} className="w-full" />
                </div>
                <p className="mt-3 text-center text-sm font-medium text-muted-foreground">{shot.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Stages section */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.stages.headline.split(t.landing.stages.headlineHighlight)[0]}
              <span className="text-primary">{t.landing.stages.headlineHighlight}</span>
              {t.landing.stages.headline.split(t.landing.stages.headlineHighlight)[1]}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t.landing.stages.subheadline}
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stageKeys.map((stage) => {
              const stageT = t.stages[stage.key];
              return (
                <div key={stage.key} className="rounded-xl border border-border/50 bg-card p-5 space-y-3 group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                      <stage.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{stageT.name}</p>
                      <p className="text-xs text-muted-foreground">{stageT.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{stageT.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.features.headline}{" "}
              <span className="text-primary">{t.landing.features.headlineHighlight}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t.landing.features.subheadline}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {featureKeys.map((feature) => {
              const featureT = t.landing.features[feature.key];
              return (
                <div key={feature.key} className="group">
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{featureT.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted-foreground">
                    {featureT.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.howItWorks.headline}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t.landing.howItWorks.subheadline}
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {howItWorksSteps.map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Filipinos callout */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.builtFor.headline.split(t.landing.builtFor.headlineHighlight)[0]}
              <span className="text-primary">{t.landing.builtFor.headlineHighlight}</span>
              {t.landing.builtFor.headline.split(t.landing.builtFor.headlineHighlight)[1]}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              {t.landing.builtFor.subheadline}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {builtForItems.map((item) => (
              <div
                key={item.labelKey}
                className="rounded-xl border border-border/50 bg-card p-5 space-y-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{t.landing.builtFor[item.labelKey]}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.landing.builtFor[item.descKey]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t.landing.cta.headline.split(t.landing.cta.headlineHighlight)[0]}
              <span className="text-primary">{t.landing.cta.headlineHighlight}</span>
              {t.landing.cta.headline.split(t.landing.cta.headlineHighlight)[1]}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {t.landing.cta.description}
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="inline-block hover:opacity-90 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PLAY_STORE_BADGE} alt="Get it on Google Play" className="h-20" />
              </a>
              <p className="text-sm text-muted-foreground">Free forever &middot; Premium at ₱79/month</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} {t.landing.footer.copyright}
              </p>
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={PLAY_STORE_BADGE} alt="Get it on Google Play" className="h-12" />
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t.landing.footer.privacy}
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                {t.landing.footer.terms}
              </Link>
              <a href="mailto:support@sandalan.com" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
