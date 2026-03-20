"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function useSpendingVelocity() {
  return useQuery({
    queryKey: ["dashboard", "spending-velocity"],
    queryFn: async () => {
      const supabase = createClient();
      const now = new Date();
      const dayOfMonth = now.getDate();

      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split("T")[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split("T")[0];

      const [thisMonthResult, lastMonthResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, category")
          .lt("amount", 0)
          .neq("category", "transfer")
          .gte("date", thisMonthStart)
          .lte("date", thisMonthEnd),
        supabase
          .from("transactions")
          .select("amount, date, category")
          .lt("amount", 0)
          .neq("category", "transfer")
          .gte("date", lastMonthStart)
          .lte("date", lastMonthEnd),
      ]);

      if (thisMonthResult.error) throw new Error(thisMonthResult.error.message);
      if (lastMonthResult.error) throw new Error(lastMonthResult.error.message);

      const thisMonthSpend = (thisMonthResult.data ?? []).reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );

      // Only count last month's spending up to the same day of month
      const lastMonthSpendSamePoint = (lastMonthResult.data ?? []).reduce(
        (sum, t) => {
          const txDay = parseInt(t.date.substring(8, 10), 10);
          if (txDay <= dayOfMonth) {
            return sum + Math.abs(t.amount);
          }
          return sum;
        },
        0
      );

      if (lastMonthSpendSamePoint === 0) {
        return null; // Not enough data
      }

      const velocityPct =
        ((thisMonthSpend - lastMonthSpendSamePoint) / lastMonthSpendSamePoint) *
        100;

      return {
        velocityPct,
        isFaster: velocityPct > 5,
        isSlower: velocityPct < -5,
        isOnPace: velocityPct >= -5 && velocityPct <= 5,
        thisMonthSpend,
        lastMonthSpendSamePoint,
      };
    },
  });
}

export function SpendingVelocity() {
  const { data, isLoading } = useSpendingVelocity();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-3 animate-pulse">
          <div className="h-5 w-48 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const Icon = data.isFaster ? ArrowUp : data.isSlower ? ArrowDown : Minus;
  const color = data.isFaster
    ? "text-red-500"
    : data.isSlower
      ? "text-green-600"
      : "text-muted-foreground";
  const bgColor = data.isFaster
    ? "bg-red-500/10"
    : data.isSlower
      ? "bg-green-500/10"
      : "bg-muted/50";

  const label = data.isOnPace
    ? "On pace with last month"
    : `Spending ${Math.abs(data.velocityPct).toFixed(0)}% ${data.isFaster ? "faster" : "slower"} than last month`;

  return (
    <Card>
      <CardContent className={cn("py-3", bgColor)}>
        <div className="flex items-center gap-2.5">
          <Icon className={cn("h-5 w-5 shrink-0", color)} />
          <div>
            <p className="text-sm font-semibold">Spending Velocity</p>
            <p className={cn("text-xs", color)}>{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
