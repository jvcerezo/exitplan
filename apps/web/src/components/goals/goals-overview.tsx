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
      iconColor: "text-muted-foreground",
    },
    {
      title: "Completed",
      value: String(summary?.completed ?? 0),
      icon: CheckCircle2,
      color: "text-primary",
      iconColor: "text-primary",
    },
    {
      title: "Total Saved",
      value: formatCurrency(summary?.totalSaved ?? 0),
      icon: TrendingUp,
      color: "text-green-600",
      iconColor: "text-green-600",
    },
  ];

  const totalGoals = (summary?.active ?? 0) + (summary?.completed ?? 0);
  const completionRate = totalGoals > 0
    ? Math.round(((summary?.completed ?? 0) / totalGoals) * 100)
    : 0;

  return (
    <>
      <Card className="md:hidden rounded-2xl border-border/60 bg-card/95 shadow-sm">
        <CardContent className="p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Goals Overview
            </p>
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
              {summary?.completed ?? 0}/{totalGoals} complete
            </span>
          </div>

          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-muted/70">
            <div
              className="h-full rounded-full bg-primary/80 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="divide-y divide-border/60 rounded-xl border border-border/50 bg-background/35">
            {cards.map((card) => (
              <div key={card.title} className="flex items-center justify-between px-2.5 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted/70">
                    <card.icon className={`h-3.5 w-3.5 ${card.iconColor}`} />
                  </div>
                  <span className="truncate text-[11px] font-medium text-foreground/85">
                    {card.title}
                  </span>
                </div>
                <span className={`truncate text-sm font-bold ${card.color}`}>
                  {card.value}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="hidden md:grid gap-4 sm:grid-cols-2 md:grid-cols-3">
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
    </>
  );
}
