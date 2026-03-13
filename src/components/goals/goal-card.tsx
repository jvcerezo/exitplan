"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Clock, Target } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Goal } from "@/lib/types/database";
import { EditGoalDialog } from "./edit-goal-dialog";
import { DeleteGoalDialog } from "./delete-goal-dialog";
import { UpdateAmountDialog } from "./update-amount-dialog";

function getProgressColor(pct: number): string {
  if (pct >= 100) return "bg-primary";
  if (pct >= 75) return "bg-primary/80";
  if (pct >= 50) return "bg-primary/60";
  if (pct >= 25) return "bg-primary/40";
  return "bg-primary/30";
}

export function GoalCard({ goal }: { goal: Goal }) {
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
          (new Date(goal.deadline + "T00:00:00").getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  return (
    <Card
      className={`rounded-2xl border border-border/60 bg-card/95 p-3 shadow-sm sm:p-6 ${goal.is_completed ? "border-primary/30 bg-primary/[0.02]" : ""}`}
    >
      <CardHeader className="flex flex-row items-start justify-between px-0 pb-3 pt-0">
        <div className="flex min-w-0 items-start gap-2.5">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              goal.is_completed
                ? "bg-primary/10 text-primary"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {goal.is_completed ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <Target className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <CardTitle className="mb-0.5 truncate text-sm font-semibold sm:text-base">{goal.name}</CardTitle>
            <p className="text-xs capitalize leading-tight text-muted-foreground">
              {goal.category}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <EditGoalDialog goal={goal} />
          <DeleteGoalDialog id={goal.id} name={goal.name} />
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-0 pb-0 sm:space-y-4">
        {/* Progress bar */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-lg font-bold">
              {formatCurrency(goal.current_amount)}
            </span>
            <span className="text-[11px] text-muted-foreground sm:text-xs">
              of {formatCurrency(goal.target_amount)}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getProgressColor(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground sm:text-xs">
              {pct.toFixed(0)}% complete
            </span>
            {daysLeft !== null && !goal.is_completed && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground sm:text-xs">
                <Clock className="h-3 w-3" />
                {daysLeft === 0
                  ? "Due today"
                  : `${daysLeft} day${daysLeft === 1 ? "" : "s"} left`}
              </span>
            )}
            {goal.is_completed && (
              <span className="text-[11px] font-semibold text-primary sm:text-xs">
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Add funds button */}
        {!goal.is_completed && (
          <div className="flex justify-start">
            <UpdateAmountDialog goal={goal} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
