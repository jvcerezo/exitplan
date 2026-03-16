"use client";

import Link from "next/link";
import { Target, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGoals } from "@/hooks/use-goals";
import { UpdateAmountDialog } from "@/components/goals/update-amount-dialog";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Goal } from "@/lib/types/database";

function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-primary";
  if (pct >= 75) return "bg-primary/80";
  if (pct >= 50) return "bg-primary/60";
  if (pct >= 25) return "bg-primary/40";
  return "bg-primary/30";
}

function sortGoals(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    // Goals with deadlines come first, sorted by nearest
    if (a.deadline && b.deadline) {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;

    // Then by progress % descending
    const pctA =
      a.target_amount > 0 ? a.current_amount / a.target_amount : 0;
    const pctB =
      b.target_amount > 0 ? b.current_amount / b.target_amount : 0;
    return pctB - pctA;
  });
}

export function GoalsSnapshot() {
  const { data: goals, isLoading } = useGoals();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="h-5 w-24 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-2 w-full bg-muted rounded-full" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const activeGoals = goals?.filter((g) => !g.is_completed) || [];
  const sorted = sortGoals(activeGoals).slice(0, 3);
  const totalGoals = goals?.length || 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Active Goals</CardTitle>
          {activeGoals.length > 3 && (
            <span className="text-xs font-medium text-muted-foreground">
              {activeGoals.length - 3} more
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sorted.length === 0 ? (
          <div className="space-y-3 py-4">
            <div className="text-center space-y-2">
              <Target className="h-8 w-8 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">No active goals yet</p>
            </div>
            <AddGoalDialog />
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {sorted.map((goal) => {
                const pct = Math.min(
                  100,
                  goal.target_amount > 0
                    ? (goal.current_amount / goal.target_amount) * 100
                    : 0
                );

                const daysLeft = goal.deadline
                  ? Math.max(
                      0,
                      Math.ceil(
                        (new Date(goal.deadline + "T00:00:00").getTime() -
                          Date.now()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )
                  : null;

                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold truncate">
                            {goal.name}
                          </span>
                          {daysLeft !== null && daysLeft <= 30 && (
                            <span
                              className={cn(
                                "flex items-center gap-0.5 text-xs font-medium",
                                daysLeft <= 7 ? "text-red-500" : "text-amber-500"
                              )}
                            >
                              <Clock className="h-3 w-3" />
                              {daysLeft === 0 ? "Due today!" : `${daysLeft}d left`}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(goal.current_amount)} of{" "}
                          {formatCurrency(goal.target_amount)} • {pct.toFixed(0)}%
                        </p>
                      </div>
                      <UpdateAmountDialog goal={goal} />
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          getProgressColor(pct)
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <AddGoalDialog />
              {totalGoals > 0 && (
                <Link
                  href="/goals"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  View all ({totalGoals})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
