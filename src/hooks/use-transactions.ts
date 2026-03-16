import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import {
  addOfflineTransactionToCache,
  removeOfflineTransactionFromCache,
  updateOfflineTransactionInCache,
  updateOfflineAccountBalance,
} from "@/lib/offline/query-cache";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";
import type { Transaction, TransactionInsert } from "@/lib/types/database";

function isMissingRpcFunctionError(error: {
  message?: string;
  code?: string;
  details?: string;
} | null, functionName: string) {
  if (!error) return false;
  const message = `${error.message ?? ""} ${error.details ?? ""}`.toLowerCase();
  return (
    error.code === "PGRST202" ||
    (message.includes("could not find the function") &&
      message.includes(`public.${functionName}`.toLowerCase()))
  );
}

function findCachedTransaction(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  const recent = queryClient.getQueryData<Transaction[]>(["transactions", "recent"]) ?? [];
  const fromRecent = recent.find((transaction) => transaction.id === id);
  if (fromRecent) {
    return fromRecent;
  }

  const queryCache = queryClient.getQueryCache();
  const allQueries = queryCache.findAll({ queryKey: ["transactions", "all"] });
  for (const query of allQueries) {
    const entries = (query.state.data as Transaction[] | undefined) ?? [];
    const existing = entries.find((transaction) => transaction.id === id);
    if (existing) {
      return existing;
    }
  }

  return null;
}

