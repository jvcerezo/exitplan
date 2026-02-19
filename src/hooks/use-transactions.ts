import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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
        query = query.ilike("description", `%${filters.search}%`);
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

      return { balance: income - expenses, income, expenses };
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

      const { data, error } = await supabase
        .from("transactions")
        .insert({ ...transaction, user_id: user!.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
