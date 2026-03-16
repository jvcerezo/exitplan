import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { offlineDb } from "@/lib/offline/db";
import {
  addOfflineConflict,
  getOfflineSyncMeta,
  listQueuedMutations,
  patchOfflineSyncMeta,
  removeOfflineMutation,
  updateOfflineMutationStatus,
} from "@/lib/offline/store";
import { isOfflineId } from "@/lib/offline/utils";
import type {
  AddFundsToGoalOfflinePayload,
  AddAccountOfflinePayload,
  AddBudgetOfflinePayload,
  AddGoalOfflinePayload,
  AddTransactionOfflinePayload,
  CreateTransferOfflinePayload,
  DeleteAccountOfflinePayload,
  DeleteBudgetOfflinePayload,
  DeleteGoalOfflinePayload,
  DeleteTransactionOfflinePayload,
  ImportTransactionsOfflinePayload,
  OfflineMutationRecord,
  ReceiptOcrOfflinePayload,
  UpdateBudgetOfflinePayload,
  UpdateAccountOfflinePayload,
  UpdateGoalOfflinePayload,
  UpdateTransactionOfflinePayload,
  UploadAttachmentOfflinePayload,
} from "@/lib/offline/types";

function resolveSyncedId(
  id: string,
  resolvedIds: Map<string, string>,
  entity: "account" | "goal" | "transaction" | "budget"
) {
  if (!isOfflineId(id)) {
    return id;
  }

  const resolvedId = resolvedIds.get(id);
  if (!resolvedId) {
    throw new Error(`Offline ${entity} mutation is waiting for a synced ${entity}`);
  }

  return resolvedId;
}

function base64ToUint8Array(base64: string) {
  const decoded = atob(base64);
  const bytes = new Uint8Array(decoded.length);
  for (let index = 0; index < decoded.length; index += 1) {
    bytes[index] = decoded.charCodeAt(index);
  }
  return bytes;
}

async function runReceiptOcrExtraction(payload: { fileName: string; contentType?: string; fileBase64?: string }) {
  const response = await fetch("/api/receipts/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responseJson = (await response.json().catch(() => null)) as
    | { text?: string; warning?: string }
    | null;

  if (!response.ok) {
    throw new Error(responseJson?.warning ?? "Failed to run OCR extraction");
  }

  return responseJson;
}

async function syncAddAccount(
  payload: AddAccountOfflinePayload,
  resolvedIds: Map<string, string>,
  userId: string
) {
  const supabase = createClient();
  const normalizedName = payload.name.trim();
  const normalizedIncomingBalance = Number.isFinite(payload.balance)
    ? Math.max(0, payload.balance)
    : 0;
  const transactionDate = new Date().toISOString().split("T")[0];

  const { data: existing, error: existingError } = await supabase
    .from("accounts")
    .select("id")
    .eq("user_id", userId)
    .eq("name", normalizedName)
    .eq("type", payload.type)
    .eq("currency", payload.currency)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    if (normalizedIncomingBalance > 0) {
      const { error: txError } = await supabase.rpc("create_user_transaction", {
        p_amount: normalizedIncomingBalance,
        p_category: "salary",
        p_description: `Opening balance: ${normalizedName}`,
        p_date: transactionDate,
        p_currency: payload.currency,
        p_account_id: existing.id,
        p_transfer_id: null,
        p_split_group_id: null,
        p_tags: ["opening-balance"],
        p_attachment_path: null,
      });

      if (txError) {
        throw new Error(txError.message);
      }
    }

    resolvedIds.set(payload.localId, existing.id);
    return;
  }

  const { data, error } = await supabase
    .from("accounts")
    .insert({
      name: normalizedName,
      type: payload.type,
      currency: payload.currency,
      user_id: userId,
      balance: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create account");
  }

  if (normalizedIncomingBalance > 0) {
    const { error: txError } = await supabase.rpc("create_user_transaction", {
      p_amount: normalizedIncomingBalance,
      p_category: "salary",
      p_description: `Opening balance: ${normalizedName}`,
      p_date: transactionDate,
      p_currency: payload.currency,
      p_account_id: data.id,
      p_transfer_id: null,
      p_split_group_id: null,
      p_tags: ["opening-balance"],
      p_attachment_path: null,
    });

    if (txError) {
      await supabase.from("accounts").delete().eq("id", data.id);
      throw new Error(txError.message);
    }
  }

  resolvedIds.set(payload.localId, data.id);
}

async function syncAddTransaction(
  payload: AddTransactionOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const accountId = payload.account_id && isOfflineId(payload.account_id)
    ? resolvedIds.get(payload.account_id) ?? null
    : payload.account_id ?? null;

  if (!accountId) {
    throw new Error("Offline transaction is waiting for a valid synced account");
  }

  const { data, error } = await supabase.rpc("create_user_transaction", {
    p_amount: payload.amount,
    p_category: payload.category,
    p_description: payload.description,
    p_date: payload.date,
    p_currency: payload.currency,
    p_account_id: accountId,
    p_transfer_id: payload.transfer_id ?? null,
    p_split_group_id: payload.split_group_id ?? null,
    p_tags: payload.tags ?? null,
    p_attachment_path: payload.attachment_path ?? null,
  });

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create transaction");
  }

  resolvedIds.set(payload.localId, data.id);
}