export function useRecentTransactions() {
  return useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async (): Promise<Transaction[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useTransactions(filters?: {
  category?: string;
  type?: "income" | "expense" | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  tag?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["transactions", "all", filters],
    queryFn: async (): Promise<Transaction[]> => {
      const supabase = createClient();
      let query = supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.type === "income") {
        query = query.gt("amount", 0);
      } else if (filters?.type === "expense") {
        query = query.lt("amount", 0);
      }

      if (filters?.search) {
        const search = filters.search.slice(0, 200);
        query = query.ilike("description", `%${search}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte("date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("date", filters.dateTo);
      }

      if (filters?.accountId) {
        query = query.eq("account_id", filters.accountId);
      }

      if (filters?.tag) {
        query = query.contains("tags", [filters.tag]);
      }

      if (filters?.offset && filters.offset > 0) {
        query = query.range(filters.offset, filters.offset + (filters.limit ?? 50) - 1);
      } else if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useTransactionsCount(filters?: {
  category?: string;
  type?: "income" | "expense" | "all";
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  tag?: string;
}) {
  return useQuery({
    queryKey: ["transactions", "count", filters],
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
      let query = supabase
        .from("transactions")
        .select("id", { count: "exact", head: true });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.type === "income") {
        query = query.gt("amount", 0);
      } else if (filters?.type === "expense") {
        query = query.lt("amount", 0);
      }

      if (filters?.search) {
        const search = filters.search.slice(0, 200);
        query = query.ilike("description", `%${search}%`);
      }

      if (filters?.dateFrom) {
        query = query.gte("date", filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte("date", filters.dateTo);
      }

      if (filters?.accountId) {
        query = query.eq("account_id", filters.accountId);
      }

      if (filters?.tag) {
        query = query.contains("tags", [filters.tag]);
      }

      const { count, error } = await query;
      if (error) throw new Error(error.message);

      return count ?? 0;
    },
  });
}

export function useTransactionsSummary() {
  return useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: async () => {
      const supabase = createClient();

      const [txResult, accountResult, goalsResult, budgetsResult] = await Promise.all([
        supabase.from("transactions").select("amount, account_id"),
        supabase
          .from("accounts")
          .select("balance"),
        supabase.from("goals").select("current_amount"),
        supabase.from("budgets").select("amount"),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (accountResult.error) throw new Error(accountResult.error.message);
      if (goalsResult.error) throw new Error(goalsResult.error.message);
      if (budgetsResult.error) throw new Error(budgetsResult.error.message);

      const transactions = txResult.data;
      const accounts = accountResult.data ?? [];
      const goals = goalsResult.data ?? [];
      const budgets = budgetsResult.data ?? [];

      const income = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Account balances already include their linked transactions,
      // so only add unlinked transaction amounts to avoid double-counting.
      // Goal savings are included so moving money to goals doesn't reduce total.
      const accountsTotal = accounts.reduce(
        (sum, a) => sum + Number(a.balance),
        0
      );
      const unlinkedBalance = transactions
        .filter((t) => !t.account_id)
        .reduce((sum, t) => sum + t.amount, 0);
      const goalsTotalSaved = goals.reduce(
        (sum, g) => sum + Number(g.current_amount),
        0
      );
      const budgetsTotal = budgets.reduce(
        (sum, b) => sum + Number(b.amount),
        0
      );

      return {
        balance: Math.round((accountsTotal + goalsTotalSaved + unlinkedBalance) * 100) / 100,
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        breakdown: {
          inAccounts: Math.round(accountsTotal * 100) / 100,
          inGoals: Math.round(goalsTotalSaved * 100) / 100,
          budgetAllocated: Math.round(budgetsTotal * 100) / 100,
        },
      };
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      if (isBrowserOffline()) {
        if (!transaction.account_id) {
          throw new Error("Select an account before adding this transaction");
        }

        const localId = createOfflineId("transaction");
        const offlineTransaction: Transaction = {
          id: localId,
          created_at: new Date().toISOString(),
          user_id: "offline",
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
          currency: transaction.currency,
          attachment_path: transaction.attachment_path ?? null,
          account_id: transaction.account_id ?? null,
          transfer_id: transaction.transfer_id ?? null,
          split_group_id: transaction.split_group_id ?? null,
          tags: transaction.tags ?? null,
        };

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "addTransaction",
          payload: {
            localId,
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            currency: transaction.currency,
            account_id: transaction.account_id ?? null,
            transfer_id: transaction.transfer_id ?? null,
            split_group_id: transaction.split_group_id ?? null,
            tags: transaction.tags ?? null,
            attachment_path: transaction.attachment_path ?? null,
          },
        });

        addOfflineTransactionToCache(queryClient, offlineTransaction);
        if (transaction.account_id) {
          updateOfflineAccountBalance(queryClient, transaction.account_id, transaction.amount);
        }

        return offlineTransaction;
      }

      const supabase = createClient();

      const { data: activeAccounts, error: accountsError } = await supabase
        .from("accounts")
        .select("id")
        .limit(1);

      if (accountsError) throw new Error(accountsError.message);
      if (!activeAccounts || activeAccounts.length === 0) {
        throw new Error("Create an account first before adding income or expense");
      }

      if (!transaction.account_id) {
        throw new Error("Select an account before adding this transaction");
      }

      const { data, error } = await supabase.rpc("create_user_transaction", {
        p_amount: transaction.amount,
        p_category: transaction.category,
        p_description: transaction.description,
        p_date: transaction.date,
        p_currency: transaction.currency,
        p_account_id: transaction.account_id ?? null,
        p_transfer_id: transaction.transfer_id ?? null,
        p_tags: transaction.tags ?? null,
        p_attachment_path: transaction.attachment_path ?? null,
        p_split_group_id: transaction.split_group_id ?? null,
      });

      if (error) throw new Error(error.message);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success(isBrowserOffline() ? "Transaction saved offline" : "Transaction added");
    },
    onError: (error) => {
      toast.error("Failed to add transaction", { description: error.message });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<TransactionInsert> & { id: string }) => {
      if (isBrowserOffline()) {
        const existing = findCachedTransaction(queryClient, id);

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "updateTransaction",
          payload: { id, ...updates },
        });

        updateOfflineTransactionInCache(queryClient, id, updates as Partial<Transaction>);

        if (existing) {
          const nextAmount = updates.amount ?? existing.amount;
          const nextAccountId =
            updates.account_id !== undefined ? updates.account_id : existing.account_id;

          if (existing.account_id) {
            updateOfflineAccountBalance(queryClient, existing.account_id, -existing.amount);
          }
          if (nextAccountId) {
            updateOfflineAccountBalance(queryClient, nextAccountId, nextAmount);
          }
        }

        return { id, ...updates };
      }

      const supabase = createClient();

      // Fetch existing values so partial updates can fill in any missing fields
      const { data: existing, error: existingError } = await supabase
        .from("transactions")
        .select("amount, category, description, date, currency, account_id, tags, attachment_path")
        .eq("id", id)
        .single();

      if (existingError) throw new Error(existingError.message);

      // Use the atomic RPC — balance reversal + row update happen in one DB transaction
      const { data, error } = await supabase.rpc("update_user_transaction", {
        p_transaction_id: id,
        p_amount: updates.amount ?? existing.amount,
        p_category: updates.category ?? existing.category,
        p_description: updates.description ?? existing.description,
        p_date: updates.date ?? existing.date,
        p_currency: updates.currency ?? existing.currency,
        p_account_id: "account_id" in updates ? (updates.account_id ?? null) : existing.account_id,
        p_tags: "tags" in updates ? (updates.tags ?? null) : existing.tags,
        p_attachment_path: "attachment_path" in updates ? (updates.attachment_path ?? null) : existing.attachment_path,
      });

      if (error) throw new Error(error.message);

      return data;
    },
    onSuccess: () => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(
        isBrowserOffline() ? "Transaction update saved offline" : "Transaction updated"
      );
    },
    onError: (error) => {
      toast.error("Failed to update transaction", { description: error.message });
    },
  });
}

export function useImportTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactions: TransactionInsert[]) => {
      if (isBrowserOffline()) {
        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "importTransactions",
          payload: {
            transactions: transactions.map((transaction) => ({
              amount: transaction.amount,
              category: transaction.category,
              description: transaction.description,
              date: transaction.date,
              currency: transaction.currency,
              account_id: transaction.account_id ?? null,
              transfer_id: transaction.transfer_id ?? null,
              tags: transaction.tags ?? null,
              attachment_path: transaction.attachment_path ?? null,
              split_group_id: transaction.split_group_id ?? null,
            })),
          },
        });

        for (const transaction of transactions) {
          const offlineTransaction: Transaction = {
            id: createOfflineId("transaction"),
            created_at: new Date().toISOString(),
            user_id: "offline",
            amount: transaction.amount,
            category: transaction.category,
            description: transaction.description,
            date: transaction.date,
            currency: transaction.currency,
            attachment_path: transaction.attachment_path ?? null,
            account_id: transaction.account_id ?? null,
            transfer_id: transaction.transfer_id ?? null,
            split_group_id: transaction.split_group_id ?? null,
            tags: transaction.tags ?? null,
          };

          addOfflineTransactionToCache(queryClient, offlineTransaction);
          if (transaction.account_id) {
            updateOfflineAccountBalance(queryClient, transaction.account_id, transaction.amount);
          }
        }

        return transactions.length;
      }

      const supabase = createClient();
      const payload = transactions.map((transaction) => ({
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
        currency: transaction.currency,
        account_id: transaction.account_id ?? null,
        transfer_id: transaction.transfer_id ?? null,
        tags: transaction.tags ?? null,
        attachment_path: transaction.attachment_path ?? null,
      }));

      const { data, error } = await supabase.rpc("import_transactions_with_balance", {
        p_transactions: payload,
      });

      if (error) throw new Error(error.message);

      return Number(data ?? 0);
    },
    onSuccess: (count) => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(
        isBrowserOffline()
          ? `${count} transaction${count === 1 ? "" : "s"} queued offline`
          : `Imported ${count} transactions`
      );
    },
    onError: (error) => {
      toast.error("Import failed", { description: error.message });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (isBrowserOffline()) {
        const existing = findCachedTransaction(queryClient, id);

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "deleteTransaction",
          payload: { id },
        });

        if (existing?.account_id) {
          updateOfflineAccountBalance(queryClient, existing.account_id, -existing.amount);
        }

        return;
      }

      const supabase = createClient();

      // Use the atomic RPC — balance reversal + delete happen in one DB transaction
      const { error } = await supabase.rpc("delete_user_transaction", {
        p_transaction_id: id,
      });

      if (!error) return;

      if (!isMissingRpcFunctionError(error, "delete_user_transaction")) {
        throw new Error(error.message);
      }

      const { data: existingTransaction, error: existingTransactionError } = await supabase
        .from("transactions")
        .select("id, amount, account_id")
        .eq("id", id)
        .single();

      if (existingTransactionError) {
        throw new Error(existingTransactionError.message);
      }

      if (existingTransaction.account_id) {
        const { data: existingAccount, error: existingAccountError } = await supabase
          .from("accounts")
          .select("balance")
          .eq("id", existingTransaction.account_id)
          .single();

        if (existingAccountError) {
          throw new Error(existingAccountError.message);
        }

        const adjustedBalance =
          Math.round(
            (Number(existingAccount.balance) - Number(existingTransaction.amount)) *
              100
          ) / 100;

        const { error: updateAccountError } = await supabase
          .from("accounts")
          .update({ balance: adjustedBalance })
          .eq("id", existingTransaction.account_id);

        if (updateAccountError) {
          throw new Error(updateAccountError.message);
        }
      }

      const { error: deleteTransactionError } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (deleteTransactionError) {
        throw new Error(deleteTransactionError.message);
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousRecent = queryClient.getQueryData<Transaction[]>(["transactions", "recent"]);
      const previousAll = queryClient.getQueryData<Transaction[]>(["transactions", "all", undefined]);
      removeOfflineTransactionFromCache(queryClient, id);
      return { previousRecent, previousAll };
    },
    onError: (error, _id, context) => {
      if (context?.previousRecent) {
        queryClient.setQueryData(["transactions", "recent"], context.previousRecent);
      }
      if (context?.previousAll) {
        queryClient.setQueryData(["transactions", "all", undefined], context.previousAll);
      }
      toast.error("Failed to delete transaction", { description: error.message });
    },
    onSuccess: () => {
      toast.success(
        isBrowserOffline() ? "Transaction delete saved offline" : "Transaction deleted"
      );
    },
    onSettled: () => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
    },
  });
}
