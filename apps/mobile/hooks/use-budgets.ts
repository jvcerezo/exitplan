import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Budget, BudgetInsert, BudgetPeriod } from "@exitplan/core";

function normalizeBudgetCategory(category: string): string {
  return category.trim().toLowerCase();
}

export function useBudgets(month: string, period: BudgetPeriod = "monthly") {
  return useQuery({
    queryKey: ["budgets", month, period],
    queryFn: async (): Promise<Budget[]> => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("month", month)
        .eq("period", period)
        .order("category", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useBudgetSummary(month: string, period: BudgetPeriod = "monthly") {
  return useQuery({
    queryKey: ["budgets", "summary", month, period],
    queryFn: async () => {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = month;
      const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0];

      const [budgetsResult, txResult] = await Promise.all([
        supabase.from("budgets").select("*").eq("month", month).eq("period", period),
        supabase
          .from("transactions")
          .select("amount, category")
          .gte("date", startDate)
          .lte("date", endDate)
          .lt("amount", 0),
      ]);

      if (budgetsResult.error) throw new Error(budgetsResult.error.message);
      if (txResult.error) throw new Error(txResult.error.message);

      const budgets: Budget[] = budgetsResult.data ?? [];
      const transactions = txResult.data ?? [];

      const budgetedCategories = new Set(budgets.map((b) => b.category));
      const spentByCategory: Record<string, number> = {};
      for (const tx of transactions) {
        const normalizedCat = tx.category.trim().toLowerCase();
        if (budgetedCategories.has(normalizedCat)) {
          spentByCategory[normalizedCat] =
            (spentByCategory[normalizedCat] || 0) + Math.abs(tx.amount);
        }
      }
      for (const cat of Object.keys(spentByCategory)) {
        spentByCategory[cat] = Math.round(spentByCategory[cat] * 100) / 100;
      }

      const totalBudget = Math.round(budgets.reduce((sum, b) => sum + b.amount, 0) * 100) / 100;
      const totalSpent = Math.round(
        Object.values(spentByCategory).reduce((sum, v) => sum + v, 0) * 100
      ) / 100;

      return { budgets, spentByCategory, totalBudget, totalSpent };
    },
  });
}

export function useAddBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const period = budget.period ?? "monthly";
      const normalizedCategory = normalizeBudgetCategory(budget.category);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existingBudget, error: existingBudgetError } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("month", budget.month)
        .eq("period", period)
        .eq("category", normalizedCategory)
        .maybeSingle();

      if (existingBudgetError) throw new Error(existingBudgetError.message);
      if (existingBudget) {
        throw new Error("A budget already exists for this category and period");
      }

      const { data, error } = await supabase
        .from("budgets")
        .insert({ ...budget, category: normalizedCategory, period, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BudgetInsert> & { id: string }) => {
      const normalizedUpdates = {
        ...updates,
        ...(updates.category !== undefined
          ? { category: normalizeBudgetCategory(updates.category) }
          : {}),
      };

      const { data, error } = await supabase
        .from("budgets")
        .update(normalizedUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("budgets").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}
