"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdultingScore } from "@/hooks/use-adulting-score";
import { cn } from "@/lib/utils";

function getScoreColor(score: number) {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-blue-600 dark:text-blue-400";
  if (score >= 40) return "text-yellow-500 dark:text-yellow-400";
  return "text-red-500 dark:text-red-400";
}

function getStrokeColor(score: number) {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-blue-500";
  if (score >= 40) return "stroke-yellow-500";
  return "stroke-red-500";
}

function getBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-yellow-500";
  return "bg-red-500";
}

export function AdultingScoreCard() {
  const { total, level, subScores, isLoading } = useAdultingScore();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6 animate-pulse">
            <div className="h-24 w-24 rounded-full bg-muted" />
            <div className="flex-1 space-y-2 w-full">
              <div className="h-3 w-full bg-muted rounded" />
              <div className="h-3 w-3/4 bg-muted rounded" />
              <div className="h-3 w-1/2 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference - (total / 100) * circumference;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Adulting Score</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Circular score */}
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="42" fill="none" className="stroke-muted" strokeWidth="6" />
              <circle
                cx="48"
                cy="48"
                r="42"
                fill="none"
                strokeWidth="6"
                strokeLinecap="round"
                className={getStrokeColor(total)}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("text-2xl font-bold", getScoreColor(total))}>{total}</span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Sub-scores */}
          <div className="w-full flex-1 space-y-2">
            <p className={cn("text-sm font-semibold mb-3", getScoreColor(total))}>{level}</p>
            {subScores.map((sub) => (
              <div key={sub.label} className="space-y-0.5">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-medium truncate">{sub.label}</span>
                  <span className="text-muted-foreground shrink-0">{sub.detail}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", getBarColor(sub.score))}
                    style={{ width: `${sub.score}%` }}
                  />
                </div>
              </div>
            ))}
            <Link
              href="/guide"
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline mt-2"
            >
              See what&apos;s next
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
