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

      const startDate = month;
      const [year, monthNum] = month.split("-").map(Number);
      const endDate = new Date(year, monthNum, 0).toISOString().split("T")[0];

      // Previous month range for rollover computation
      const prevDate = new Date(year, monthNum - 2, 1);
      const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-01`;
      const prevMonthEnd = new Date(year, monthNum - 1, 0).toISOString().split("T")[0];

      const [budgetsResult, txResult, prevBudgetsResult, prevTxResult] = await Promise.all([
        supabase.from("budgets").select("*").eq("month", month),
        supabase
          .from("transactions")
          .select("amount, category")
          .gte("date", startDate)
          .lte("date", endDate)
          .lt("amount", 0),
        supabase.from("budgets").select("*").eq("month", prevMonth),
        supabase
          .from("transactions")
          .select("amount, category")
          .gte("date", prevMonth)
          .lte("date", prevMonthEnd)
          .lt("amount", 0),
      ]);

      if (budgetsResult.error) throw new Error(budgetsResult.error.message);
      if (txResult.error) throw new Error(txResult.error.message);

      const budgets: Budget[] = budgetsResult.data ?? [];
      const transactions = txResult.data ?? [];
      const prevBudgets: Budget[] = prevBudgetsResult.data ?? [];
      const prevTransactions = prevTxResult.data ?? [];

      // Compute spent per category this month
      const spentByCategory: Record<string, number> = {};
      for (const tx of transactions) {
        spentByCategory[tx.category] =
          (spentByCategory[tx.category] || 0) + Math.abs(tx.amount);
      }
      for (const cat of Object.keys(spentByCategory)) {
        spentByCategory[cat] = Math.round(spentByCategory[cat] * 100) / 100;
      }

      // Compute previous month spent per category (for rollover)
      const prevSpentByCategory: Record<string, number> = {};
      for (const tx of prevTransactions) {
        prevSpentByCategory[tx.category] =
          (prevSpentByCategory[tx.category] || 0) + Math.abs(tx.amount);
      }

      // Compute rollover amounts: for each current budget with rollover=true,
      // find the matching previous month budget and calculate unspent carry-forward
      const rolloverByCategory: Record<string, number> = {};
      for (const budget of budgets) {
        if (!budget.rollover) continue;
        const prevBudget = prevBudgets.find((b) => b.category === budget.category);
        if (!prevBudget) continue;
        const prevSpent = prevSpentByCategory[budget.category] ?? 0;
        const prevUnspent = prevBudget.amount - prevSpent;
        if (prevUnspent > 0) {
          rolloverByCategory[budget.category] = Math.round(prevUnspent * 100) / 100;
        }
      }

      const totalBudget = Math.round(
        budgets.reduce((sum: number, b: Budget) => sum + b.amount, 0) * 100
      ) / 100;
      const totalRollover = Math.round(
        Object.values(rolloverByCategory).reduce((s, v) => s + v, 0) * 100
      ) / 100;
      const totalSpent = Math.round(
        Object.values(spentByCategory).reduce((sum, v) => sum + v, 0) * 100
      ) / 100;

      return {
        budgets,
        spentByCategory,
        rolloverByCategory,
        totalBudget,
        totalRollover,
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
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("budgets")
        .insert({ ...budget, user_id: user.id })
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

export function useToggleBudgetRollover() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, rollover }: { id: string; rollover: boolean }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("budgets")
        .update({ rollover })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (_, { rollover }) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success(rollover ? "Rollover enabled" : "Rollover disabled");
    },
    onError: (error) => {
      toast.error("Failed to update rollover", { description: error.message });
    },
  });
}

export function useCopyBudgetsFromMonth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceMonth,
      targetMonth,
    }: {
      sourceMonth: string;
      targetMonth: string;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch source budgets
      const { data: sourceBudgets, error: fetchError } = await supabase
        .from("budgets")
        .select("category, amount")
        .eq("month", sourceMonth)
        .eq("user_id", user.id);

      if (fetchError) throw new Error(fetchError.message);
      if (!sourceBudgets || sourceBudgets.length === 0) {
        throw new Error("No budgets found in the previous month");
      }

      // Check what already exists in target month
      const { data: existingBudgets } = await supabase
        .from("budgets")
        .select("category")
        .eq("month", targetMonth)
        .eq("user_id", user.id);

      const existingCategories = new Set(
        (existingBudgets || []).map((b: { category: string }) => b.category)
      );

      // Only copy categories that don't already exist
      const newBudgets = sourceBudgets
        .filter((b: { category: string }) => !existingCategories.has(b.category))
        .map((b: { category: string; amount: number }) => ({
          category: b.category,
          amount: b.amount,
          month: targetMonth,
          user_id: user.id,
        }));

      if (newBudgets.length === 0) {
        throw new Error("All categories already have budgets this month");
      }

      const { error: insertError } = await supabase
        .from("budgets")
        .insert(newBudgets);

      if (insertError) throw new Error(insertError.message);
      return newBudgets.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      toast.success(`Copied ${count} budget${count > 1 ? "s" : ""} from last month`);
    },
    onError: (error) => {
      toast.error("Failed to copy budgets", { description: error.message });
    },
  });
}

export function useBudgetRecommendations() {
  return useQuery({
    queryKey: ["budgets", "recommendations"],
    queryFn: async () => {
      const supabase = createClient();
      const now = new Date();

      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        .toISOString().split("T")[0];
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("category, amount, date")
        .lt("amount", 0)
        .gte("date", threeMonthsAgo)
        .lte("date", lastMonthEnd);

      if (error) throw new Error(error.message);

      const categoryByMonth: Record<string, Record<string, number>> = {};
      for (const tx of data) {
        const [year, month] = tx.date.split("-");
        const monthKey = `${year}-${month}`;
        if (!categoryByMonth[tx.category]) categoryByMonth[tx.category] = {};
        categoryByMonth[tx.category][monthKey] =
          (categoryByMonth[tx.category][monthKey] || 0) + Math.abs(tx.amount);
      }

      const recommendations: { category: string; average: number; suggested: number }[] = [];
      for (const [category, months] of Object.entries(categoryByMonth)) {
        const values = Object.values(months);
        const avg = values.reduce((a, b) => a + b, 0) / Math.max(values.length, 1);
        const suggested = Math.ceil(avg * 1.1);
        recommendations.push({
          category,
          average: Math.round(avg * 100) / 100,
          suggested: Math.round(suggested * 100) / 100,
        });
      }

      return recommendations.sort((a, b) => b.suggested - a.suggested);
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
