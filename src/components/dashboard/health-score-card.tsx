"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHealthScore } from "@/hooks/use-health-score";
import { cn } from "@/lib/utils";

function getScoreColor(score: number) {
  if (score >= 71) return "text-green-600 dark:text-green-400";
  if (score >= 51) return "text-yellow-500 dark:text-yellow-400";
  if (score >= 31) return "text-orange-500 dark:text-orange-400";
  return "text-red-500 dark:text-red-400";
}

function getScoreLabel(score: number) {
  if (score >= 91) return "Excellent";
  if (score >= 71) return "Great";
  if (score >= 51) return "Good";
  if (score >= 31) return "Fair";
  return "Needs Work";
}

function getBarColor(score: number) {
  if (score >= 71) return "bg-green-500";
  if (score >= 51) return "bg-yellow-500";
  if (score >= 31) return "bg-orange-500";
  return "bg-red-500";
}

export function HealthScoreCard() {
  const { data, isLoading } = useHealthScore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 animate-pulse">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (data.total / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Financial Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Circular score */}
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                className="stroke-muted"
                strokeWidth="6"
              />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={cn(
                  data.total >= 71
                    ? "stroke-green-500"
                    : data.total >= 51
                      ? "stroke-yellow-500"
                      : data.total >= 31
                        ? "stroke-orange-500"
                        : "stroke-red-500"
                )}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn("text-2xl font-bold", getScoreColor(data.total))}
              >
                {data.total}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {getScoreLabel(data.total)}
              </span>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="w-full flex-1 space-y-2.5">
            {data.subScores.map((sub) => (
              <div key={sub.label} className="space-y-0.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium truncate">{sub.label}</span>
                  <span className="text-muted-foreground shrink-0">{sub.detail}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      getBarColor(sub.score)
                    )}
                    style={{ width: `${sub.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
