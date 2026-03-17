"use client";

import Link from "next/link";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { LIFE_STAGES } from "@/lib/guide";
import { cn } from "@/lib/utils";

interface StageSwitcherProps {
  activeSlug: string;
}

export function StageSwitcher({ activeSlug }: StageSwitcherProps) {
  const { stages } = useGuideProgress();

  return (
    <div className="sticky top-[calc(env(safe-area-inset-top)+3.5rem)] md:top-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border/40">
      <div className="flex gap-1.5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-0.5">
        {LIFE_STAGES.map((stage) => {
          const isActive = stage.slug === activeSlug;
          const progress = stages.find((s) => s.slug === stage.slug);
          const hasProgress = (progress?.percentage ?? 0) > 0;

          return (
            <Link
              key={stage.slug}
              href={`/guide/${stage.slug}`}
              className={cn(
                "flex items-center gap-1.5 shrink-0 snap-start rounded-full px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              {stage.title}
              {hasProgress && !isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
