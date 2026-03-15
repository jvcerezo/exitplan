export type OfflineMutationType =
  | "addAccount"
  | "updateAccount"
  | "deleteAccount"
  | "addTransaction"
  | "updateTransaction"
  | "deleteTransaction"
  | "importTransactions"
  | "addGoal"
  | "updateGoal"
  | "deleteGoal"
  | "addFundsToGoal"
  | "addBudget"
  | "updateBudget"
  | "deleteBudget"
  | "createTransfer"
  | "uploadAttachment"
  | "runReceiptOcr";

export type OfflineMutationStatus = "pending" | "syncing" | "failed" | "conflict";

export interface AddAccountOfflinePayload {
  localId: string;
  name: string;
  type: string;
  currency: string;
  balance: number;
}

export interface UpdateAccountOfflinePayload {
  id: string;
  name?: string;
  type?: string;
  currency?: string;
  is_archived?: boolean;
}

export interface DeleteAccountOfflinePayload {
  id: string;
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

export interface UpdateTransactionOfflinePayload {
  id: string;
  amount?: number;
  category?: string;
  description?: string;
  date?: string;
  currency?: string;
  account_id?: string | null;
  tags?: string[] | null;
  attachment_path?: string | null;
}

export interface DeleteTransactionOfflinePayload {
  id: string;
}

export interface AddGoalOfflinePayload {
  localId: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
}

export interface UpdateGoalOfflinePayload {
  id: string;
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
  category?: string;
  is_completed?: boolean;
}

export interface DeleteGoalOfflinePayload {
  id: string;
}

export interface AddFundsToGoalOfflinePayload {
  goalId: string;
  accountId: string;
  amount: number;
  note?: string | null;
  fundingDate: string;
}

export interface AddBudgetOfflinePayload {
  localId: string;
  category: string;
  amount: number;
  month: string;
  period?: string;
  rollover?: boolean;
}

export interface UpdateBudgetOfflinePayload {
  id: string;
  category?: string;
  amount?: number;
  month?: string;
  period?: string;
  rollover?: boolean;
}

export interface DeleteBudgetOfflinePayload {
  id: string;
}

export interface CreateTransferOfflinePayload {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description?: string;
}

export interface UploadAttachmentOfflinePayload {
  transactionId: string;
  fileName?: string;
  contentType?: string;
  fileBase64?: string;
  pathHint?: string;
}

export interface ImportTransactionsOfflinePayload {
  transactions: Array<{
    amount: number;
    category: string;
    description: string;
    date: string;
    currency: string;
    account_id?: string | null;
    transfer_id?: string | null;
    tags?: string[] | null;
    attachment_path?: string | null;
    split_group_id?: string | null;
  }>;
}

export interface ReceiptOcrOfflinePayload {
  fileName: string;
  contentType?: string;
  fileBase64?: string;
}

export type OfflineMutationPayload =
  | AddAccountOfflinePayload
  | UpdateAccountOfflinePayload
  | DeleteAccountOfflinePayload
  | AddTransactionOfflinePayload
  | UpdateTransactionOfflinePayload
  | DeleteTransactionOfflinePayload
  | ImportTransactionsOfflinePayload
  | AddGoalOfflinePayload
  | UpdateGoalOfflinePayload
  | DeleteGoalOfflinePayload
  | AddFundsToGoalOfflinePayload
  | AddBudgetOfflinePayload
  | UpdateBudgetOfflinePayload
  | DeleteBudgetOfflinePayload
  | CreateTransferOfflinePayload
  | UploadAttachmentOfflinePayload
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
  totalSyncRuns: number;
  totalSyncedMutations: number;
  totalFailedMutations: number;
  totalConflictMutations: number;
  totalReplayDurationMs: number;
  lastReplayDurationMs: number | null;
  lastRunAt: string | null;
}

export function createDefaultOfflineSyncMeta(): OfflineSyncMeta {
  return {
    status: "idle",
    queuedCount: 0,
    failedCount: 0,
    lastSyncedAt: null,
    lastError: null,
    totalSyncRuns: 0,
    totalSyncedMutations: 0,
    totalFailedMutations: 0,
    totalConflictMutations: 0,
    totalReplayDurationMs: 0,
    lastReplayDurationMs: null,
    lastRunAt: null,
  };
}
