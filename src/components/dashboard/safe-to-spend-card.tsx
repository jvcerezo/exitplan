"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Wallet, TrendingDown, Target, Zap } from "lucide-react";
import { useSafeToSpend } from "@/hooks/use-safe-to-spend";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function SafeToSpendCard() {
  const { data, isLoading, error } = useSafeToSpend();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-36 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          <div className="h-12 w-48 bg-muted rounded" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-3 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <p className="text-sm font-medium">Could not load safe to spend</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const hasIncome = data.monthlyIncome > 0;
  const isLow = data.safeToSpend < data.monthlyIncome * 0.1;
  const isEmpty = data.safeToSpend <= 0;

  const statusColor = isEmpty
    ? "text-red-500"
    : isLow
    ? "text-amber-500"
    : "text-green-600";

  const breakdown = [
    {
      label: "Monthly Income",
      value: data.monthlyIncome,
      icon: Wallet,
      sign: "+",
      color: "text-emerald-600",
    },
    {
      label: "Budget Limits",
      value: data.budgetAllocated,
      icon: TrendingDown,
      sign: "−",
      color: "text-muted-foreground",
    },
    {
      label: "Goal Contributions",
      value: data.goalContributions,
      icon: Target,
      sign: "−",
      color: "text-muted-foreground",
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Safe to Spend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big number */}
        <div>
          <p className={cn("text-3xl font-bold", statusColor)}>
            {formatCurrency(data.safeToSpend)}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isEmpty
              ? "Budget fully committed this month"
              : isLow
              ? "Running low — check your budgets"
              : "freely available this month"}
          </p>
        </div>

        {/* Progress bar: spent vs safe */}
        {hasIncome && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Spent</span>
              <span>{formatCurrency(data.alreadySpent)} of {formatCurrency(data.budgetAllocated || data.monthlyIncome)}</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  data.budgetAllocated > 0
                    ? (data.alreadySpent / data.budgetAllocated) > 0.9
                      ? "bg-red-500"
                      : (data.alreadySpent / data.budgetAllocated) > 0.7
                      ? "bg-amber-500"
                      : "bg-primary"
                    : "bg-primary"
                )}
                style={{
                  width: `${Math.min(
                    100,
                    Math.round(
                      (data.alreadySpent /
                        (data.budgetAllocated || data.monthlyIncome || 1)) *
                        100
                    )
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Breakdown */}
        <div className="space-y-2 border-t pt-3">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </div>
              <span className={cn("font-medium tabular-nums", item.color)}>
                {item.sign} {formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>

        {!hasIncome && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
            Add income transactions this month to see your safe-to-spend number
          </p>
        )}
      </CardContent>
    </Card>
  );
}
