"use client";

import { useMemo } from "react";
import { useChecklistProgress } from "./use-adulting-checklist";
import { LIFE_STAGES } from "@/lib/guide";

const GUIDE_READ_PREFIX = "guide-read-";

function getReadGuides(): Set<string> {
  if (typeof window === "undefined") return new Set();
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(GUIDE_READ_PREFIX));
  return new Set(keys.map((k) => k.slice(GUIDE_READ_PREFIX.length)));
}

export function markGuideRead(slug: string) {
  localStorage.setItem(`${GUIDE_READ_PREFIX}${slug}`, "1");
}

export function markGuideUnread(slug: string) {
  localStorage.removeItem(`${GUIDE_READ_PREFIX}${slug}`);
}

export function isGuideRead(slug: string): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`${GUIDE_READ_PREFIX}${slug}`) === "1";
}

export interface StageProgress {
  slug: string;
  title: string;
  completedChecklist: number;
  totalChecklist: number;
  readGuides: number;
  totalGuides: number;
  completedTotal: number;
  totalItems: number;
  percentage: number;
}

export function useGuideProgress() {
  const { data: completedIds = [], isLoading } = useChecklistProgress();

  const progress = useMemo(() => {
    const readGuides = getReadGuides();
    const completedSet = new Set(completedIds);

    const stages: StageProgress[] = LIFE_STAGES.map((stage) => {
      const completedChecklist = stage.checklistItemIds.filter((id) => completedSet.has(id)).length;
      const totalChecklist = stage.checklistItemIds.length;
      const stageReadGuides = stage.guides.filter((g) => readGuides.has(g.slug)).length;
      const totalGuides = stage.guides.length;
      const completedTotal = completedChecklist + stageReadGuides;
      const totalItems = totalChecklist + totalGuides;
      const percentage = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

      return {
        slug: stage.slug,
        title: stage.title,
        completedChecklist,
        totalChecklist,
        readGuides: stageReadGuides,
        totalGuides,
        completedTotal,
        totalItems,
        percentage,
      };
    });

    const totalCompleted = stages.reduce((sum, s) => sum + s.completedTotal, 0);
    const totalItems = stages.reduce((sum, s) => sum + s.totalItems, 0);
    const overallPercentage = totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0;

    // Determine current stage: first stage with less than 100% completion
    const currentStageIndex = stages.findIndex((s) => s.percentage < 100);
    const currentStage = currentStageIndex >= 0 ? LIFE_STAGES[currentStageIndex] : LIFE_STAGES[LIFE_STAGES.length - 1];

    return {
      stages,
      overallPercentage,
      totalCompleted,
      totalItems,
      currentStage,
      currentStageIndex: currentStageIndex >= 0 ? currentStageIndex : LIFE_STAGES.length - 1,
    };
  }, [completedIds]);

  return { ...progress, isLoading };
}
