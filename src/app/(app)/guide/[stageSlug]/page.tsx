"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2 } from "lucide-react";
import { StageSwitcher } from "@/components/guide/stage-switcher";
import { GuideListItem } from "@/components/guide/guide-list-item";
import { StageProgressBar } from "@/components/guide/stage-progress-bar";
import { getStageBySlug } from "@/lib/guide";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { useChecklistProgress, useToggleChecklistItem } from "@/hooks/use-adulting-checklist";
import { ALL_ITEMS, PRIORITY_META, type ChecklistItem } from "@/lib/adulting-checklist-data";
import { cn } from "@/lib/utils";

export default function StageDetailPage({ params }: { params: Promise<{ stageSlug: string }> }) {
  const { stageSlug } = use(params);
  const stage = getStageBySlug(stageSlug);
  if (!stage) notFound();

  const { stages } = useGuideProgress();
  const stageProgress = stages.find((s) => s.slug === stageSlug);
  const { data: completedIds = [] } = useChecklistProgress();
  const toggleItem = useToggleChecklistItem();
  const completedSet = new Set(completedIds);

  const checklistItems = stage.checklistItemIds
    .map((id) => ALL_ITEMS.find((item) => item.id === id))
    .filter((item): item is ChecklistItem => item != null);

  return (
    <div className="space-y-6">
      <StageSwitcher activeSlug={stageSlug} />

      {/* Header */}
      <div className="space-y-1">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Journey
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight">{stage.title}</h1>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", stage.bg, stage.color)}>
            {stage.ageRange}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{stage.subtitle} — {stage.description}</p>
      </div>

      {/* Progress */}
      {stageProgress && (
        <StageProgressBar value={stageProgress.percentage} showLabel />
      )}

      {/* Guides */}
      {stage.guides.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Guides ({stage.guides.length})
          </p>
          <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
            {stage.guides.map((guide) => (
              <GuideListItem key={guide.slug} guide={guide} stageSlug={stageSlug} />
            ))}
          </div>
        </div>
      )}

      {/* Checklist items for this stage */}
      {checklistItems.length > 0 && (
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2 px-1">
            Checklist ({stageProgress?.completedChecklist ?? 0}/{checklistItems.length})
          </p>
          <div className="space-y-2">
            {checklistItems.map((item) => {
              const completed = completedSet.has(item.id);
              const priority = PRIORITY_META[item.priority];
              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 transition-all",
                    completed ? "border-border/40 bg-muted/20" : "border-border bg-card"
                  )}
                >
                  <button
                    onClick={() => toggleItem.mutate({ itemId: item.id, completed: !completed })}
                    className="mt-0.5 shrink-0 min-h-[44px] min-w-[44px] flex items-center justify-center -m-2"
                  >
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium", completed && "line-through text-muted-foreground")}>
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
        </div>
      )}
    </div>
  );
}
