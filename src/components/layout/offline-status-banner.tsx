"use client";

import { WifiOff, RefreshCcw } from "lucide-react";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";

export function OfflineStatusBanner() {
  const { isOffline } = useOfflineStatus();
  const syncMeta = useOfflineSyncStatus();

  const isSyncing = !isOffline && syncMeta.status === "syncing";
  const hasPending = syncMeta.queuedCount > 0;

  if (!isOffline && !isSyncing && !hasPending) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-3 z-50 md:bottom-4 md:left-4">
      <div className="flex items-center gap-2 rounded-full border bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur text-xs text-muted-foreground">
        {isOffline ? (
          <>
            <WifiOff className="h-3.5 w-3.5 text-amber-500" />
            <span>Offline{hasPending ? ` · ${syncMeta.queuedCount} pending` : ""}</span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCcw className="h-3.5 w-3.5 animate-spin text-primary" />
            <span>Syncing...</span>
          </>
        ) : hasPending ? (
          <>
            <WifiOff className="h-3.5 w-3.5 text-amber-500" />
            <span>{syncMeta.queuedCount} pending</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
