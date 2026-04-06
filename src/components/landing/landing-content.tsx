"use client";

import Link from "next/link";
import {
  Wallet,
  BarChart3,
  BookOpen,
  Building2,
  Shield,
  Map,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Blocks,
  Home,
  Mountain,
  Clock,
  TrendingUp,
  Landmark,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.jvcerezo.exitplan";

const features = [
  {
    icon: Wallet,
    title: "Track Every Peso",
    desc: "Log expenses in two taps. Auto-categories for Jollibee, Grab, Meralco, and 500+ Filipino merchants.",
  },
  {
    icon: Map,
    title: "Adulting Roadmap",
    desc: "Six life stages — from first IDs to retirement. Step-by-step checklists with real processes and current fees.",
  },
  {
    icon: Building2,
    title: "Gov't Contributions",
    desc: "SSS, PhilHealth, Pag-IBIG calculators. Know exactly what you owe and what your employer should be paying.",
  },
  {
    icon: BarChart3,
    title: "Reports & Insights",
    desc: "Monthly report cards graded A-F. See where your money goes, your savings rate, and how you compare.",
  },
  {
    icon: BookOpen,
    title: "AI Chat in Taglish",
    desc: '"Magkano gastos ko this week?" — ask anything about your finances in the language you actually speak.',
  },
  {
    icon: Shield,
    title: "Private & Offline-First",
    desc: "Works without internet. No ads, no trackers. Your data stays on your phone unless you choose to sync.",
  },
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

const screenshots = [
  { src: "/images/screenshots/store-1-home.png", alt: "Home screen" },
  { src: "/images/screenshots/store-2-dashboard.png", alt: "Dashboard" },
  { src: "/images/screenshots/store-4-guide.png", alt: "Adulting guide" },
  { src: "/images/screenshots/store-3-chat.png", alt: "AI chat" },
];

/* Reusable Play badge */
function PlayBadge({ className = "" }: { className?: string }) {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex h-[52px] items-center gap-3 rounded-xl bg-foreground px-5 text-background transition-opacity hover:opacity-90 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
        <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.808 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z" />
      </svg>
      <div className="flex flex-col text-left leading-tight">
        <span className="text-[10px] uppercase tracking-wide opacity-80">Get it on</span>
        <span className="-mt-0.5 text-[17px] font-semibold">Google Play</span>
      </div>
    </a>
  );
}

export function LandingContent() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <BrandMark className="h-9 w-9" />
            <span>Sandal<span className="text-primary">an</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Download
            </a>
          </div>
        </nav>
      </header>

      {/* ── Hero with gradient backdrop ──────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
          <div className="absolute -top-20 left-1/4 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
          <div className="absolute top-20 right-1/4 h-[300px] w-[300px] rounded-full bg-green-500/5 blur-[100px] dark:bg-green-400/5" />
        </div>

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center pt-24 pb-20 text-center sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-32">
            {/* Pill badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Free on Google Play
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Your <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">Adulting</span> Companion
            </h1>

            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
              Budget tracker, expense manager, and adulting guide. From your first payslip to retirement.
            </p>

            {/* Store badges */}
            <div className="mt-10 flex items-center gap-3">
              <PlayBadge />
              <div
                aria-label="iOS coming soon"
                className="inline-flex h-[52px] cursor-not-allowed items-center gap-3 rounded-xl border border-border/50 bg-foreground/90 px-5 text-background opacity-50"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase tracking-wide opacity-80">Coming soon on</span>
                  <span className="-mt-0.5 text-[17px] font-semibold">App Store</span>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Free download &middot; No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* ── App Preview — Browser-style panels ─────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6 sm:pb-32">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Journey Map */}
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
            <div className="flex items-center gap-2.5 border-b border-border/40 px-5 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400/70" />
              <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
              <div className="h-3 w-3 rounded-full bg-green-400/70" />
              <span className="ml-4 text-xs text-muted-foreground">sandalan.app/guide</span>
            </div>
            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold">{t.landing.preview.journeyTitle}</p>
                <span className="text-sm text-muted-foreground">{t.landing.preview.journeyProgress}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[5%] rounded-full bg-primary" />
              </div>
              <div className="space-y-4 pt-2">
                {stageKeys.map((stage, i) => {
                  const stageT = t.stages[stage.key];
                  return (
                    <div key={stage.key} className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 ${i === 0 ? "border-primary bg-primary/10" : "border-muted-foreground/20 bg-muted/40"}`}>
                        <stage.icon className={`h-5 w-5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${i === 0 ? "" : "text-muted-foreground"}`}>{stageT.name}</p>
                        <p className="text-xs text-muted-foreground">{stageT.subtitle} &middot; {stageT.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Upcoming + Transactions */}
          <div className="space-y-6">
            {/* Upcoming Payments */}
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              <div className="flex items-center gap-2.5 border-b border-border/40 px-5 py-3">
                <div className="h-3 w-3 rounded-full bg-red-400/70" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
                <div className="h-3 w-3 rounded-full bg-green-400/70" />
                <span className="ml-4 text-xs text-muted-foreground">sandalan.app/home</span>
              </div>
              <div className="p-6 sm:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">{t.landing.preview.upcomingPayments}</p>
                  <p className="text-base font-bold">₱7,475.00</p>
                </div>
                {mockUpcoming.map((item) => (
                  <div key={item.name} className="flex items-center gap-4 rounded-xl border border-border/30 bg-background px-4 py-3.5">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg}`}>
                      <Landmark className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.type}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">₱{item.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{item.days} days</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-2xl">
              <div className="p-6 sm:p-8">
                <p className="text-lg font-bold mb-5">{t.landing.preview.recentTransactions}</p>
                <div className="space-y-3.5">
                  {mockTransactions.map((tx) => (
                    <div key={tx.desc} className="flex items-center gap-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.amount > 0 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-foreground"
                      }`}>
                        {tx.amount > 0 ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{tx.desc}</p>
                        <p className="text-xs text-muted-foreground capitalize">{tx.cat} &middot; {tx.date}</p>
                      </div>
                      <span className={`text-sm font-semibold shrink-0 ${tx.amount > 0 ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
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

      {/* ── Screenshots with dark backdrop ───────────────────────── */}
      <section className="relative bg-[#0F1B33] py-16 sm:py-24">
        {/* Subtle top gradient blend */}
        <div className="pointer-events-none absolute inset-x-0 -top-px h-24 bg-gradient-to-b from-background to-transparent" />

        <div className="relative">
          <p className="mb-10 text-center text-sm font-medium tracking-wider text-white/50 uppercase">
            See it in action
          </p>
          <div className="flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory sm:justify-center sm:gap-5 sm:px-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {screenshots.map((s) => (
              <div
                key={s.src}
                className="w-[240px] shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40 transition-transform hover:scale-[1.03] sm:w-[220px] lg:w-[230px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.src} alt={s.alt} className="w-full" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        {/* Subtle bottom gradient blend */}
        <div className="pointer-events-none absolute inset-x-0 -bottom-px h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need to{" "}
          <span className="bg-gradient-to-r from-primary to-green-500 bg-clip-text text-transparent">
            adult
          </span>{" "}
          in the Philippines
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-center text-base text-muted-foreground">
          Built for Filipino realities — government IDs, SSS, PhilHealth, petsa de peligro, and all.
        </p>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-border/50 bg-card p-7 transition-all hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA with gradient ──────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border/40">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-primary/6 blur-[120px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to figure out this adulting thing?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Free to use. Built by a solo Filipino developer. No ads, no trackers.
            </p>
            <div className="mt-8 flex justify-center">
              <PlayBadge />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Premium at ₱79/month &middot; Free trial available
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Sandalan. Built in the Philippines.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            <a href="mailto:support@sandalan.com" className="transition-colors hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
