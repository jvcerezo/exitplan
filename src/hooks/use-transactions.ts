import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import {
  addOfflineTransactionToCache,
  updateOfflineAccountBalance,
} from "@/lib/offline/query-cache";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";
import type { Transaction, TransactionInsert } from "@/lib/types/database";

export function useRecentTransactions() {
  return useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async (): Promise<Transaction[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false })
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
  limit?: number;
}) {
  return useQuery({
    queryKey: ["transactions", "all", filters],
    queryFn: async (): Promise<Transaction[]> => {
      const supabase = createClient();
      let query = supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

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

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
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
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success("Transaction updated");
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
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success(`Imported ${count} transactions`);
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
      const supabase = createClient();

      // Use the atomic RPC — balance reversal + delete happen in one DB transaction
      const { error } = await supabase.rpc("delete_user_transaction", {
        p_transaction_id: id,
      });

      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousRecent = queryClient.getQueryData<Transaction[]>(["transactions", "recent"]);
      const previousAll = queryClient.getQueryData<Transaction[]>(["transactions", "all", undefined]);
      if (previousRecent) {
        queryClient.setQueryData<Transaction[]>(
          ["transactions", "recent"],
          previousRecent.filter((t) => t.id !== id)
        );
      }
      if (previousAll) {
        queryClient.setQueryData<Transaction[]>(
          ["transactions", "all", undefined],
          previousAll.filter((t) => t.id !== id)
        );
      }
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
      toast.success("Transaction deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
    },
  });
}
