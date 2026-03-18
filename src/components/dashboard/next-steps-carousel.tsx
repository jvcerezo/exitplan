"use client";

import Link from "next/link";
import { BookOpen, CheckCircle2, AlertCircle, ArrowRight, X } from "lucide-react";
import { useNextSteps } from "@/hooks/use-next-steps";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  AlertCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
};

export function NextStepsCarousel() {
  const allCards = useNextSteps(5);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const cards = allCards.filter((c) => !dismissed.has(c.id));

  if (cards.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
        Next Steps
      </p>
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {cards.map((card) => {
          const Icon = ICON_MAP[card.icon] ?? CheckCircle2;
          return (
            <div
              key={card.id}
              className="relative shrink-0 w-[280px] snap-start rounded-2xl border border-border/60 bg-card p-4 space-y-2"
            >
              <button
                type="button"
                onClick={() => setDismissed((prev) => new Set(prev).add(card.id))}
                className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                  card.type === "checklist" ? "bg-amber-500/10" : "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "h-3.5 w-3.5",
                    card.type === "checklist" ? "text-amber-600 dark:text-amber-400" : "text-primary"
                  )} />
                </div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {card.type === "checklist" ? "Next Step" : card.type === "guide-suggestion" ? "Read" : "Reminder"}
                </p>
              </div>
              <p className="text-sm font-medium line-clamp-2 pr-4">{card.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{card.description}</p>
              <Link
                href={card.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                {card.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
