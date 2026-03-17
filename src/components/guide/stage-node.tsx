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
  const isEven = index % 2 === 0;

  // SVG progress ring
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <Link
      href={`/guide/${stage.slug}`}
      className={cn(
        "group relative flex items-center gap-4 py-2",
        // Alternate left/right on mobile
        isEven ? "flex-row" : "flex-row-reverse",
        // Desktop: always left-aligned
        "md:flex-row"
      )}
    >
      {/* Node circle with progress ring */}
      <div className={cn("relative shrink-0", isCurrent ? "h-[72px] w-[72px]" : "h-16 w-16")}>
        <svg
          className={cn("absolute inset-0 -rotate-90", isCurrent ? "h-[72px] w-[72px]" : "h-16 w-16")}
          viewBox="0 0 64 64"
        >
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            className="stroke-muted"
            strokeWidth="3"
          />
          {percentage > 0 && (
            <circle
              cx="32"
              cy="32"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              className={isComplete ? "stroke-green-500" : "stroke-primary"}
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
          )}
        </svg>
        <div
          className={cn(
            "absolute inset-[6px] flex items-center justify-center rounded-full transition-all",
            isComplete
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : isCurrent
                ? "bg-primary/15 text-primary ring-2 ring-primary/40 animate-pulse"
                : "bg-muted/60 text-muted-foreground group-hover:bg-muted",
          )}
        >
          {isComplete ? (
            <Check className="h-6 w-6" />
          ) : (
            <Icon className={cn("h-6 w-6", isCurrent && "h-7 w-7")} />
          )}
        </div>
      </div>

      {/* Label */}
      <div className={cn("min-w-0", isEven ? "text-left" : "text-right", "md:text-left")}>
        <div className="flex items-center gap-2">
          <p className={cn("text-sm font-bold", isCurrent ? "text-foreground" : "text-foreground/70")}>
            {stage.title}
          </p>
          <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full", stage.bg, stage.color)}>
            {stage.ageRange}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{stage.subtitle}</p>
        <p className={cn("text-[11px] mt-1 font-medium", isComplete ? "text-green-600 dark:text-green-400" : "text-muted-foreground")}>
          {isComplete ? "Complete!" : `${percentage}% done`}
        </p>
      </div>
    </Link>
  );
}
