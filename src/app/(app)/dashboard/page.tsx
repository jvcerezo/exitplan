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
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your path to financial freedom
          </p>
        </div>
        <div className="flex gap-2">
          <AddTransactionDialog type="expense" />
          <AddTransactionDialog type="income" />
        </div>
      </div>

      {/* Tier 1: Essential Overview */}
      <BalanceCard />
      <HealthScoreCard />

      {/* Tier 2: Core Status + Key Goals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetAlerts />
        <GoalsSnapshot />
      </div>

      {/* Tier 2: Savings & Emergency Fund */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SavingsRateIndicator />
        <EmergencyFundStatus targetMonths={3} />
      </div>

      {/* Tier 3: Analytics & Trends */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart />
        <MonthlyTrendChart />
      </div>

      {/* Tier 3: Additional Context */}
      <div className="grid gap-6 lg:grid-cols-2">
        <NetWorthChart />
        <SpendingInsights />
      </div>

      {/* Tier 3: Recent Activity */}
      <RecentTransactions />
    </div>
  );
}
