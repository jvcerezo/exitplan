import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { RecurringTransaction, RecurringTransactionInsert } from "@exitplan/core";

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ["recurring-transactions"],
    queryFn: async (): Promise<RecurringTransaction[]> => {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .select("*")
        .order("next_run_date", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useAddRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recurring: RecurringTransactionInsert) => {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .insert(recurring)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
    },
  });
}

export function useUpdateRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<RecurringTransactionInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from("recurring_transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
    },
  });
}

export function useDueRecurringCount() {
  return useQuery({
    queryKey: ["recurring-transactions", "due-count"],
    queryFn: async (): Promise<number> => {
      const today = new Date().toISOString().split("T")[0];
      const { count, error } = await supabase
        .from("recurring_transactions")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true)
        .lte("next_run_date", today);

      if (error) throw new Error(error.message);
      return count ?? 0;
    },
  });
}
