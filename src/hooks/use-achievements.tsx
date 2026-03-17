"use client";

import { useEffect, useRef } from "react";
import { useChecklistProgress } from "./use-adulting-checklist";
import { checkNewAchievements, type Achievement } from "@/lib/guide/achievements";
import { toast } from "sonner";

export function useAchievements() {
  const { data: completedIds = [] } = useChecklistProgress();
  const prevIdsRef = useRef<string[]>([]);

  useEffect(() => {
    // Skip on initial load (no previous state to compare against)
    if (prevIdsRef.current.length === 0 && completedIds.length > 0) {
      prevIdsRef.current = completedIds;
      // Still check for any unclaimed achievements on initial load
      checkNewAchievements(completedIds);
      return;
    }

    // Only check if the list actually changed
    if (completedIds.length !== prevIdsRef.current.length) {
      const newlyUnlocked = checkNewAchievements(completedIds);

      for (const achievement of newlyUnlocked) {
        showAchievementToast(achievement);
      }

      prevIdsRef.current = completedIds;
    }
  }, [completedIds]);
}

function showAchievementToast(achievement: Achievement) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-card px-4 py-3 shadow-lg animate-in slide-in-from-bottom-2 fade-in duration-300">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <span className="text-lg">🏆</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
            Achievement Unlocked!
          </p>
          <p className="text-sm font-semibold">{achievement.title}</p>
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
        </div>
      </div>
    ),
    {
      duration: 5000,
      position: "bottom-center",
    }
  );
}
