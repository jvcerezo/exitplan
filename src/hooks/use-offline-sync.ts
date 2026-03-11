"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { patchOfflineSyncMeta } from "@/lib/offline/store";
import { syncOfflineQueue } from "@/lib/offline/sync";

export function useOfflineSync() {
  const { isOnline } = useOfflineStatus();
  const queryClient = useQueryClient();
  const isSyncingRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      void patchOfflineSyncMeta({ status: "offline" });
      return;
    }

    if (isSyncingRef.current) {
      return;
    }

    isSyncingRef.current = true;
    void syncOfflineQueue(queryClient)
      .catch((error) => {
        void patchOfflineSyncMeta({
          status: "error",
          lastError: error instanceof Error ? error.message : "Offline sync failed",
        });
      })
      .finally(() => {
        isSyncingRef.current = false;
      });
  }, [isOnline, queryClient]);
}
