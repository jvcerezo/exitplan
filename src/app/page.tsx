import type { Metadata } from "next";
import Script from "next/script";
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
import { SessionRedirectGuard } from "@/components/auth/session-redirect-guard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { absoluteUrl, buildPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "ExitPlan — Your Filipino Adulting Companion",
  description:
    "ExitPlan guides you through every stage of Filipino adult life — from getting your first IDs to retirement. Track finances, manage contributions, and follow step-by-step adulting guides.",
  path: "/",
  index: true,
});

const features = [
  {
    icon: Map,
    title: "Life Stage Journey Map",
    description:
      "A guided path through Filipino adulting — from Unang Hakbang to Gintong Taon. Each stage has checklists and step-by-step guides you can mark as done or skip.",
  },
  {
    icon: Wallet,
    title: "Track Every Peso",
    description:
      "Log income and expenses across all your accounts. Import from GCash, BDO, BPI, and most bank CSV exports. Attach receipt photos to any transaction.",
  },
  {
    icon: Building2,
    title: "Government Contributions",
    description:
      "Auto-generate monthly SSS, PhilHealth, and Pag-IBIG entries from your salary. Mark as paid to record a transaction — your balance updates automatically.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description:
      "Bills, debt payments, insurance premiums, and contributions all show up in one Upcoming Payments view. Get push notifications before anything is due.",
  },
  {
    icon: Calculator,
    title: "Budgets & Goals",
    description:
      "Set monthly spending limits per category. Create savings targets with deadlines. Get alerts when you're near or over budget.",
  },
  {
    icon: CreditCard,
    title: "Debt Manager",
    description:
      "Track loans, credit cards, and salary loans. Record payments that update your balance automatically. Avalanche and Snowball payoff strategies built in.",
  },
  {
    icon: Shield,
    title: "Insurance & Bills Tracker",
    description:
      "Track all your insurance policies and recurring bills in one place. Premium reminders and due date alerts keep you on top of payments.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "Spending breakdowns, income vs expense trends, financial health score, and net worth tracking — everything on one clean dashboard.",
  },
  {
    icon: Download,
    title: "Private & Your Data",
    description:
      "Row-level security means only you see your data. Export everything in JSON anytime. Delete your account permanently — no questions asked.",
  },
];

