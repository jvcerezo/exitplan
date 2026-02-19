import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and review all your financial activity
          </p>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Table */}
      <TransactionsTable />
    </div>
  );
}