async function syncUpdateTransaction(
  payload: UpdateTransactionOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const transactionId = resolveSyncedId(payload.id, resolvedIds, "transaction");

  const { data: existing, error: existingError } = await supabase
    .from("transactions")
    .select("amount, category, description, date, currency, account_id, tags, attachment_path")
    .eq("id", transactionId)
    .single();

  if (existingError) throw new Error(existingError.message);

  const accountId =
    payload.account_id !== undefined
      ? payload.account_id && isOfflineId(payload.account_id)
        ? resolveSyncedId(payload.account_id, resolvedIds, "account")
        : payload.account_id
      : existing.account_id;

  const { error } = await supabase.rpc("update_user_transaction", {
    p_transaction_id: transactionId,
    p_amount: payload.amount ?? existing.amount,
    p_category: payload.category ?? existing.category,
    p_description: payload.description ?? existing.description,
    p_date: payload.date ?? existing.date,
    p_currency: payload.currency ?? existing.currency,
    p_account_id: accountId ?? null,
    p_tags: payload.tags !== undefined ? payload.tags : existing.tags,
    p_attachment_path:
      payload.attachment_path !== undefined
        ? payload.attachment_path
        : existing.attachment_path,
  });

  if (error) throw new Error(error.message);
}

async function syncDeleteTransaction(
  payload: DeleteTransactionOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const transactionId = resolveSyncedId(payload.id, resolvedIds, "transaction");

  const { error } = await supabase.rpc("delete_user_transaction", {
    p_transaction_id: transactionId,
  });

  if (error) throw new Error(error.message);
}

async function syncImportTransactions(
  payload: ImportTransactionsOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();

  const transactions = payload.transactions.map((transaction) => ({
    amount: transaction.amount,
    category: transaction.category,
    description: transaction.description,
    date: transaction.date,
    currency: transaction.currency,
    account_id:
      transaction.account_id && isOfflineId(transaction.account_id)
        ? resolveSyncedId(transaction.account_id, resolvedIds, "account")
        : transaction.account_id ?? null,
    transfer_id: transaction.transfer_id ?? null,
    tags: transaction.tags ?? null,
    attachment_path: transaction.attachment_path ?? null,
    split_group_id: transaction.split_group_id ?? null,
  }));

  const { error } = await supabase.rpc("import_transactions_with_balance", {
    p_transactions: transactions,
  });

  if (error) throw new Error(error.message);
}

