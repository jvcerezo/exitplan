"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/types/database";

function computeInsights(transactions: Transaction[]) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const currentMonth = transactions.filter(
    (tx) => tx.date >= startOfMonth && tx.date <= endOfMonth
  );

  const expenses = currentMonth.filter((tx) => tx.amount < 0);

  // Top spending category
  const categoryTotals: Record<string, number> = {};
  for (const tx of expenses) {
    categoryTotals[tx.category] =
      (categoryTotals[tx.category] || 0) + Math.abs(tx.amount);
  }
  const topCategory =
    Object.entries(categoryTotals).sort(([, a], [, b]) => b - a)[0]?.[0] ??
    "N/A";

  // Number of transactions this month
  const transactionCount = currentMonth.length;

  // Average transaction amount
  const avgAmount =
    currentMonth.length > 0
      ? currentMonth.reduce((sum, tx) => sum + Math.abs(tx.amount), 0) /
        currentMonth.length
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
  const { data: transactions, isLoading, error } = useTransactions();

  const insights = transactions ? computeInsights(transactions) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1 animate-pulse">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-5 w-24 bg-muted rounded" />
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Top Category</p>
              <p className="text-sm font-medium">{insights?.topCategory}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Transactions</p>
              <p className="text-sm font-medium">
                {insights?.transactionCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg. Amount</p>
              <p className="text-sm font-medium">
                {formatCurrency(insights?.avgAmount ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Biggest Expense</p>
              <p className="text-sm font-medium">
                {formatCurrency(insights?.biggestExpense ?? 0)}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
