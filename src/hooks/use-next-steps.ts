"use client";

import { useMemo } from "react";
import { useChecklistProgress } from "./use-adulting-checklist";
import { useGuideProgress, isGuideRead } from "./use-guide-progress";
import { LIFE_STAGES } from "@/lib/guide";
import { ALL_ITEMS, PRIORITY_META, type ChecklistItem } from "@/lib/adulting-checklist-data";
import type { NextStepCard } from "@/lib/guide/types";

const PRIORITY_ORDER: Record<string, number> = { critical: 0, important: 1, "good-to-have": 2 };

export function useNextSteps(maxCards = 5) {
  const { data: completedIds = [] } = useChecklistProgress();
  const { currentStage, currentStageIndex } = useGuideProgress();

  const cards = useMemo(() => {
    const completedSet = new Set(completedIds);
    const result: NextStepCard[] = [];

    // 1. Next priority checklist items from current stage
    if (currentStage) {
      const stageItems = currentStage.checklistItemIds
        .map((id) => ALL_ITEMS.find((item) => item.id === id))
        .filter((item): item is ChecklistItem => item != null && !completedSet.has(item.id))
        .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2));

      for (const item of stageItems.slice(0, 2)) {
        const meta = PRIORITY_META[item.priority];
        result.push({
          id: `checklist-${item.id}`,
          type: "checklist",
          title: item.title,
          description: item.description.slice(0, 100) + (item.description.length > 100 ? "..." : ""),
          href: `/guide/checklist/${item.id}`,
          actionLabel: "View Guide",
          icon: meta.label === "Must Do" ? "AlertCircle" : "CheckCircle2",
          priority: PRIORITY_ORDER[item.priority] ?? 2,
        });
      }
    }

    // 2. Next unread guide in current stage
    if (currentStage) {
      const unreadGuide = currentStage.guides.find((g) => !isGuideRead(g.slug));
      if (unreadGuide) {
        result.push({
          id: `guide-${unreadGuide.slug}`,
          type: "guide-suggestion",
          title: unreadGuide.title,
          description: unreadGuide.description.slice(0, 100) + (unreadGuide.description.length > 100 ? "..." : ""),
          href: `/guide/${currentStage.slug}/${unreadGuide.slug}`,
          actionLabel: `${unreadGuide.readTimeMinutes} min read`,
          icon: "BookOpen",
          priority: 1,
        });
      }
    }

    // 3. If current stage is fully complete, suggest moving to next stage
    if (currentStageIndex < LIFE_STAGES.length - 1) {
      const nextStage = LIFE_STAGES[currentStageIndex + 1];
      const nextStageHasItems = nextStage.checklistItemIds.length > 0 || nextStage.guides.length > 0;
      const currentDone = currentStage.checklistItemIds.every((id) => completedSet.has(id));

      if (currentDone && nextStageHasItems) {
        result.push({
          id: `next-stage-${nextStage.slug}`,
          type: "guide-suggestion",
          title: `Ready for: ${nextStage.title}`,
          description: nextStage.description.slice(0, 100) + "...",
          href: `/guide/${nextStage.slug}`,
          actionLabel: "Explore Stage",
          icon: "ArrowRight",
          priority: 3,
        });
      }
    }

    // Sort by priority and limit
    return result
      .sort((a, b) => a.priority - b.priority)
      .slice(0, maxCards);
  }, [completedIds, currentStage, currentStageIndex, maxCards]);

  return cards;
}
