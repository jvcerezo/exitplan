"use client";

import { JourneyMap } from "@/components/guide/journey-map";
import { StageProgressBar } from "@/components/guide/stage-progress-bar";
import { useGuideProgress } from "@/hooks/use-guide-progress";

export default function GuidePage() {
  const { overallPercentage, totalCompleted, totalItems, isLoading } = useGuideProgress();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Adulting Journey</h1>
        <p className="text-sm text-muted-foreground sm:text-base mt-0.5">
          Level up through every stage of Filipino adult life.
        </p>
      </div>

      {/* Overall progress */}
      {!isLoading && (
        <div className="rounded-2xl border border-border/60 bg-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Overall Progress</p>
            <p className="text-xs text-muted-foreground">
              {totalCompleted}/{totalItems} completed
            </p>
          </div>
          <StageProgressBar value={overallPercentage} />
        </div>
      )}

      {/* Journey Map */}
      <JourneyMap />
    </div>
  );
}
