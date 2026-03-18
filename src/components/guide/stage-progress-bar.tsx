"use client";

import { cn } from "@/lib/utils";

interface StageProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function StageProgressBar({ value, className, showLabel }: StageProgressBarProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{Math.round(value)}%</span>
        </div>
      )}
      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            value >= 100 ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
    </div>
  );
}
