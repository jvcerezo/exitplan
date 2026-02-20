"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteBudget } from "@/hooks/use-budgets";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Budget } from "@/lib/types/database";

interface BudgetCardProps {
  budget: Budget;
  spent: number;
}

export function BudgetCard({ budget, spent }: BudgetCardProps) {
  const deleteBudget = useDeleteBudget();
  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  function getProgressColor(pct: number) {
    if (pct > 100) return "bg-red-500";
    if (pct >= 75) return "bg-yellow-500";
    return "bg-green-500";
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {budget.category}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => deleteBudget.mutate(budget.id)}
            disabled={deleteBudget.isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">
            {formatCurrency(spent)} spent
          </span>
          <span className="font-medium">{formatCurrency(budget.amount)}</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              getProgressColor(percentage)
            )}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>

        <p
          className={cn(
            "text-xs font-medium",
            percentage > 100
              ? "text-red-500"
              : percentage >= 75
                ? "text-yellow-500"
                : "text-muted-foreground"
          )}
        >
          {percentage.toFixed(0)}% spent
        </p>
      </CardContent>
    </Card>
  );
}
