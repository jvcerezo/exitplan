"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function OfflineObservability() {
  const meta = useOfflineSyncStatus();

  const totalProcessed =
    meta.totalSyncedMutations +
    meta.totalFailedMutations +
    meta.totalConflictMutations;

  const successRate = totalProcessed === 0 ? 100 : (meta.totalSyncedMutations / totalProcessed) * 100;
  const conflictRate = totalProcessed === 0 ? 0 : (meta.totalConflictMutations / totalProcessed) * 100;
  const avgReplayLatency =
    meta.totalSyncRuns === 0 ? 0 : Math.round(meta.totalReplayDurationMs / meta.totalSyncRuns);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Offline Sync Observability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Sync success rate</span>
          <span className="font-medium">{formatPercent(successRate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Conflict rate</span>
          <span className="font-medium">{formatPercent(conflictRate)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Average replay latency</span>
          <span className="font-medium">{formatDuration(avgReplayLatency)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Last replay latency</span>
          <span className="font-medium">
            {meta.lastReplayDurationMs != null ? formatDuration(meta.lastReplayDurationMs) : "N/A"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total sync runs</span>
          <span className="font-medium">{meta.totalSyncRuns}</span>
        </div>
      </CardContent>
    </Card>
  );
}
