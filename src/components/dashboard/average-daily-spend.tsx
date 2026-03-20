"use client";

import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

function useAverageDailySpend() {
  return useQuery({
    queryKey: ["dashboard", "average-daily-spend"],
    queryFn: async () => {
      const supabase = createClient();
      const now = new Date();
      const daysElapsed = now.getDate();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const daysRemaining = daysInMonth - daysElapsed;

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const budgetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [txResult, budgetResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, category")
          .lt("amount", 0)
          .neq("category", "transfer")
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase.from("budgets").select("amount").eq("month", budgetMonth),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);

      const totalExpenses = (txResult.data ?? []).reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );
      const totalBudget = (budgetResult.data ?? []).reduce(
        (sum, b) => sum + Number(b.amount),
        0
      );

      const avgDailySpend = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
      const dailyBudgetRemaining =
        daysRemaining > 0 && totalBudget > 0
          ? Math.max(0, (totalBudget - totalExpenses) / daysRemaining)
          : 0;

      return {
        avgDailySpend,
        dailyBudgetRemaining,
        totalBudget,
        totalExpenses,
        daysRemaining,
        hasBudget: totalBudget > 0,
        isOverBudget: totalBudget > 0 && totalExpenses > totalBudget,
      };
    },
  });
}

export function AverageDailySpend() {
  const { data, isLoading } = useAverageDailySpend();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-36 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="animate-pulse">
          <div className="h-8 w-28 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-base">Average Daily Spend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="text-xl font-bold">{formatCurrency(data.avgDailySpend)}</p>
          </div>
          {data.hasBudget && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Daily Budget Left</p>
              <p
                className={cn(
                  "text-xl font-bold",
                  data.isOverBudget
                    ? "text-red-500"
                    : "text-green-600"
                )}
              >
                {formatCurrency(data.dailyBudgetRemaining)}
              </p>
            </div>
          )}
        </div>
        {data.hasBudget && data.daysRemaining > 0 && (
          <div
            className={cn(
              "rounded-lg px-3 py-2 text-xs font-medium",
              data.isOverBudget
                ? "bg-red-500/10 text-red-600 dark:text-red-400"
                : "bg-green-500/10 text-green-700 dark:text-green-400"
            )}
          >
            {data.isOverBudget
              ? "You have exceeded your budget for this month"
              : `You can spend ~${formatCurrency(data.dailyBudgetRemaining)}/day to stay on track`}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
