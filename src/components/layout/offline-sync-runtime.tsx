"use client";

import { useOfflineSync } from "@/hooks/use-offline-sync";

export function OfflineSyncRuntime() {
  useOfflineSync();
  return null;
}
