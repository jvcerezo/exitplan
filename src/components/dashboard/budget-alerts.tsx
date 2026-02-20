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

  // Compute alerts
  const alerts = data.budgets
    .map((budget) => {
      const spent = data.spentByCategory[budget.category] || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      return { budget, spent, percentage };
    })
    .filter((a) => a.percentage >= 75)
    .sort((a, b) => b.percentage - a.percentage);

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
        {alerts.length === 0 ? (
          /* All healthy */
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              <span className="font-medium text-green-600 dark:text-green-400">
                All budgets on track
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(data.totalSpent)} of{" "}
              {formatCurrency(data.totalBudget)} spent ({totalPct.toFixed(0)}%)
            </p>
          </div>
        ) : (
          /* Show alerts */
          <div className="space-y-3">
            {alerts.map(({ budget, spent, percentage }) => {
              const isOver = percentage > 100;
              const remaining = Math.round((budget.amount - spent) * 100) / 100;

              return (
                <div key={budget.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <AlertTriangle
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isOver ? "text-red-500" : "text-yellow-500"
                        )}
                      />
                      <span className="font-medium capitalize truncate">
                        {budget.category}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium shrink-0 ml-2",
                        isOver ? "text-red-500" : "text-yellow-500"
                      )}
                    >
                      {isOver
                        ? `${formatCurrency(Math.abs(remaining))} over`
                        : `${formatCurrency(remaining)} left`}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isOver ? "bg-red-500" : "bg-yellow-500"
                      )}
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
