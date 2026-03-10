"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { ImportTransactionsDialog } from "@/components/transactions/import-transactions-dialog";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const [importOpen, setImportOpen] = useState(false);

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
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="gap-1.5"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <AddTransactionDialog type="expense" />
          <AddTransactionDialog type="income" />
        </div>
      </div>

      {/* Table */}
      <TransactionsTable />

      <ImportTransactionsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}
