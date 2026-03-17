import { BalanceCard } from "@/components/dashboard/balance-card";
import { MobileDashboardSections } from "@/components/dashboard/mobile-dashboard-sections";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import { GoalsSnapshot } from "@/components/dashboard/goals-snapshot";
import { TrendsSection } from "@/components/dashboard/trends-section";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsRateIndicator } from "@/components/dashboard/savings-rate-indicator";
import { EmergencyFundStatus } from "@/components/dashboard/emergency-fund-status";
import { SafeToSpendCard } from "@/components/dashboard/safe-to-spend-card";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { AdultingScoreCard } from "@/components/dashboard/adulting-score-card";
import { NextStepsCarousel } from "@/components/dashboard/next-steps-carousel";
import { EmergencyRunwayCard } from "@/components/dashboard/emergency-runway-card";

export default function DashboardPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your adulting journey at a glance
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <AddTransactionDialog type="income" />
          <AddTransactionDialog type="expense" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Adulting Score + Next Steps (always visible, both mobile & desktop) */}
        <section className="order-1 space-y-4">
          <AdultingScoreCard />
          <NextStepsCarousel />
        </section>

        {/* Balance overview */}
        <section className="order-2 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Overview
          </p>
          <BalanceCard />
        </section>

        <div className="order-3 md:hidden">
          <MobileDashboardSections />
        </div>

        <section className="hidden md:block order-4 md:order-6 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Trends
          </p>
          <TrendsSection />
        </section>

        <section className="hidden md:block order-5 md:order-3">
          <HealthScoreCard />
        </section>

        <section className="hidden md:block order-6 md:order-4 space-y-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Planning
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetAlerts />
            <GoalsSnapshot />
          </div>
        </section>

        <section className="hidden md:block order-7 md:order-5 space-y-6">
          <SafeToSpendCard />
          <div className="grid gap-6 lg:grid-cols-2">
            <SavingsRateIndicator />
            <EmergencyFundStatus targetMonths={3} />
          </div>
          <EmergencyRunwayCard />
        </section>

        <section className="hidden md:block order-8 md:order-7">
          <SpendingInsights />
        </section>

        <section className="hidden md:block order-9 md:order-8">
          <RecentTransactions />
        </section>
      </div>
    </div>
  );
}
