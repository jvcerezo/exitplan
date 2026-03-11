"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";

export function OfflineSyncHealth() {
  const syncMeta = useOfflineSyncStatus();

  const rows = [
    { label: "Status", value: syncMeta.status },
    { label: "Queued changes", value: String(syncMeta.queuedCount) },
    { label: "Needs review", value: String(syncMeta.failedCount) },
    {
      label: "Last synced",
      value: syncMeta.lastSyncedAt
        ? new Date(syncMeta.lastSyncedAt).toLocaleString("en-PH")
        : "Never",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Offline Sync Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4">
            <span className="text-muted-foreground">{row.label}</span>
            <span className="font-medium text-right">{row.value}</span>
          </div>
        ))}
        {syncMeta.lastError ? (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {syncMeta.lastError}
          </p>
        ) : null}
        <p className="text-xs text-muted-foreground">
          Device-level metrics for this browser. Global offline analytics can be added later.
        </p>
      </CardContent>
    </Card>
  );
}