const journeyStages = [
  { icon: GraduationCap, name: "Unang Hakbang", sub: "First Steps", items: "Get IDs, first job docs, payslip basics" },
  { icon: Blocks, name: "Pundasyon", sub: "Building Foundation", items: "Savings, budgeting, credit, emergency fund" },
  { icon: Home, name: "Tahanan", sub: "Establishing Home", items: "Renting, buying property, family planning" },
  { icon: Mountain, name: "Tugatog", sub: "Career Peak", items: "Investments, insurance, wealth building" },
  { icon: Clock, name: "Paghahanda", sub: "Pre-Retirement", items: "Estate planning, retirement prep" },
  { icon: TrendingUp, name: "Gintong Taon", sub: "Golden Years", items: "Retirement living, legacy planning" },
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

export default function LandingPage() {
  const landingStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "ExitPlan — Your Filipino Adulting Companion",
    url: siteConfig.url,
    description: siteConfig.description,
    isPartOf: {
      "@id": `${siteConfig.url}#website`,
    },
    about: {
      "@type": "Thing",
      name: "Filipino adulting guide, personal finance tracking, government contributions, and life stage planning",
    },
    primaryImageOfPage: absoluteUrl("/app-icon.svg"),
  };

  return (
    <div className="min-h-screen bg-background">
      <SessionRedirectGuard to="/home" />
      <Script
        id="landing-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(landingStructuredData) }}
      />

      {/* Hero with Philippine backdrop */}
      <section className="relative overflow-hidden">
        {/* Backdrop image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/landing-backdrop.jpg')" }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/80 to-background" />

        {/* Navigation — on top of backdrop */}
        <header className="relative z-10 pt-[env(safe-area-inset-top)]">
          <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold tracking-tight">
              <BrandMark className="h-11 w-11" />
              <span className="text-[#14213D] dark:text-white">
                Exit<span className="text-primary">Plan</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero content */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center pt-12 pb-20 text-center sm:py-24 lg:py-32">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary">
              <Zap className="h-3.5 w-3.5" />
              100% free · Built for Filipinos
            </div>

            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Your companion for{" "}
              <span className="text-primary">every stage</span>
              <br />
              of Filipino adult life.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              From your first government ID to retirement — step-by-step guides,
              financial tracking, and smart reminders in one app.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="text-base px-8" asChild>
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base px-8 bg-background/50 backdrop-blur-sm" asChild>
                <Link href="/login">I already have an account</Link>
              </Button>
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
              <span className="ml-3 text-xs text-muted-foreground">exitplan.app/guide</span>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold">Your Adulting Journey</p>
                <span className="text-xs text-muted-foreground">0/58 completed</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full w-[5%] rounded-full bg-primary" />
              </div>
              <div className="space-y-3 pt-2">
                {journeyStages.map((stage, i) => (
                  <div key={stage.name} className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${i === 0 ? "border-primary bg-primary/10" : "border-muted-foreground/20 bg-muted/40"}`}>
                      <stage.icon className={`h-4 w-4 ${i === 0 ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-semibold ${i === 0 ? "" : "text-muted-foreground"}`}>{stage.name}</p>
                      <p className="text-[10px] text-muted-foreground">{stage.sub} · {stage.items}</p>
                    </div>
                  </div>
                ))}
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
                <span className="ml-3 text-xs text-muted-foreground">exitplan.app/home</span>
              </div>
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold">Upcoming Payments</p>
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
                <p className="text-sm font-bold mb-3">Recent Transactions</p>
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

      {/* Journey Stages section */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              A guide for <span className="text-primary">every life stage</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Whether you just graduated or you&apos;re planning retirement — ExitPlan
              has step-by-step guides, checklists, and tools for where you are right now.
            </p>
          </div>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {journeyStages.map((stage) => (
              <div key={stage.name} className="rounded-xl border border-border/50 bg-card p-5 space-y-3 group hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/15 transition-colors">
                    <stage.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{stage.name}</p>
                    <p className="text-xs text-muted-foreground">{stage.sub}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{stage.items}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need.{" "}
              <span className="text-primary">Nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              No ads, no premium upsells, no data selling. Just a complete tool
              that helps Filipinos take control of their full financial picture.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="group">
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple by design
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Pick your life stage, set up your accounts, and ExitPlan handles the rest.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Pick your life stage",
                description:
                  "Tell us where you are — fresh grad, building foundations, or nearing retirement. We'll show you the most relevant guides and checklists.",
              },
              {
                step: "2",
                title: "Set up your finances",
                description:
                  "Add your bank accounts, e-wallets, and bills. Your contributions, debts, and insurance get automatic reminders when payments are due.",
              },
              {
                step: "3",
                title: "Follow the guide",
                description:
                  "Work through your adulting checklist step by step. Track your finances along the way. Everything updates in one clean dashboard.",
              },
            ].map((item) => (
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
              Built for the{" "}
              <span className="text-primary">Filipino financial reality</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Most finance apps ignore the Philippines. ExitPlan doesn&apos;t.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Building2,
                label: "SSS, PhilHealth & Pag-IBIG",
                desc: "Auto-generate monthly contributions, mark as paid, and track your history",
              },
              {
                icon: Receipt,
                label: "GCash & Bank CSV Import",
                desc: "Import transaction history from all major Philippine banks and e-wallets",
              },
              {
                icon: BookOpen,
                label: "Step-by-Step Adulting Guide",
                desc: "From getting your TIN to retirement planning — every step with requirements, fees, and tips",
              },
              {
                icon: Bell,
                label: "Smart Payment Reminders",
                desc: "Push notifications for bills, contributions, debt payments, and insurance premiums",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/50 bg-card p-5 space-y-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
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
              Your adulting journey starts with{" "}
              <span className="text-primary">one step</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join ExitPlan today. Pick your life stage, and we&apos;ll guide you
              through everything — IDs, finances, insurance, retirement, and more.
            </p>
            <div className="mt-10">
              <Button size="lg" className="text-base px-10" asChild>
                <Link href="/signup">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ExitPlan. Built for your freedom.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Terms of Service
            </Link>
            <Link href="/login" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
