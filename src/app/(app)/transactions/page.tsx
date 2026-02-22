import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export const dynamic = "force-dynamic";

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and review all your financial activity
          </p>
        </div>
        <div className="flex gap-2">
          <AddTransactionDialog type="expense" />
          <AddTransactionDialog type="income" />
        </div>
      </div>

      {/* Table */}
      <TransactionsTable />
    </div>
  );
}
