import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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
      const { data, error } = await supabase
        .from("transactions")
        .select("amount");

      if (error) throw new Error(error.message);

      const income = data
        .filter((t: { amount: number }) => t.amount > 0)
        .reduce((sum: number, t: { amount: number }) => sum + t.amount, 0);
      const expenses = data
        .filter((t: { amount: number }) => t.amount < 0)
        .reduce(
          (sum: number, t: { amount: number }) => sum + Math.abs(t.amount),
          0
        );

      return {
        balance: Math.round((income - expenses) * 100) / 100,
        income: Math.round(income * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
      };
    },
  });
}

export function useAddTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transaction: TransactionInsert) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...transaction, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Sync account balance
      if (transaction.account_id) {
        const { data: account } = await supabase
          .from("accounts")
          .select("balance")
          .eq("id", transaction.account_id)
          .single();

        if (account) {
          await supabase
            .from("accounts")
            .update({ balance: account.balance + transaction.amount })
            .eq("id", transaction.account_id);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transaction added");
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
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction updated");
    },
    onError: (error) => {
      toast.error("Failed to update transaction", { description: error.message });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

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
    },
  });
}
