import { offlineDb, ensureOfflineSyncMeta } from "@/lib/offline/db";
import {
  createDefaultOfflineSyncMeta,
  type OfflineConflictRecord,
  type OfflineMutationPayload,
  type OfflineMutationRecord,
  type OfflineMutationStatus,
  type OfflineMutationType,
  type OfflineSyncMeta,
} from "@/lib/offline/types";

const OFFLINE_SYNC_EVENT = "exitplan-offline-sync-updated";

function emitOfflineSyncUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(OFFLINE_SYNC_EVENT));
  }
}

export function getOfflineSyncEventName() {
  return OFFLINE_SYNC_EVENT;
}

export async function enqueueOfflineMutation({
  id,
  type,
  payload,
}: {
  id: string;
  type: OfflineMutationType;
  payload: OfflineMutationPayload;
}) {
  const timestamp = new Date().toISOString();
  const record: OfflineMutationRecord = {
    id,
    type,
    payload,
    status: "pending",
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  await offlineDb.queuedMutations.put(record);
  await refreshOfflineSyncMeta();
  emitOfflineSyncUpdate();
  return record;
}

export async function listQueuedMutations() {
  return offlineDb.queuedMutations.orderBy("createdAt").toArray();
}

export async function updateOfflineMutationStatus(
  id: string,
  status: OfflineMutationStatus,
  error?: string
) {
  await offlineDb.queuedMutations.update(id, {
    status,
    error,
    updatedAt: new Date().toISOString(),
  });
  await refreshOfflineSyncMeta();
  emitOfflineSyncUpdate();
}

export async function removeOfflineMutation(id: string) {
  await offlineDb.queuedMutations.delete(id);
  await refreshOfflineSyncMeta();
  emitOfflineSyncUpdate();
}

export async function addOfflineConflict(conflict: OfflineConflictRecord) {
  await offlineDb.conflicts.put(conflict);
  emitOfflineSyncUpdate();
}

export async function getOfflineSyncMeta(): Promise<OfflineSyncMeta> {
  await ensureOfflineSyncMeta();
  const record = await offlineDb.syncMeta.get("sync");
  return record?.value ?? createDefaultOfflineSyncMeta();
}

export async function setOfflineSyncMeta(meta: OfflineSyncMeta) {
  await offlineDb.syncMeta.put({ key: "sync", value: meta });
  emitOfflineSyncUpdate();
}

export async function patchOfflineSyncMeta(patch: Partial<OfflineSyncMeta>) {
  const current = await getOfflineSyncMeta();
  await setOfflineSyncMeta({ ...current, ...patch });
}

export async function refreshOfflineSyncMeta() {
  await ensureOfflineSyncMeta();
  const queuedCount = await offlineDb.queuedMutations.count();
  const failedCount = await offlineDb.queuedMutations
    .where("status")
    .equals("failed")
    .count();
  const current = await getOfflineSyncMeta();

  await setOfflineSyncMeta({
    ...current,
    queuedCount,
    failedCount,
    status:
      queuedCount === 0 && current.status !== "error"
        ? current.status === "offline"
          ? "offline"
          : current.lastSyncedAt
            ? "synced"
            : "idle"
        : current.status,
  });
}
