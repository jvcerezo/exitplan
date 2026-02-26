"use client";

import Link from "next/link";
import { CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBudgetSummary } from "@/hooks/use-budgets";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function getFirstOfMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

export function BudgetAlerts() {
  const currentMonth = getFirstOfMonth();
  const { data, isLoading } = useBudgetSummary(currentMonth);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="h-5 w-28 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[40, 55, 35].map((w, i) => (
            <div key={i} className="space-y-1.5 animate-pulse">
              <div className="h-3 bg-muted rounded" style={{ width: `${w}%` }} />
              <div className="h-1.5 w-full bg-muted rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // No budgets set
  if (!data || data.budgets.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Budget Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            No budgets set this month.
          </p>
          <Link
            href="/budgets"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Set up budgets
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Compute all budgets with their status
  const budgetItems = data.budgets
    .map((budget) => {
      const spent = data.spentByCategory[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { budget, spent, percentage };
    })
    .sort((a, b) => b.percentage - a.percentage);

  const alerts = budgetItems.filter((a) => a.percentage >= 75);
  const totalPct =
    data.totalBudget > 0 ? (data.totalSpent / data.totalBudget) * 100 : 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base">Budget Status</CardTitle>
        {alerts.length > 0 && (
          <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
            {alerts.length} alert{alerts.length > 1 ? "s" : ""}
          </span>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget summary */}
        <div className="space-y-2 pb-3 border-b">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Spent</span>
            <span className="font-semibold">
              {formatCurrency(data.totalSpent)} / {formatCurrency(data.totalBudget)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(totalPct, 100)}%`,
                backgroundColor: totalPct > 100 ? "#ef4444" : totalPct > 75 ? "#eab308" : "#22c55e",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            {totalPct.toFixed(0)}% used
          </p>
        </div>

        {/* All budgets */}
        {budgetItems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No budgets set this month.
          </p>
        ) : (
          <div className="space-y-2.5 max-h-64 overflow-y-auto">
            {budgetItems.map(({ budget, spent, percentage }) => {
              const isOver = percentage > 100;
              const remaining = Math.round((budget.amount - spent) * 100) / 100;
              const statusColor =
                percentage >= 75 ? (isOver ? "text-red-500" : "text-yellow-500") : "text-green-600";
              const barColor =
                percentage >= 75 ? (isOver ? "bg-red-500" : "bg-yellow-500") : "bg-green-600";

              return (
                <div key={budget.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium capitalize truncate flex-1">
                      {budget.category}
                    </span>
                    <span className={cn("text-xs font-medium shrink-0 ml-2", statusColor)}>
                      {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", barColor)}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Link
          href="/budgets"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Manage Budgets
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}
