import Dexie, { type Table } from "dexie";
import {
  createDefaultOfflineSyncMeta,
  type OfflineConflictRecord,
  type OfflineMutationRecord,
  type OfflineSyncMeta,
} from "@/lib/offline/types";

class ExitPlanOfflineDatabase extends Dexie {
  queuedMutations!: Table<OfflineMutationRecord, string>;
  conflicts!: Table<OfflineConflictRecord, string>;
  syncMeta!: Table<{ key: string; value: OfflineSyncMeta }, string>;

  constructor() {
    super("exitplan-offline-db");

    this.version(1).stores({
      queuedMutations: "id, status, type, createdAt, updatedAt",
      conflicts: "id, type, createdAt, mutationId",
      syncMeta: "key",
    });
  }
}

export const offlineDb = new ExitPlanOfflineDatabase();

export async function ensureOfflineSyncMeta() {
  const existing = await offlineDb.syncMeta.get("sync");
  if (!existing) {
    await offlineDb.syncMeta.put({
      key: "sync",
      value: createDefaultOfflineSyncMeta(),
    });
  }
}
