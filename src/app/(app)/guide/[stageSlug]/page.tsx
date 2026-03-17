"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight } from "lucide-react";
import { StageCoverBanner } from "@/components/guide/stage-cover-banner";
import { GuideListItem } from "@/components/guide/guide-list-item";
import { StageProgressBar } from "@/components/guide/stage-progress-bar";
import { getStageBySlug } from "@/lib/guide";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { useChecklistProgress } from "@/hooks/use-adulting-checklist";
import { ALL_ITEMS, PRIORITY_META, type ChecklistItem } from "@/lib/adulting-checklist-data";
import { cn } from "@/lib/utils";

export default function StageDetailPage({ params }: { params: Promise<{ stageSlug: string }> }) {
  const { stageSlug } = use(params);
  const stage = getStageBySlug(stageSlug);
  if (!stage) notFound();

  const { stages } = useGuideProgress();
  const stageProgress = stages.find((s) => s.slug === stageSlug);
  const { data: completedIds = [] } = useChecklistProgress();
  const completedSet = new Set(completedIds);

  const checklistItems = stage.checklistItemIds
    .map((id) => ALL_ITEMS.find((item) => item.id === id))
    .filter((item): item is ChecklistItem => item != null);

  return (
    <div className="space-y-6">
      {/* Cover Banner */}
      <div className="space-y-3">
        <Link
          href="/guide"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Journey
        </Link>
        <StageCoverBanner stage={stage} />
        <p className="text-sm text-muted-foreground">{stage.description}</p>
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
                <Link
                  key={item.id}
                  href={`/guide/checklist/${item.id}`}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-3.5 transition-all group hover:border-primary/30",
                    completed ? "border-border/40 bg-muted/20" : "border-border bg-card"
                  )}
                >
                  <div className="mt-0.5 shrink-0">
                    {completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-primary/50 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={cn("text-sm font-medium group-hover:text-primary transition-colors", completed && "line-through text-muted-foreground")}>
                        {item.title}
                      </p>
                      <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", priority.bg, priority.color)}>
                        {priority.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                    <span className="text-[10px] text-primary font-medium mt-1.5 inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      View step-by-step guide
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
