import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Transaction, TransactionInsert } from "@exitplan/core";

export function useRecentTransactions() {
  return useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: async (): Promise<Transaction[]> => {
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
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["transactions", "all", filters],
    queryFn: async (): Promise<Transaction[]> => {
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

export function useTransactionsSummary() {
  return useQuery({
    queryKey: ["transactions", "summary"],
    queryFn: async () => {
      const [txResult, accountResult, goalsResult] = await Promise.all([
        supabase.from("transactions").select("amount, account_id"),
        supabase.from("accounts").select("balance"),
        supabase.from("goals").select("current_amount"),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (accountResult.error) throw new Error(accountResult.error.message);
      if (goalsResult.error) throw new Error(goalsResult.error.message);

      const transactions = txResult.data;
      const accounts = accountResult.data ?? [];
      const goals = goalsResult.data ?? [];

      const income = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const accountsTotal = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
      const unlinkedBalance = transactions
        .filter((t) => !t.account_id)
        .reduce((sum, t) => sum + t.amount, 0);
      const goalsTotalSaved = goals.reduce((sum, g) => sum + Number(g.current_amount), 0);

      return {
        balance: Math.round((accountsTotal + goalsTotalSaved + unlinkedBalance) * 100) / 100,
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        breakdown: {
          inAccounts: Math.round(accountsTotal * 100) / 100,
          inGoals: Math.round(goalsTotalSaved * 100) / 100,
        },
      };
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
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
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("delete_user_transaction", {
        p_transaction_id: id,
      });

      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["transactions"] });
      const previousRecent = queryClient.getQueryData<Transaction[]>(["transactions", "recent"]);
      queryClient.setQueryData<Transaction[]>(["transactions", "recent"], (old) =>
        (old ?? []).filter((t) => t.id !== id)
      );
      return { previousRecent };
    },
    onError: (_error, _id, context) => {
      if (context?.previousRecent) {
        queryClient.setQueryData(["transactions", "recent"], context.previousRecent);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TransactionInsert> & { id: string }) => {
      const { data: existing, error: existingError } = await supabase
        .from("transactions")
        .select("amount, category, description, date, currency, account_id, tags, attachment_path")
        .eq("id", id)
        .single();

      if (existingError) throw new Error(existingError.message);

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
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}
