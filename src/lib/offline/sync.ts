import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { offlineDb } from "@/lib/offline/db";
import {
  addOfflineConflict,
  listQueuedMutations,
  patchOfflineSyncMeta,
  removeOfflineMutation,
  updateOfflineMutationStatus,
} from "@/lib/offline/store";
import { isOfflineId } from "@/lib/offline/utils";
import type {
  AddAccountOfflinePayload,
  AddBudgetOfflinePayload,
  AddGoalOfflinePayload,
  AddTransactionOfflinePayload,
  OfflineMutationRecord,
} from "@/lib/offline/types";

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

  const { error } = await supabase.rpc("create_user_transaction", {
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

  if (error) {
    throw new Error(error.message);
  }
}

async function syncAddGoal(payload: AddGoalOfflinePayload, userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("goals").insert({
    name: payload.name,
    target_amount: payload.target_amount,
    current_amount: payload.current_amount,
    deadline: payload.deadline,
    category: payload.category,
    user_id: userId,
  });

  if (error) {
    throw new Error(error.message);
  }
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

async function processMutation(
  mutation: OfflineMutationRecord,
  resolvedIds: Map<string, string>,
  userId: string
) {
  switch (mutation.type) {
    case "addAccount":
      return syncAddAccount(mutation.payload as AddAccountOfflinePayload, resolvedIds, userId);
    case "addTransaction":
      return syncAddTransaction(mutation.payload as AddTransactionOfflinePayload, resolvedIds);
    case "addGoal":
      return syncAddGoal(mutation.payload as AddGoalOfflinePayload, userId);
    case "addBudget":
      return syncAddBudget(mutation.payload as AddBudgetOfflinePayload, userId);
    case "uploadAttachment":
    case "importTransactions":
    case "runReceiptOcr":
      throw new Error("This offline task type is not supported yet and needs review");
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

  const resolvedIds = new Map<string, string>();
  let didProcessAny = false;

  for (const mutation of mutations) {
    await updateOfflineMutationStatus(mutation.id, "syncing");
    try {
      await processMutation(mutation, resolvedIds, user.id);
      await removeOfflineMutation(mutation.id);
      didProcessAny = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Offline sync failed";
      const needsReview =
        mutation.type === "uploadAttachment" ||
        mutation.type === "importTransactions" ||
        mutation.type === "runReceiptOcr";

      await updateOfflineMutationStatus(mutation.id, needsReview ? "conflict" : "failed", message);
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

  await patchOfflineSyncMeta({
    status: failedCount > 0 ? "error" : "synced",
    queuedCount: remaining.length,
    failedCount,
    lastError: failedCount > 0 ? "Some offline changes need review" : null,
    lastSyncedAt: didProcessAny ? new Date().toISOString() : null,
  });

  queryClient.invalidateQueries({ queryKey: ["accounts"] });
  queryClient.invalidateQueries({ queryKey: ["transactions"] });
  queryClient.invalidateQueries({ queryKey: ["goals"] });
  queryClient.invalidateQueries({ queryKey: ["budgets"] });

  if (didProcessAny) {
    toast.success("Offline changes synced");
  }
}
