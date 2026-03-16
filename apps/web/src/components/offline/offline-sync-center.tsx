"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, Trash2, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { syncOfflineQueue } from "@/lib/offline/sync";
import {
  clearOfflineConflicts,
  clearOfflineQueue,
  getOfflineSyncEventName,
  listOfflineConflicts,
  listQueuedMutations,
  removeOfflineConflict,
  removeOfflineMutation,
  retryOfflineMutation,
} from "@/lib/offline/store";
import type { OfflineConflictRecord, OfflineMutationRecord } from "@/lib/offline/types";

function formatPayload(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return String(payload ?? "");
  }

  const clone = { ...(payload as Record<string, unknown>) };
  if ("fileBase64" in clone) {
    clone.fileBase64 = "[binary omitted]";
  }
  return JSON.stringify(clone, null, 2);
}

export function OfflineSyncCenter() {
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStatus();
  const [queue, setQueue] = useState<OfflineMutationRecord[]>([]);
  const [conflicts, setConflicts] = useState<OfflineConflictRecord[]>([]);
  const [isSyncingNow, setIsSyncingNow] = useState(false);

  const load = async () => {
    const [nextQueue, nextConflicts] = await Promise.all([
      listQueuedMutations(),
      listOfflineConflicts(),
    ]);

    setQueue(nextQueue);
    setConflicts(nextConflicts);
  };

  useEffect(() => {
    void load();

    const eventName = getOfflineSyncEventName();
    const handler = () => {
      void load();
    };

    window.addEventListener(eventName, handler);
    return () => {
      window.removeEventListener(eventName, handler);
    };
  }, []);

  const queuedByStatus = useMemo(() => {
    return {
      pending: queue.filter((entry) => entry.status === "pending").length,
      syncing: queue.filter((entry) => entry.status === "syncing").length,
      failed: queue.filter((entry) => entry.status === "failed").length,
      conflict: queue.filter((entry) => entry.status === "conflict").length,
    };
  }, [queue]);

  async function handleSyncNow() {
    if (!isOnline || isSyncingNow) {
      return;
    }

    setIsSyncingNow(true);
    try {
      await syncOfflineQueue(queryClient);
    } finally {
      setIsSyncingNow(false);
      await load();
    }
  }

  async function handleRetry(id: string) {
    await retryOfflineMutation(id);
    if (isOnline) {
      await handleSyncNow();
    } else {
      await load();
    }
  }

  async function handleRetryConflict(conflict: OfflineConflictRecord) {
    if (!conflict.mutationId) {
      await removeOfflineConflict(conflict.id);
      await load();
      return;
    }

    await retryOfflineMutation(conflict.mutationId);
    await removeOfflineConflict(conflict.id);
    if (isOnline) {
      await handleSyncNow();
    } else {
      await load();
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            Offline Outbox
          </CardTitle>
          <CardDescription>
            Review queued offline mutations, retry failed items, or clear stale entries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Pending: {queuedByStatus.pending}</Badge>
            <Badge variant="secondary">Syncing: {queuedByStatus.syncing}</Badge>
            <Badge variant="secondary">Failed: {queuedByStatus.failed}</Badge>
            <Badge variant="secondary">Conflict: {queuedByStatus.conflict}</Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleSyncNow} disabled={!isOnline || isSyncingNow}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${isSyncingNow ? "animate-spin" : ""}`} />
              Sync now
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await clearOfflineQueue();
                await load();
              }}
              disabled={queue.length === 0}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear queue
            </Button>
          </div>

          {queue.length === 0 ? (
            <p className="text-sm text-muted-foreground">No queued offline changes.</p>
          ) : (
            <div className="space-y-2">
              {queue.map((entry) => (
                <div key={entry.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{entry.type}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => void handleRetry(entry.id)}>
                        Retry
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await removeOfflineMutation(entry.id);
                          await load();
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>

                  {entry.error ? (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400">{entry.error}</p>
                  ) : null}

                  <pre className="mt-2 overflow-x-auto rounded bg-muted p-2 text-[11px] leading-relaxed">
                    {formatPayload(entry.payload)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Conflict Center
          </CardTitle>
          <CardDescription>
            Review sync conflicts and retry or dismiss items after investigation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Total conflicts: {conflicts.length}</Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await clearOfflineConflicts();
                await load();
              }}
              disabled={conflicts.length === 0}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Clear conflicts
            </Button>
          </div>

          {conflicts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No conflicts detected.</p>
          ) : (
            <div className="space-y-2">
              {conflicts.map((conflict) => (
                <div key={conflict.id} className="rounded-md border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium">{conflict.type}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(conflict.createdAt).toLocaleString("en-PH")}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => void handleRetryConflict(conflict)}>
                        Retry flow
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          await removeOfflineConflict(conflict.id);
                          await load();
                        }}
                      >
                        Dismiss
                      </Button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
                    {conflict.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
