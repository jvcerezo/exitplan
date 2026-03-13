export type OfflineMutationType =
  | "addAccount"
  | "addTransaction"
  | "addGoal"
  | "addBudget"
  | "uploadAttachment"
  | "importTransactions"
  | "runReceiptOcr";

export type OfflineMutationStatus = "pending" | "syncing" | "failed" | "conflict";

export interface AddAccountOfflinePayload {
  localId: string;
  name: string;
  type: "cash" | "bank" | "e-wallet" | "credit-card";
  currency: string;
  balance: number;
}

export interface AddTransactionOfflinePayload {
  localId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
  account_id?: string | null;
  transfer_id?: string | null;
  split_group_id?: string | null;
  tags?: string[] | null;
  attachment_path?: string | null;
}

export interface AddGoalOfflinePayload {
  localId: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
}

export interface AddBudgetOfflinePayload {
  localId: string;
  category: string;
  amount: number;
  month: string;
  period?: string;
  rollover?: boolean;
}

export interface UploadAttachmentOfflinePayload {
  transactionId: string;
  pathHint?: string;
}

export interface ImportTransactionsOfflinePayload {
  count: number;
}

export interface ReceiptOcrOfflinePayload {
  fileName: string;
}

export type OfflineMutationPayload =
  | AddAccountOfflinePayload
  | AddTransactionOfflinePayload
  | AddGoalOfflinePayload
  | AddBudgetOfflinePayload
  | UploadAttachmentOfflinePayload
  | ImportTransactionsOfflinePayload
  | ReceiptOcrOfflinePayload;

export interface OfflineMutationRecord {
  id: string;
  type: OfflineMutationType;
  payload: OfflineMutationPayload;
  status: OfflineMutationStatus;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

export interface OfflineConflictRecord {
  id: string;
  type: OfflineMutationType;
  message: string;
  createdAt: string;
  mutationId?: string;
}

export interface OfflineSyncMeta {
  status: "idle" | "offline" | "syncing" | "synced" | "error";
  queuedCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

export function createDefaultOfflineSyncMeta(): OfflineSyncMeta {
  return {
    status: "idle",
    queuedCount: 0,
    failedCount: 0,
    lastSyncedAt: null,
    lastError: null,
  };
}
