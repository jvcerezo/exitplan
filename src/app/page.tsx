import Link from "next/link";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  BarChart3,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Wallet,
    title: "Track Every Peso",
    description:
      "Log income and expenses effortlessly. See exactly where your money goes with clean, intuitive categorization.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "Beautiful charts and summaries that turn raw numbers into actionable financial clarity at a glance.",
  },
  {
    icon: Target,
    title: "Set Freedom Goals",
    description:
      "Define your financial milestones. Whether it's an emergency fund or early retirement — track your progress.",
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description:
      "Your data is encrypted and protected with row-level security. Only you can see your finances.",
  },
  {
    icon: TrendingUp,
    title: "Watch Your Growth",
    description:
      "See your net worth trend upward over time. Every tracked transaction brings you closer to freedom.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "No bloat, no clutter. A minimalist interface that loads instantly and stays out of your way.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Exit<span className="text-primary">Plan</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center py-24 text-center sm:py-32 lg:py-40">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
            <Zap className="h-3.5 w-3.5" />
            100% free. No credit card required.
          </div>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Your money.{" "}
            <span className="text-primary">Your plan.</span>
            <br />
            Your freedom.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            ExitPlan is the minimalist financial tracker built for people who
            want clarity, not complexity. Track spending, grow savings, and build
            your path to financial independence.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button size="lg" className="text-base px-8" asChild>
              <Link href="/signup">
                Start Tracking Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8"
              asChild
            >
              <Link href="/login">I have an account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-24">
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-xl">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-3 text-xs text-muted-foreground">
              exitplan.app/dashboard
            </span>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-3">
            {[
              {
                label: "Total Balance",
                value: "₱12,847.50",
                color: "text-foreground",
              },
              {
                label: "Income this month",
                value: "₱5,200.00",
                color: "text-green-600",
              },
              {
                label: "Expenses this month",
                value: "₱2,135.40",
                color: "text-red-500",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="rounded-lg border border-border/40 bg-background p-5"
              >
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className={`mt-1 text-2xl font-bold ${card.color}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need.{" "}
              <span className="text-primary">Nothing you don&apos;t.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Built for clarity and speed. No ads, no premium upsells, no data
              selling. Just a clean tool that helps you take control.
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

      {/* CTA */}
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Financial freedom starts with{" "}
              <span className="text-primary">one step</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join ExitPlan today. It takes 30 seconds to sign up and you&apos;ll
              never look at your money the same way again.
            </p>
            <div className="mt-10">
              <Button size="lg" className="text-base px-10" asChild>
                <Link href="/signup">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ExitPlan. Built for your freedom.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
