"use client";

import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTransactionsSummary } from "@/hooks/use-transactions";
import { useSavingsRate } from "@/hooks/use-savings-rate";
import { formatCurrency, cn } from "@/lib/utils";

export function FinancialSummaryCompact() {
  const { data: summary, isLoading: txLoading } = useTransactionsSummary();
  const { data: savings, isLoading: savingsLoading } = useSavingsRate();

  const isLoading = txLoading || savingsLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <div className="h-12 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const items = [
    {
      label: "Balance",
      value: summary?.balance ?? 0,
      icon: Wallet,
      color: "text-foreground",
    },
    {
      label: "Income",
      value: summary?.income ?? 0,
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Expenses",
      value: Math.abs(summary?.expenses ?? 0),
      icon: TrendingDown,
      color: "text-foreground",
    },
    {
      label: "Savings Rate",
      value: savings?.savingsRatePercent ?? 0,
      icon: PiggyBank,
      color: (savings?.savingsRatePercent ?? 0) >= 20 ? "text-green-600 dark:text-green-400" : "text-amber-500",
      isPercent: true,
    },
  ];

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
        This Month
      </p>
      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => (
          <Card key={item.label}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
              <p className={cn("text-lg font-bold tabular-nums", item.color)}>
                {item.isPercent
                  ? `${item.value}%`
                  : formatCurrency(item.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
