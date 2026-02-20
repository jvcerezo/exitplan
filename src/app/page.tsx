import Link from "next/link";
import {
  ArrowRight,
  Shield,
  TrendingUp,
  Wallet,
  BarChart3,
  Target,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const features = [
  {
    icon: Wallet,
    title: "Track Every Peso",
    description:
      "Log income and expenses with categories, descriptions, and dates. Filter, search, and export to CSV anytime.",
  },
  {
    icon: Calculator,
    title: "Smart Budgets",
    description:
      "Set monthly spending limits per category. Get alerts when you're near or over budget — right on your dashboard.",
  },
  {
    icon: Target,
    title: "Savings Goals",
    description:
      "Set targets with deadlines — emergency fund, debt payoff, travel. Add funds and watch your progress grow.",
  },
  {
    icon: BarChart3,
    title: "Visual Insights",
    description:
      "Spending breakdowns by category, monthly income vs expense trends, and smart insights — all in one view.",
  },
  {
    icon: Shield,
    title: "Private & Secure",
    description:
      "Row-level security ensures only you can see your data. No ads, no tracking, no selling your information.",
  },
  {
    icon: TrendingUp,
    title: "All-in-One Dashboard",
    description:
      "Balance, budget alerts, goal progress, charts, and recent transactions — everything at a glance.",
  },
];

const mockTransactions = [
  { desc: "Freelance Payment", cat: "freelance", amount: 8500, date: "Today" },
  { desc: "Grocery Run", cat: "food", amount: -1247.5, date: "Today" },
  { desc: "Electric Bill", cat: "housing", amount: -2850, date: "Yesterday" },
  { desc: "Monthly Salary", cat: "salary", amount: 25000, date: "Feb 15" },
  { desc: "Grab Ride", cat: "transportation", amount: -185, date: "Feb 14" },
];

const mockBudgets = [
  { category: "Food", spent: 4200, limit: 5000 },
  { category: "Transport", spent: 2800, limit: 3000 },
  { category: "Entertainment", spent: 950, limit: 2000 },
];

const mockGoals = [
  { name: "Emergency Fund", current: 45000, target: 100000, days: 142 },
  { name: "Japan Trip", current: 28000, target: 50000, days: 87 },
  { name: "New Laptop", current: 12500, target: 35000, days: null },
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
            Track spending, set budgets, grow savings, and see it all on one
            smart dashboard. ExitPlan is the minimalist financial tracker
            built for clarity, not complexity.
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
          {/* Browser chrome */}
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-400/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/70" />
            <div className="h-3 w-3 rounded-full bg-green-400/70" />
            <span className="ml-3 text-xs text-muted-foreground">
              exitplan.app/dashboard
            </span>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Balance cards row */}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Total Balance", value: "₱42,267.50", color: "text-foreground" },
                { label: "Income", value: "₱33,500.00", color: "text-green-600" },
                { label: "Expenses", value: "₱7,232.50", color: "text-foreground" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="rounded-lg border border-border/40 bg-background p-4"
                >
                  <p className="text-xs text-muted-foreground">{card.label}</p>
                  <p className={`mt-1 text-xl font-bold ${card.color}`}>
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Budget Alerts + Goals row */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Budget Alerts */}
              <div className="rounded-lg border border-border/40 bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Budget Status</p>
                  <span className="text-xs font-medium text-yellow-600">1 alert</span>
                </div>
                {mockBudgets.map((b) => {
                  const pct = (b.spent / b.limit) * 100;
                  const isWarning = pct >= 75;
                  const isOver = pct > 100;
                  return (
                    <div key={b.category} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          {isWarning ? (
                            <AlertTriangle className={`h-3 w-3 ${isOver ? "text-red-500" : "text-yellow-500"}`} />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                          )}
                          <span className="font-medium">{b.category}</span>
                        </span>
                        <span className="text-muted-foreground">
                          ₱{b.spent.toLocaleString()} / ₱{b.limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isOver ? "bg-red-500" : isWarning ? "bg-yellow-500" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Goals */}
              <div className="rounded-lg border border-border/40 bg-background p-4 space-y-3">
                <p className="text-sm font-semibold">Goals</p>
                {mockGoals.map((g) => {
                  const pct = (g.current / g.target) * 100;
                  return (
                    <div key={g.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium">{g.name}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          {pct.toFixed(0)}%
                          {g.days && (
                            <span className="flex items-center gap-0.5">
                              <Clock className="h-3 w-3" />
                              {g.days}d
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary/60"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="rounded-lg border border-border/40 bg-background p-4">
              <p className="text-sm font-semibold mb-3">Recent Transactions</p>
              <div className="space-y-2.5">
                {mockTransactions.map((tx) => (
                  <div key={tx.desc} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        tx.amount > 0
                          ? "bg-green-100 text-green-600"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{tx.desc}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {tx.cat} &middot; {tx.date}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold shrink-0 ${
                        tx.amount > 0 ? "text-green-600" : "text-foreground"
                      }`}
                    >
                      {tx.amount > 0 ? "+" : ""}₱
                      {Math.abs(tx.amount).toLocaleString("en-PH", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
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
              No ads, no premium upsells, no data selling. Just a clean tool
              that helps you take control of your finances.
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
      <section className="border-t border-border/50">
        <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple by design
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              No setup wizards. No onboarding flows. Sign up and start tracking
              in under a minute.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Add transactions",
                description:
                  "Log your income and expenses as they happen. Categorize them with one tap.",
              },
              {
                step: "2",
                title: "Set budgets & goals",
                description:
                  "Create monthly spending limits and savings targets. Copy budgets between months with one click.",
              },
              {
                step: "3",
                title: "See everything",
                description:
                  "Your dashboard shows balance, budget alerts, goal progress, charts, and recent activity — all in one place.",
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

      {/* CTA */}
      <section className="border-t border-border/50 bg-muted/30">
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
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
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
