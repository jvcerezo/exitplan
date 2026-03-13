import { BalanceCard } from "@/components/dashboard/balance-card";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import { GoalsSnapshot } from "@/components/dashboard/goals-snapshot";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { SpendingComparison } from "@/components/dashboard/spending-comparison";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SavingsRateIndicator } from "@/components/dashboard/savings-rate-indicator";
import { EmergencyFundStatus } from "@/components/dashboard/emergency-fund-status";
import { SafeToSpendCard } from "@/components/dashboard/safe-to-spend-card";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";

export default function DashboardPage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your path to financial freedom
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          <AddTransactionDialog type="income" />
          <AddTransactionDialog type="expense" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Mobile-first: balance + charts first */}
        <section className="order-1 md:order-1 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Overview
          </p>
          <BalanceCard />
        </section>

        <section className="order-2 md:order-5 space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Trends
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <SpendingChart />
            <MonthlyTrendChart />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <NetWorthChart />
            <SpendingComparison />
          </div>
        </section>

        <section className="order-3 md:order-2">
          <HealthScoreCard />
        </section>

        <section className="order-4 md:order-3 space-y-6">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Planning
          </p>
          <div className="grid gap-6 lg:grid-cols-2">
            <BudgetAlerts />
            <GoalsSnapshot />
          </div>
        </section>

        <section className="order-5 md:order-4 space-y-6">
          <SafeToSpendCard />
          <div className="grid gap-6 lg:grid-cols-2">
            <SavingsRateIndicator />
            <EmergencyFundStatus targetMonths={3} />
          </div>
        </section>

        <section className="order-6 md:order-6">
          <SpendingInsights />
        </section>

        <section className="order-7 md:order-7">
          <RecentTransactions />
        </section>
      </div>
    </div>
  );
}
