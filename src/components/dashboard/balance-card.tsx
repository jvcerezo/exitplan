"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react";
import { useTransactionsSummary } from "@/hooks/use-transactions";
import { formatCurrency } from "@/lib/utils";

export function BalanceCard() {
  const { data: summary, isLoading, error } = useTransactionsSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
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

  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.color}`}>
              {formatCurrency(card.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
