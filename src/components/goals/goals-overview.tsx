"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { useGoalsSummary } from "@/hooks/use-goals";
import { formatCurrency } from "@/lib/utils";

export function GoalsOverview() {
  const { data: summary, isLoading, error } = useGoalsSummary();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-20 bg-muted rounded" />
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
            <p className="text-sm font-medium">Could not load goals</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Check your Supabase connection and ensure the goals table exists."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const cards = [
    {
      title: "Active Goals",
      value: String(summary?.active ?? 0),
      icon: Target,
      color: "text-foreground",
    },
    {
      title: "Completed",
      value: String(summary?.completed ?? 0),
      icon: CheckCircle2,
      color: "text-primary",
    },
    {
      title: "Total Saved",
      value: formatCurrency(summary?.totalSaved ?? 0),
      icon: TrendingUp,
      color: "text-green-600",
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
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
