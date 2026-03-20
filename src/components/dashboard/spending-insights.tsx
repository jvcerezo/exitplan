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

interface TopCategory {
  category: string;
  amount: number;
  count: number;
}

function computeInsights(transactions: Transaction[]) {
  const expenses = transactions.filter((tx) => tx.amount < 0 && tx.category !== "transfer");

  // Category totals with counts
  const categoryData: Record<string, { amount: number; count: number }> = {};
  for (const tx of expenses) {
    if (!categoryData[tx.category]) {
      categoryData[tx.category] = { amount: 0, count: 0 };
    }
    categoryData[tx.category].amount += Math.abs(tx.amount);
    categoryData[tx.category].count += 1;
  }

  // Top categories sorted by amount
  const topCategories: TopCategory[] = Object.entries(categoryData)
    .map(([category, data]) => ({
      category,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  const topCategory = topCategories[0]?.category ?? "N/A";

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
    topCategories,
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
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground">Average Amount</p>
                <p className="font-bold">{formatCurrency(insights?.avgAmount ?? 0)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Largest Expense</p>
                <p className="font-bold text-right">{formatCurrency(insights?.biggestExpense ?? 0)}</p>
              </div>
            </div>

            {/* Top Categories */}
            {insights?.topCategories && insights.topCategories.length > 0 && (
              <div className="pt-1 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Top Categories
                </p>
                <div className="space-y-2">
                  {insights.topCategories.map((cat, i) => {
                    const maxAmount = insights.topCategories[0].amount;
                    const barWidth = maxAmount > 0 ? (cat.amount / maxAmount) * 100 : 0;
                    return (
                      <div key={cat.category} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground w-4 text-center">
                              {i + 1}
                            </span>
                            <span className="font-medium capitalize truncate">
                              {cat.category}
                            </span>
                          </div>
                          <div className="text-right shrink-0 ml-2">
                            <span className="text-xs font-semibold">
                              {formatCurrency(cat.amount)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                              ({cat.count}x)
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary/60 transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
