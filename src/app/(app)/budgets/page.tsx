"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { BudgetCard } from "@/components/budgets/budget-card";
import { useBudgetSummary } from "@/hooks/use-budgets";
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set monthly spending limits per category
          </p>
        </div>
        <AddBudgetDialog month={month} />
      </div>

      {/* Month picker */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
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
          onClick={() => setMonth((m) => shiftMonth(m, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary bar */}
      {data && (
        <div className="flex items-center justify-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Budget: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalBudget)}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div>
            <span className="text-muted-foreground">Total Spent: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalSpent)}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
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
        <p className="text-center text-muted-foreground py-12">
          No budgets set for {formatMonthLabel(month)}. Click &quot;Add
          Budget&quot; to get started.
        </p>
      )}
    </div>
  );
}
