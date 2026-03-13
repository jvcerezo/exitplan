"use client";

import { useState } from "react";
import { Upload, Minus, Plus } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { ImportTransactionsDialog } from "@/components/transactions/import-transactions-dialog";
import { Button } from "@/components/ui/button";

export default function TransactionsPage() {
  const [importOpen, setImportOpen] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Manage and review all your financial activity
          </p>
        </div>

        {/* Actions (mobile + desktop) */}
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setImportOpen(true)}
            className="h-9 w-full gap-1.5 sm:h-10 sm:w-auto"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>

          <div className="hidden sm:flex items-center gap-2">
            <AddTransactionDialog
              type="income"
              trigger={
                <Button className="h-10">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Income
                </Button>
              }
            />
            <AddTransactionDialog
              type="expense"
              trigger={
                <Button variant="outline" className="h-10">
                  <Minus className="h-4 w-4 mr-1.5" />
                  Add Expense
                </Button>
              }
            />
          </div>
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