async function syncAddGoal(
  payload: AddGoalOfflinePayload,
  resolvedIds: Map<string, string>,
  userId: string
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("goals")
    .insert({
      name: payload.name,
      target_amount: payload.target_amount,
      current_amount: payload.current_amount,
      deadline: payload.deadline,
      category: payload.category,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to create goal");
  }

  resolvedIds.set(payload.localId, data.id);
}

async function syncAddBudget(payload: AddBudgetOfflinePayload, userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("budgets").insert({
    category: payload.category,
    amount: payload.amount,
    month: payload.month,
    period: payload.period ?? "monthly",
    rollover: payload.rollover ?? false,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function syncUpdateBudget(
  payload: UpdateBudgetOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const budgetId = resolveSyncedId(payload.id, resolvedIds, "budget");

  const updates = {
    ...(payload.category !== undefined ? { category: payload.category } : {}),
    ...(payload.amount !== undefined ? { amount: payload.amount } : {}),
    ...(payload.month !== undefined ? { month: payload.month } : {}),
    ...(payload.period !== undefined ? { period: payload.period } : {}),
    ...(payload.rollover !== undefined ? { rollover: payload.rollover } : {}),
  };

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase.from("budgets").update(updates).eq("id", budgetId);
  if (error) throw new Error(error.message);
}

async function syncDeleteBudget(
  payload: DeleteBudgetOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const budgetId = resolveSyncedId(payload.id, resolvedIds, "budget");
  const { error } = await supabase.from("budgets").delete().eq("id", budgetId);
  if (error) throw new Error(error.message);
}

async function syncCreateTransfer(
  payload: CreateTransferOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const fromAccountId = payload.fromAccountId && isOfflineId(payload.fromAccountId)
    ? resolveSyncedId(payload.fromAccountId, resolvedIds, "account")
    : payload.fromAccountId;
  const toAccountId = payload.toAccountId && isOfflineId(payload.toAccountId)
    ? resolveSyncedId(payload.toAccountId, resolvedIds, "account")
    : payload.toAccountId;

  const { error } = await supabase.rpc("create_account_transfer", {
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    transfer_amount: Math.abs(payload.amount),
    transfer_date: payload.date,
    transfer_description: payload.description ?? null,
  });

  if (error) throw new Error(error.message);
}

async function syncAddFundsToGoal(
  payload: AddFundsToGoalOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const goalId = payload.goalId && isOfflineId(payload.goalId)
    ? resolveSyncedId(payload.goalId, resolvedIds, "goal")
    : payload.goalId;
  const accountId = payload.accountId && isOfflineId(payload.accountId)
    ? resolveSyncedId(payload.accountId, resolvedIds, "account")
    : payload.accountId;

  const { error } = await supabase.rpc("add_funds_to_goal", {
    p_goal_id: goalId,
    p_account_id: accountId,
    p_amount: Math.abs(payload.amount),
    p_note: payload.note ?? null,
    p_funding_date: payload.fundingDate,
  });

  if (error) throw new Error(error.message);
}

async function syncUploadAttachment(
  payload: UploadAttachmentOfflinePayload,
  resolvedIds: Map<string, string>,
  userId: string
) {
  if (!payload.fileBase64 || !payload.fileName) {
    throw new Error("Offline receipt upload is missing file data and needs review");
  }

  const supabase = createClient();
  const transactionId = payload.transactionId && isOfflineId(payload.transactionId)
    ? resolveSyncedId(payload.transactionId, resolvedIds, "transaction")
    : payload.transactionId;
  const extension = payload.fileName.split(".").pop() ?? "bin";
  const path = `${userId}/${transactionId}.${extension}`;
  const bytes = base64ToUint8Array(payload.fileBase64);

  const { error: uploadError } = await supabase.storage
    .from("receipts")
    .upload(path, bytes, {
      upsert: true,
      contentType: payload.contentType ?? "application/octet-stream",
    });

  if (uploadError) throw new Error(uploadError.message);

  const { error: updateError } = await supabase
    .from("transactions")
    .update({ attachment_path: path })
    .eq("id", transactionId);

  if (updateError) throw new Error(updateError.message);
}

async function syncRunReceiptOcr(payload: {
  fileName: string;
  contentType?: string;
  fileBase64?: string;
}) {
  const result = await runReceiptOcrExtraction(payload);

  if (!result?.text || result.text.trim().length === 0) {
    throw new Error("OCR finished but no text was extracted. Needs manual review");
  }
}

async function syncUpdateAccount(
  payload: UpdateAccountOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const accountId = resolveSyncedId(payload.id, resolvedIds, "account");

  const { data: existingAccount, error: existingAccountError } = await supabase
    .from("accounts")
    .select("id, name")
    .eq("id", accountId)
    .single();

  if (existingAccountError) throw new Error(existingAccountError.message);

  const normalizedName = payload.name?.trim();
  const shouldPropagateRename =
    Boolean(normalizedName) && normalizedName !== existingAccount.name;

  const updates = {
    ...(normalizedName ? { name: normalizedName } : {}),
    ...(payload.type !== undefined ? { type: payload.type } : {}),
    ...(payload.currency !== undefined ? { currency: payload.currency } : {}),
    ...(payload.is_archived !== undefined ? { is_archived: payload.is_archived } : {}),
  };

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase.from("accounts").update(updates).eq("id", accountId);
  if (error) throw new Error(error.message);

  if (shouldPropagateRename && normalizedName) {
    const { error: transactionRenameError } = await supabase
      .from("transactions")
      .update({ description: `Opening balance: ${normalizedName}` })
      .eq("account_id", accountId)
      .ilike("description", "Opening balance:%");

    if (transactionRenameError) {
      throw new Error(transactionRenameError.message);
    }
  }
}

async function syncDeleteAccount(
  payload: DeleteAccountOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const accountId = resolveSyncedId(payload.id, resolvedIds, "account");

  const { error } = await supabase.from("accounts").delete().eq("id", accountId);
  if (error) throw new Error(error.message);
}

async function syncUpdateGoal(
  payload: UpdateGoalOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const goalId = resolveSyncedId(payload.id, resolvedIds, "goal");

  const updates = {
    ...(payload.name !== undefined ? { name: payload.name } : {}),
    ...(payload.target_amount !== undefined
      ? { target_amount: payload.target_amount }
      : {}),
    ...(payload.current_amount !== undefined
      ? { current_amount: payload.current_amount }
      : {}),
    ...(payload.deadline !== undefined ? { deadline: payload.deadline } : {}),
    ...(payload.category !== undefined ? { category: payload.category } : {}),
    ...(payload.is_completed !== undefined ? { is_completed: payload.is_completed } : {}),
  };

  if (Object.keys(updates).length === 0) {
    return;
  }

  const { error } = await supabase.from("goals").update(updates).eq("id", goalId);
  if (error) throw new Error(error.message);
}

async function syncDeleteGoal(
  payload: DeleteGoalOfflinePayload,
  resolvedIds: Map<string, string>
) {
  const supabase = createClient();
  const goalId = resolveSyncedId(payload.id, resolvedIds, "goal");

  const { error } = await supabase.from("goals").delete().eq("id", goalId);
  if (error) throw new Error(error.message);
}

async function processMutation(
  mutation: OfflineMutationRecord,
  resolvedIds: Map<string, string>,
  userId: string
) {
  switch (mutation.type) {
    case "addAccount":
      return syncAddAccount(mutation.payload as AddAccountOfflinePayload, resolvedIds, userId);
    case "updateAccount":
      return syncUpdateAccount(mutation.payload as UpdateAccountOfflinePayload, resolvedIds);
    case "deleteAccount":
      return syncDeleteAccount(mutation.payload as DeleteAccountOfflinePayload, resolvedIds);
    case "addTransaction":
      return syncAddTransaction(mutation.payload as AddTransactionOfflinePayload, resolvedIds);
    case "updateTransaction":
      return syncUpdateTransaction(mutation.payload as UpdateTransactionOfflinePayload, resolvedIds);
    case "deleteTransaction":
      return syncDeleteTransaction(mutation.payload as DeleteTransactionOfflinePayload, resolvedIds);
    case "importTransactions":
      return syncImportTransactions(mutation.payload as ImportTransactionsOfflinePayload, resolvedIds);
    case "addGoal":
      return syncAddGoal(mutation.payload as AddGoalOfflinePayload, resolvedIds, userId);
    case "updateGoal":
      return syncUpdateGoal(mutation.payload as UpdateGoalOfflinePayload, resolvedIds);
    case "deleteGoal":
      return syncDeleteGoal(mutation.payload as DeleteGoalOfflinePayload, resolvedIds);
    case "addBudget":
      return syncAddBudget(mutation.payload as AddBudgetOfflinePayload, userId);
    case "updateBudget":
      return syncUpdateBudget(mutation.payload as UpdateBudgetOfflinePayload, resolvedIds);
    case "deleteBudget":
      return syncDeleteBudget(mutation.payload as DeleteBudgetOfflinePayload, resolvedIds);
    case "createTransfer":
      return syncCreateTransfer(mutation.payload as CreateTransferOfflinePayload, resolvedIds);
    case "addFundsToGoal":
      return syncAddFundsToGoal(mutation.payload as AddFundsToGoalOfflinePayload, resolvedIds);
    case "uploadAttachment":
      return syncUploadAttachment(mutation.payload as UploadAttachmentOfflinePayload, resolvedIds, userId);
    case "runReceiptOcr":
      return syncRunReceiptOcr(mutation.payload as ReceiptOcrOfflinePayload);
    default:
      throw new Error("Unknown offline mutation type");
  }
}

export async function syncOfflineQueue(queryClient: QueryClient) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const mutations = await listQueuedMutations();
  if (mutations.length === 0) {
    await patchOfflineSyncMeta({
      status: "synced",
      queuedCount: 0,
      failedCount: 0,
      lastError: null,
      lastSyncedAt: new Date().toISOString(),
    });
    return;
  }

  await patchOfflineSyncMeta({ status: "syncing", lastError: null });
  const startMs = Date.now();
  let runSucceeded = 0;
  let runFailed = 0;
  let runConflicts = 0;

  const resolvedIds = new Map<string, string>();
  let didProcessAny = false;

  for (const mutation of mutations) {
    await updateOfflineMutationStatus(mutation.id, "syncing");
    try {
      await processMutation(mutation, resolvedIds, user.id);
      await removeOfflineMutation(mutation.id);
      didProcessAny = true;
      runSucceeded += 1;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Offline sync failed";
      const needsReview =
        mutation.type === "uploadAttachment" ||
        mutation.type === "runReceiptOcr";

      await updateOfflineMutationStatus(mutation.id, needsReview ? "conflict" : "failed", message);
      if (needsReview) {
        runConflicts += 1;
      } else {
        runFailed += 1;
      }
      await addOfflineConflict({
        id: `conflict-${mutation.id}`,
        type: mutation.type,
        message,
        createdAt: new Date().toISOString(),
        mutationId: mutation.id,
      });
    }
  }

  const remaining = await offlineDb.queuedMutations.toArray();
  const failedCount = remaining.filter(
    (entry) => entry.status === "failed" || entry.status === "conflict"
  ).length;
  const elapsedMs = Date.now() - startMs;
  const currentMeta = await getOfflineSyncMeta();

  await patchOfflineSyncMeta({
    status: failedCount > 0 ? "error" : "synced",
    queuedCount: remaining.length,
    failedCount,
    lastError: failedCount > 0 ? "Some offline changes need review" : null,
    lastSyncedAt: didProcessAny ? new Date().toISOString() : null,
    totalSyncRuns: currentMeta.totalSyncRuns + 1,
    totalSyncedMutations: currentMeta.totalSyncedMutations + runSucceeded,
    totalFailedMutations: currentMeta.totalFailedMutations + runFailed,
    totalConflictMutations: currentMeta.totalConflictMutations + runConflicts,
    totalReplayDurationMs: currentMeta.totalReplayDurationMs + elapsedMs,
    lastReplayDurationMs: elapsedMs,
    lastRunAt: new Date().toISOString(),
  });

  queryClient.invalidateQueries({ queryKey: ["accounts"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["goals"] });
  queryClient.invalidateQueries({ queryKey: ["budgets"] });

  if (didProcessAny) {
    toast.success("Offline changes synced");
  }
}
