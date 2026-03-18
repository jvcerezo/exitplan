"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdultingScore } from "@/hooks/use-adulting-score";
import { cn } from "@/lib/utils";

function getScoreGradient(score: number) {
  if (score >= 80) return "from-green-500 to-emerald-600";
  if (score >= 60) return "from-blue-500 to-indigo-600";
  if (score >= 40) return "from-amber-500 to-orange-600";
  return "from-red-500 to-rose-600";
}

function getBarColor(score: number) {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-blue-500";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

export function AdultingScoreCard() {
  const { total, level, subScores, isLoading } = useAdultingScore();

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="h-40 bg-muted animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  const gradient = getScoreGradient(total);

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className="p-0">
        {/* Score hero section with gradient */}
        <div className={cn("bg-gradient-to-br p-5 sm:p-6 text-white", gradient)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-white/70 uppercase tracking-wider">
                Adulting Score
              </p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-4xl sm:text-5xl font-bold tabular-nums">{total}</span>
                <span className="text-lg font-medium text-white/60">/100</span>
              </div>
              <p className="text-sm font-medium text-white/80 mt-0.5">{level}</p>
            </div>
            <Link
              href="/guide"
              className="flex items-center gap-1 text-xs font-medium text-white/80 hover:text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm px-3 py-2 rounded-xl transition-all"
            >
              Improve
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Sub-scores breakdown */}
        <div className="px-5 py-4 sm:px-6 space-y-2.5">
          {subScores.map((sub) => (
            <div key={sub.label} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">{sub.label}</span>
              <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full rounded-full transition-all", getBarColor(sub.score))}
                  style={{ width: `${sub.score}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground w-10 text-right tabular-nums">
                {sub.detail}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
