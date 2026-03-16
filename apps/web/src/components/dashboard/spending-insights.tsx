"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/types/database";

function getCurrentMonthRange() {
  const now = new Date();
  return {
    from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0],
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0],
  };
}

function computeInsights(transactions: Transaction[]) {
  const expenses = transactions.filter((tx) => tx.amount < 0 && tx.category !== "transfer");

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  for (const tx of expenses) {
    categoryTotals[tx.category] =
      (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
  }
  const topCategory =
    Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    "N/A";

  // Number of transactions this month (excluding transfers)
  const transactionCount = transactions.filter((tx) => tx.category !== "transfer").length;

  // Average expense amount
  const avgAmount =
    expenses.length > 0
      ? expenses.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) /
        expenses.length
      : 0;

  // Biggest single expense
  const biggestExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((tx) => Math.abs(tx.amount)))
      : 0;

  return {
    topCategory,
    transactionCount,
    avgAmount,
    biggestExpense,
  };
}

export function SpendingInsights() {
  const monthRange = getCurrentMonthRange();
  const { data: transactions, isLoading, error } = useTransactions({
    dateFrom: monthRange.from,
    dateTo: monthRange.to,
  });

  const insights = transactions ? computeInsights(transactions) : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">This Month's Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1.5 animate-pulse">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-6 w-24 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Could not load insights</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Failed to load spending insights."}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground">Top Spending</p>
                <p className="font-bold capitalize">{insights?.topCategory}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Transactions</p>
                <p className="font-bold text-right">{insights?.transactionCount}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-xs text-muted-foreground">Average Amount</p>
                <p className="font-bold">{formatCurrency(insights?.avgAmount ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Largest Expense</p>
                <p className="font-bold text-right">{formatCurrency(insights?.biggestExpense ?? 0)}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
