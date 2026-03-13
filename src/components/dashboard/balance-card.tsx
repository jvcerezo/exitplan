"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Target, DollarSign } from "lucide-react";
import { useTransactionsSummary } from "@/hooks/use-transactions";
import { cn, formatCurrency } from "@/lib/utils";

export function BalanceCard() {
  const { data: summary, isLoading, error } = useTransactionsSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className={cn("animate-pulse", i === 0 ? "col-span-2 md:col-span-1" : "col-span-1")}>
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium">Could not load balance</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Check your Supabase connection and ensure the transactions table exists."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Total Balance",
      value: summary?.balance ?? 0,
      icon: Wallet,
      color: "text-foreground",
    },
    {
      title: "Income",
      value: summary?.income ?? 0,
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Expenses",
      value: summary?.expenses ?? 0,
      icon: TrendingDown,
      color: "text-foreground",
    },
  ];

  const breakdown = summary?.breakdown;

  return (
    <div className="space-y-3">
      {/* Row 1: Total Balance (full width) + Income + Expenses */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {cards.map((card, index) => (
          <Card key={card.title} className={cn(index === 0 ? "col-span-2 md:col-span-1" : "col-span-1")}>
            <CardHeader className="flex flex-row items-center justify-between pb-1.5">
              <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground sm:text-sm sm:tracking-normal">
                {card.title}
              </CardTitle>
              <card.icon className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${card.color}`} />
            </CardHeader>
            <CardContent className="pt-1">
              <div className={`text-lg font-bold sm:text-2xl ${card.color}`}>
                {formatCurrency(card.value)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2: Breakdown — always visible, 3 equal columns */}
      {breakdown && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Wallet className="h-3 w-3 shrink-0" />
              <span className="truncate">Accounts</span>
            </div>
            <p className="text-xs font-semibold tabular-nums sm:text-sm">
              {formatCurrency(breakdown.inAccounts)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Target className="h-3 w-3 shrink-0" />
              <span className="truncate">Goals</span>
            </div>
            <p className="text-xs font-semibold tabular-nums sm:text-sm">
              {formatCurrency(breakdown.inGoals)}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5">
            <div className="mb-1 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <DollarSign className="h-3 w-3 shrink-0" />
              <span className="truncate">Budgets</span>
            </div>
            <p className="text-xs font-semibold tabular-nums sm:text-sm">
              {formatCurrency(breakdown.budgetAllocated)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
