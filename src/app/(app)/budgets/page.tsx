"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { BudgetCard } from "@/components/budgets/budget-card";
import { useBudgetSummary, useCopyBudgetsFromMonth } from "@/hooks/use-budgets";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getFirstOfMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function formatMonthLabel(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function shiftMonth(monthStr: string, delta: number): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return getFirstOfMonth(date);
}

export default function BudgetsPage() {
  const [month, setMonth] = useState(() => getFirstOfMonth(new Date()));
  const { data, isLoading } = useBudgetSummary(month);
  const copyBudgets = useCopyBudgetsFromMonth();

  const existingCategories = data?.budgets.map((b) => b.category) || [];
  const previousMonth = shiftMonth(month, -1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set monthly spending limits and track your expenses against them
          </p>
        </div>
        <div className="flex gap-2">
          {data && data.budgets.length === 0 && (
            <Button
              variant="outline"
              onClick={() =>
                copyBudgets.mutate({
                  sourceMonth: previousMonth,
                  targetMonth: month,
                })
              }
              disabled={copyBudgets.isPending}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copyBudgets.isPending ? "Copying..." : "Copy Last Month"}
            </Button>
          )}
          <AddBudgetDialog month={month} existingCategories={existingCategories} />
        </div>
      </div>

      {/* Month picker */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous month"
          onClick={() => setMonth((m) => shiftMonth(m, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[180px] text-center text-lg font-semibold">
          {formatMonthLabel(month)}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next month"
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary bar */}
      {data && data.budgets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Budget: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalBudget)}
            </span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <div>
            <span className="text-muted-foreground">Total Spent: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalSpent)}
            </span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <div>
            <span className="text-muted-foreground">Remaining: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalBudget - data.totalSpent)}
            </span>
          </div>
        </div>
      )}

      {/* Budget cards grid */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading budgets...</p>
      ) : data && data.budgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={data.spentByCategory[budget.category] || 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">
            No budgets set for {formatMonthLabel(month)}.
          </p>
          <p className="text-sm text-muted-foreground">
            Create budgets for your expense categories to track spending limits.
            Your transactions will automatically count against the matching budget.
          </p>
        </div>
      )}
    </div>
  );
}
