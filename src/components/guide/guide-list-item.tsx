"use client";

import Link from "next/link";
import { BookOpen, Check, ChevronRight, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { isGuideRead } from "@/hooks/use-guide-progress";
import type { Guide } from "@/lib/guide/types";

interface GuideListItemProps {
  guide: Guide;
  stageSlug: string;
}

export function GuideListItem({ guide, stageSlug }: GuideListItemProps) {
  const read = isGuideRead(guide.slug);

  return (
    <Link
      href={`/guide/${stageSlug}/${guide.slug}`}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-muted/50 transition-colors",
        read && "opacity-70"
      )}
    >
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        read ? "bg-green-500/10" : "bg-primary/10"
      )}>
        {read ? (
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <BookOpen className="h-4 w-4 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", read && "line-through decoration-muted-foreground/40")}>
          {guide.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
          {guide.description}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Clock className="h-3 w-3 text-muted-foreground" />
        <span className="text-[10px] text-muted-foreground">{guide.readTimeMinutes}m</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}
