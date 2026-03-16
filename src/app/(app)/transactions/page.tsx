"use client";

import { useState } from "react";
import { Upload, Minus, Plus, ChevronDown, ChevronRight, Landmark, CheckCircle2, Circle } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";
import { ImportTransactionsDialog } from "@/components/transactions/import-transactions-dialog";
import { Button } from "@/components/ui/button";
import { useContributions } from "@/hooks/use-contributions";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const TYPE_META: Record<string, { label: string; color: string; bg: string }> = {
  sss: { label: "SSS", color: "text-blue-500", bg: "bg-blue-500/10" },
  philhealth: { label: "PhilHealth", color: "text-green-500", bg: "bg-green-500/10" },
  pagibig: { label: "Pag-IBIG", color: "text-orange-500", bg: "bg-orange-500/10" },
};

function ContributionsSection() {
  const [open, setOpen] = useState(false);
  const { data: contributions, isLoading } = useContributions();

  if (isLoading || !contributions || contributions.length === 0) return null;

  // Group by period, sorted descending
  const byPeriod = contributions.reduce<Record<string, typeof contributions>>((acc, c) => {
    (acc[c.period] ??= []).push(c);
    return acc;
  }, {});
  const periods = Object.keys(byPeriod).sort((a, b) => b.localeCompare(a));

  const totalPaid = contributions.filter((c) => c.is_paid).reduce((sum, c) => sum + c.employee_share, 0);

  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Government Contributions</span>
          <Badge variant="secondary" className="text-[10px]">{periods.length} months</Badge>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-destructive">− {formatCurrency(totalPaid)}</span>
          {open ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/60 divide-y divide-border/40">
          {periods.map((period) => {
            const items = byPeriod[period];
            const [yr, mo] = period.split("-");
            const label = new Date(Number(yr), Number(mo) - 1).toLocaleDateString("en-PH", { month: "short", year: "numeric" });
            const allPaid = items.every((c) => c.is_paid);
            const periodTotal = items.reduce((sum, c) => sum + c.employee_share, 0);
            return (
              <div key={period} className="px-4 py-2.5 flex items-center justify-between gap-3 bg-card hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  {allPaid
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                    : <Circle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  <div>
                    <p className="text-xs font-medium">{label}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {items.map((c) => (
                        <span key={c.id} className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_META[c.type].bg} ${TYPE_META[c.type].color}`}>
                          {TYPE_META[c.type].label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-destructive shrink-0">− {formatCurrency(periodTotal)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

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

      {/* Gov't contributions as expense entries */}
      <ContributionsSection />

      <ImportTransactionsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
      />
    </div>
  );
}
