"use client";

import { useEffect, useRef, useState } from "react";
import {
  getOfflineSyncEventName,
  getOfflineSyncMeta,
} from "@/lib/offline/store";
import {
  createDefaultOfflineSyncMeta,
  type OfflineSyncMeta,
} from "@/lib/offline/types";

/**
 * Tracks offline sync state.
 *
 * - Always listens for sync events (zero-cost when nothing fires).
 * - Only starts an interval poll when the user is actually offline
 *   OR there are queued/failed changes that need monitoring.
 * - Stops polling once the user is back online and the queue is empty.
 */
export function useOfflineSyncStatus() {
  const [meta, setMeta] = useState<OfflineSyncMeta>(createDefaultOfflineSyncMeta());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const nextMeta = await getOfflineSyncMeta();
      if (mounted) {
        setMeta(nextMeta);
        managePolling(nextMeta);
      }
    };

    // Start or stop polling based on whether there's something to track
    function managePolling(current: OfflineSyncMeta) {
      const needsPolling =
        !navigator.onLine ||
        current.queuedCount > 0 ||
        current.failedCount > 0 ||
        current.status === "syncing";

      if (needsPolling && !intervalRef.current) {
        intervalRef.current = setInterval(() => void load(), 5000);
      } else if (!needsPolling && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Initial load
    void load();

    // Listen for sync events (fires only when offline queue processes)
    const eventName = getOfflineSyncEventName();
    const handler = () => void load();
    window.addEventListener(eventName, handler);

    // Listen for online/offline transitions to start/stop polling
    const onOnline = () => void load();
    const onOffline = () => void load();
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      mounted = false;
      window.removeEventListener(eventName, handler);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return meta;
}
