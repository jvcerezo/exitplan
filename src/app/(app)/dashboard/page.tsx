import { BalanceCard } from "@/components/dashboard/balance-card";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import { GoalsSnapshot } from "@/components/dashboard/goals-snapshot";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
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
        <AddTransactionDialog />
      </div>

      {/* Balance Overview */}
      <BalanceCard />

      {/* Budget Alerts + Goals Snapshot */}
      <div className="grid gap-6 lg:grid-cols-2">
        <BudgetAlerts />
        <GoalsSnapshot />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart />
        <MonthlyTrendChart />
      </div>

      {/* Spending Insights */}
      <SpendingInsights />

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
