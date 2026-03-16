"use client";

import { CloudOff, RefreshCcw, WifiOff } from "lucide-react";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { useOfflineSyncStatus } from "@/hooks/use-offline-sync-status";

export function OfflineStatusBanner() {
  const { isOffline } = useOfflineStatus();
  const syncMeta = useOfflineSyncStatus();

  if (!isOffline && syncMeta.queuedCount === 0 && syncMeta.status !== "syncing") {
    return null;
  }

  const message = isOffline
    ? `Offline mode · ${syncMeta.queuedCount} change${syncMeta.queuedCount === 1 ? "" : "s"} pending sync`
    : syncMeta.status === "syncing"
      ? `Syncing ${syncMeta.queuedCount} offline change${syncMeta.queuedCount === 1 ? "" : "s"}`
      : syncMeta.failedCount > 0
        ? `${syncMeta.failedCount} offline change${syncMeta.failedCount === 1 ? " needs" : "s need"} review`
        : "Offline changes synced";

  const Icon = isOffline
    ? WifiOff
    : syncMeta.status === "syncing"
      ? RefreshCcw
      : syncMeta.failedCount > 0
        ? CloudOff
        : RefreshCcw;

  return (
    <div className="sticky top-0 z-[60] border-b border-amber-200 bg-amber-50 px-4 py-2 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/70 dark:text-amber-100">
      <div className="mx-auto flex max-w-6xl items-center gap-2 text-sm">
        <Icon className={`h-4 w-4 shrink-0 ${syncMeta.status === "syncing" && !isOffline ? "animate-spin" : ""}`} />
        <p>
          {message}
        </p>
      </div>
    </div>
  );
}
