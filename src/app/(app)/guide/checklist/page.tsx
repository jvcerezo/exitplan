"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { useChecklistProgress, useToggleChecklistItem } from "@/hooks/use-adulting-checklist";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { ALL_ITEMS, PRIORITY_META, type ChecklistItem } from "@/lib/adulting-checklist-data";
import { LIFE_STAGES } from "@/lib/guide";
import { StageProgressBar } from "@/components/guide/stage-progress-bar";
import { cn } from "@/lib/utils";

export default function GuideChecklistPage() {
  const { data: completedIds = [] } = useChecklistProgress();
  const toggleItem = useToggleChecklistItem();
  const { stages, overallPercentage, totalCompleted, totalItems } = useGuideProgress();
  const completedSet = new Set(completedIds);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Journey
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Adulting Checklist</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {totalCompleted}/{totalItems} steps completed
        </p>
      </div>

      {/* Overall progress */}
      <StageProgressBar value={overallPercentage} showLabel />

      {/* Stages */}
      <div className="space-y-6">
        {LIFE_STAGES.map((stage) => {
          const items = stage.checklistItemIds
            .map((id) => ALL_ITEMS.find((item) => item.id === id))
            .filter((item): item is ChecklistItem => item != null);

          if (items.length === 0) return null;

          const stageProgress = stages.find((s) => s.slug === stage.slug);

          return (
            <StageChecklistSection
              key={stage.slug}
              title={stage.title}
              subtitle={`${stage.subtitle} (${stage.ageRange})`}
              color={stage.color}
              bg={stage.bg}
              borderColor={stage.borderColor}
              items={items}
              completedSet={completedSet}
              percentage={stageProgress?.percentage ?? 0}
              onToggle={(itemId, completed) => toggleItem.mutate({ itemId, completed })}
            />
          );
        })}
      </div>
    </div>
  );
}

function StageChecklistSection({
  title,
  subtitle,
  color,
  bg,
  borderColor,
  items,
  completedSet,
  percentage,
  onToggle,
}: {
  title: string;
  subtitle: string;
  color: string;
  bg: string;
  borderColor: string;
  items: ChecklistItem[];
  completedSet: Set<string>;
  percentage: number;
  onToggle: (itemId: string, completed: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const completed = items.filter((i) => completedSet.has(i.id)).length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center gap-3 w-full text-left mb-2"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-bold", color)}>{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle} — {completed}/{items.length} done</p>
        </div>
        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", bg, color)}>
          {Math.round(percentage)}%
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 ml-7">
          {items.map((item) => {
            const done = completedSet.has(item.id);
            const priority = PRIORITY_META[item.priority];
            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border p-3 transition-all",
                  done ? "border-border/40 bg-muted/20" : `border-border bg-card`
                )}
              >
                <button
                  onClick={() => onToggle(item.id, !done)}
                  className="mt-0.5 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={cn("text-sm font-medium", done && "line-through text-muted-foreground")}>
                      {item.title}
                    </p>
                    <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", priority.bg, priority.color)}>
                      {priority.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
