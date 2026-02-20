import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Budget, BudgetInsert } from "@/lib/types/database";

export function useBudgets(month: string) {
  return useQuery({
    queryKey: ["budgets", month],
    queryFn: async (): Promise<Budget[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("month", month)
        .order("category", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useBudgetSummary(month: string) {
  return useQuery({
    queryKey: ["budgets", "summary", month],
    queryFn: async () => {
      const supabase = createClient();

      // Fetch budgets for the month
      const { data: budgets, error: budgetsError } = await supabase
        .from("budgets")
        .select("*")
        .eq("month", month);

      if (budgetsError) throw new Error(budgetsError.message);

      // Fetch expense transactions for the month
      // month is "YYYY-MM-01", we need transactions where date is within that month
      const startDate = month;
      const [year, monthNum] = month.split("-").map(Number);
      const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0]; // last day of month

      const { data: transactions, error: txError } = await supabase
        .from("transactions")
        .select("amount, category")
        .gte("date", startDate)
        .lte("date", endDate)
        .lt("amount", 0); // only expenses (negative amounts)

      if (txError) throw new Error(txError.message);

      // Compute spent per category (amounts are negative, so we use Math.abs)
      const spentByCategory: Record<string, number> = {};
      for (const tx of transactions) {
        const cat = tx.category;
        spentByCategory[cat] = (spentByCategory[cat] || 0) + Math.abs(tx.amount);
      }

      const totalBudget = budgets.reduce(
        (sum: number, b: Budget) => sum + b.amount,
        0
      );
      const totalSpent = Object.values(spentByCategory).reduce(
        (sum, v) => sum + v,
        0
      );

      return {
        budgets,
        spentByCategory,
        totalBudget,
        totalSpent,
      };
    },
  });
}

export function useAddBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("budgets")
        .insert({ ...budget, user_id: user!.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget added");
    },
    onError: (error) => {
      toast.error("Failed to add budget", { description: error.message });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<BudgetInsert> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget updated");
    },
    onError: (error) => {
      toast.error("Failed to update budget", { description: error.message });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete budget", { description: error.message });
    },
  });
}
