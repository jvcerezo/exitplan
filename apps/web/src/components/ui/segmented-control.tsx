"use client";

import { cn } from "@/lib/utils";

type SegmentOption<T extends string> = {
  value: T;
  label: string;
};

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonClassName?: string;
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  buttonClassName,
  compact = false,
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-2xl border border-border/60 bg-background/40 p-1 shadow-sm",
        className
      )}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-xl font-semibold transition-all",
              compact ? "px-2 py-2 text-[11px]" : "px-3 py-2 text-xs",
              isActive
                ? "bg-primary/15 text-foreground shadow-sm ring-1 ring-primary/25"
                : "text-muted-foreground hover:text-foreground",
              buttonClassName
            )}
            aria-pressed={isActive}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
