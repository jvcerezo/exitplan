import { BalanceCard } from "@/components/dashboard/balance-card";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
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

      {/* Recent Transactions */}
      <RecentTransactions />
    </div>
  );
}
