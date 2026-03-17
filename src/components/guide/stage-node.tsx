"use client";

import Link from "next/link";
import {
  GraduationCap,
  Blocks,
  Home,
  TrendingUp,
  Shield,
  Sun,
  Check,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LifeStage } from "@/lib/guide/types";

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  Blocks,
  Home,
  TrendingUp,
  Shield,
  Sun,
};

interface StageNodeProps {
  stage: LifeStage;
  index: number;
  isCurrent: boolean;
  percentage: number;
}

export function StageNode({ stage, index, isCurrent, percentage }: StageNodeProps) {
  const Icon = ICON_MAP[stage.icon] ?? GraduationCap;
  const isComplete = percentage >= 100;

  return (
    <Link
      href={`/guide/${stage.slug}`}
      className={cn(
        "group flex items-center gap-4 rounded-2xl px-3 py-3.5 transition-all",
        isCurrent
          ? "bg-primary/5 border border-primary/20"
          : "hover:bg-muted/50"
      )}
    >
      {/* Icon with progress indicator */}
      <div className="relative shrink-0">
        <div
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl transition-all",
            isComplete
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : isCurrent
                ? "bg-primary/15 text-primary"
                : "bg-muted/80 text-muted-foreground group-hover:bg-muted"
          )}
        >
          {isComplete ? (
            <Check className="h-6 w-6" />
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
        {/* Progress ring overlay */}
        {percentage > 0 && !isComplete && (
          <svg className="absolute inset-0 -rotate-90 h-14 w-14" viewBox="0 0 56 56">
            <circle
              cx="28"
              cy="28"
              r="26"
              fill="none"
              strokeWidth="2"
              className="stroke-primary/30"
              strokeDasharray={`${(percentage / 100) * 163.4} 163.4`}
              strokeLinecap="round"
            />
          </svg>
        )}
        {/* Current indicator dot */}
        {isCurrent && (
          <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className={cn(
            "text-sm font-semibold",
            isCurrent ? "text-foreground" : "text-foreground/80"
          )}>
            {stage.title}
          </p>
          <span className={cn(
            "text-[10px] font-medium px-1.5 py-0.5 rounded-md",
            stage.bg, stage.color
          )}>
            {stage.ageRange}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
        <div className="flex items-center gap-2 mt-1.5">
          {/* Inline progress bar */}
          <div className="h-1 flex-1 max-w-[120px] overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                isComplete ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className={cn(
            "text-[10px] font-medium",
            isComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}>
            {isComplete ? "Done" : `${percentage}%`}
          </span>
        </div>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 transition-colors" />
    </Link>
  );
}
