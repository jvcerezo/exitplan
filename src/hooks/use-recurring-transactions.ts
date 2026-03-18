import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type {
  RecurringTransaction,
  RecurringTransactionInsert,
} from "@/lib/types/database";

export function useRecurringTransactions() {
  return useQuery({
    queryKey: ["recurring-transactions"],
    queryFn: async (): Promise<RecurringTransaction[]> => {
      const supabase = createClient();
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
      const supabase = createClient();
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
      toast.success("Recurring transaction created");
    },
    onError: (error) => {
      toast.error("Failed to create recurring transaction", {
        description: error.message,
      });
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
      const supabase = createClient();
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
      toast.success("Recurring transaction updated");
    },
    onError: (error) => {
      toast.error("Failed to update recurring transaction", {
        description: error.message,
      });
    },
  });
}

export function useDeleteRecurringTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("recurring_transactions")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
      toast.success("Recurring transaction deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete recurring transaction", {
        description: error.message,
      });
    },
  });
}

export function useProcessDueRecurringTransactions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<number> => {
      const supabase = createClient();
      // Pass the caller's local time so run_time gating works correctly
      const now = new Date();
      const localTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      const { data, error } = await supabase.rpc(
        "process_due_recurring_transactions",
        { p_current_time: localTime }
      );

      if (error) throw new Error(error.message);
      return Number(data ?? 0);
    },
    onSuccess: (count) => {
      if (count > 0) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["recurring-transactions"] });
        toast.success(
          `${count} recurring transaction${count === 1 ? "" : "s"} processed`
        );
      }
    },
    onError: (error) => {
      console.error("Failed to process recurring transactions:", error.message);
    },
  });
}

/** Returns count of recurring transactions due today or earlier */
export function useDueRecurringCount() {
  return useQuery({
    queryKey: ["recurring-transactions", "due-count"],
    queryFn: async (): Promise<number> => {
      const supabase = createClient();
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
