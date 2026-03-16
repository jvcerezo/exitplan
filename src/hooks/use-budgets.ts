import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import {
  addOfflineBudgetToCache,
  removeOfflineBudgetFromCache,
  updateOfflineBudgetInCache,
} from "@/lib/offline/query-cache";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";
import type { Budget, BudgetInsert, BudgetPeriod } from "@/lib/types/database";

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeBudgetMonthByPeriod(month: string, period: BudgetPeriod): string {
  const [yearRaw, monthRaw, dayRaw] = month.split("-").map(Number);
  const year = Number.isFinite(yearRaw) ? yearRaw : new Date().getFullYear();
  const monthIndex = Number.isFinite(monthRaw) ? monthRaw - 1 : 0;
  const day = Number.isFinite(dayRaw) ? dayRaw : 1;

  if (period === "monthly") {
    return `${year}-${String(monthIndex + 1).padStart(2, "0")}-01`;
  }

  if (period === "quarterly") {
    const quarterStartMonth = Math.floor(monthIndex / 3) * 3 + 1;
    return `${year}-${String(quarterStartMonth).padStart(2, "0")}-01`;
  }

  const date = new Date(year, monthIndex, day);
  date.setDate(date.getDate() - date.getDay());
  return formatDateLocal(date);
}

function normalizeBudgetCategory(category: string): string {
  return category.trim().toLowerCase();
}

export function useBudgets(month: string, period: BudgetPeriod = "monthly") {
  return useQuery({
    queryKey: ["budgets", month, period],
    queryFn: async (): Promise<Budget[]> => {
      const supabase = createClient();
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
      const supabase = createClient();

      // Compute date range for the selected period
      function getPeriodRange(startStr: string, p: BudgetPeriod): { start: string; end: string } {
        const d = new Date(startStr);
        if (p === "weekly") {
          const end = new Date(d);
          end.setDate(end.getDate() + 6);
          return {
            start: d.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
          };
        }
        if (p === "quarterly") {
          const end = new Date(d.getFullYear(), d.getMonth() + 3, 0);
          return {
            start: d.toISOString().split("T")[0],
            end: end.toISOString().split("T")[0],
          };
        }
        // monthly default
        const [year, monthNum] = startStr.split("-").map(Number);
        return {
          start: startStr,
          end: new Date(year, monthNum, 0).toISOString().split("T")[0],
        };
      }

      function getPrevPeriodStart(startStr: string, p: BudgetPeriod): string {
        const d = new Date(startStr);
        if (p === "weekly") {
          d.setDate(d.getDate() - 7);
          return d.toISOString().split("T")[0];
        }
        if (p === "quarterly") {
          return new Date(d.getFullYear(), d.getMonth() - 3, 1).toISOString().split("T")[0];
        }
        const [year, monthNum] = startStr.split("-").map(Number);
        const prevDate = new Date(year, monthNum - 2, 1);
        return `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-01`;
      }

      const { start: startDate, end: endDate } = getPeriodRange(month, period);
      const prevStart = getPrevPeriodStart(month, period);
      const { end: prevEnd } = getPeriodRange(prevStart, period);

      const [budgetsResult, txResult, prevBudgetsResult, prevTxResult] = await Promise.all([
        supabase.from("budgets").select("*").eq("month", month).eq("period", period),
        supabase
          .from("transactions")
          .select("amount, category, description")
          .gte("date", startDate)
          .lte("date", endDate)
          .lt("amount", 0),
        supabase.from("budgets").select("*").eq("month", prevStart).eq("period", period),
        supabase
          .from("transactions")
          .select("amount, category")
          .gte("date", prevStart)
          .lte("date", prevEnd)
          .lt("amount", 0),
      ]);

      if (budgetsResult.error) throw new Error(budgetsResult.error.message);
      if (txResult.error) throw new Error(txResult.error.message);

      const budgets: Budget[] = budgetsResult.data ?? [];
      const transactions = txResult.data ?? [];
      const prevBudgets: Budget[] = prevBudgetsResult.data ?? [];
      const prevTransactions = prevTxResult.data ?? [];

      // Compute spent per category this month (only for budgeted categories)
      // Budgets are stored lowercase; normalize tx.category for case-insensitive matching
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

      // Compute previous month spent per category (for rollover)
      const prevSpentByCategory: Record<string, number> = {};
      for (const tx of prevTransactions) {
        const normalizedCat = tx.category.trim().toLowerCase();
        prevSpentByCategory[normalizedCat] =
          (prevSpentByCategory[normalizedCat] || 0) + Math.abs(tx.amount);
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
        transactions, // add raw transactions for UI use
      };
    },
  });
}

export function useAddBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (budget: BudgetInsert) => {
      const period = budget.period ?? "monthly";
      const normalizedMonth = normalizeBudgetMonthByPeriod(budget.month, period);
      const normalizedCategory = normalizeBudgetCategory(budget.category);

      if (isBrowserOffline()) {
        const cachedBudgets = queryClient
          .getQueriesData<Budget[]>({ queryKey: ["budgets"] })
          .flatMap(([, value]) => value ?? []);

        const alreadyExistsOffline = cachedBudgets.some(
          (entry) =>
            normalizeBudgetCategory(entry.category) === normalizedCategory &&
            entry.month === normalizedMonth &&
            entry.period === period
        );

        if (alreadyExistsOffline) {
          throw new Error("A budget already exists for this category and period");
        }

        const localId = createOfflineId("budget");
        const offlineBudget: Budget = {
          id: localId,
          created_at: new Date().toISOString(),
          user_id: "offline",
          category: normalizedCategory,
          amount: budget.amount,
          month: normalizedMonth,
          period,
          rollover: budget.rollover ?? false,
        };

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "addBudget",
          payload: {
            localId,
            category: normalizedCategory,
            amount: budget.amount,
            month: normalizedMonth,
            period,
            rollover: budget.rollover ?? false,
          },
        });

        addOfflineBudgetToCache(queryClient, offlineBudget);
        return offlineBudget;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existingBudget, error: existingBudgetError } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", user.id)
        .eq("month", normalizedMonth)
        .eq("period", period)
        .eq("category", normalizedCategory)
        .maybeSingle();

      if (existingBudgetError) throw new Error(existingBudgetError.message);
      if (existingBudget) {
        throw new Error("A budget already exists for this category and period");
      }

      const { data, error } = await supabase
        .from("budgets")
        .insert({
          ...budget,
          category: normalizedCategory,
          month: normalizedMonth,
          period,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success(isBrowserOffline() ? "Budget saved offline" : "Budget added");
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
      if (isBrowserOffline()) {
        const cachedBudgets = queryClient
          .getQueriesData<Budget[]>({ queryKey: ["budgets"] })
          .flatMap(([, value]) => value ?? []);

        const currentBudget = cachedBudgets.find((entry) => entry.id === id);

        const nextPeriod = updates.period ?? currentBudget?.period ?? "monthly";
        const nextMonth = normalizeBudgetMonthByPeriod(
          updates.month ?? currentBudget?.month ?? formatDateLocal(new Date()),
          nextPeriod
        );
        const nextCategory = normalizeBudgetCategory(
          updates.category ?? currentBudget?.category ?? ""
        );

        const duplicateOffline = cachedBudgets.some(
          (entry) =>
            entry.id !== id &&
            normalizeBudgetCategory(entry.category) === nextCategory &&
            entry.month === nextMonth &&
            entry.period === nextPeriod
        );

        if (duplicateOffline) {
          throw new Error("A budget already exists for this category and period");
        }

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "updateBudget",
          payload: {
            id,
            ...updates,
            ...(updates.category !== undefined
              ? { category: normalizeBudgetCategory(updates.category) }
              : {}),
            ...(updates.month !== undefined || updates.period !== undefined
              ? { month: nextMonth, period: nextPeriod }
              : {}),
          },
        });

        const normalizedUpdates: Partial<Budget> = {
          ...updates,
          ...(updates.category !== undefined
            ? { category: normalizeBudgetCategory(updates.category) }
            : {}),
          ...(updates.month !== undefined || updates.period !== undefined
            ? { month: nextMonth, period: nextPeriod }
            : {}),
        };

        updateOfflineBudgetInCache(queryClient, id, normalizedUpdates);
        return { id, ...normalizedUpdates };
      }

      const supabase = createClient();
      const { data: currentBudget, error: currentBudgetError } = await supabase
        .from("budgets")
        .select("id, user_id, category, month, period")
        .eq("id", id)
        .single();

      if (currentBudgetError) throw new Error(currentBudgetError.message);

      const nextPeriod = updates.period ?? currentBudget.period;
      const nextMonth = normalizeBudgetMonthByPeriod(
        updates.month ?? currentBudget.month,
        nextPeriod
      );
      const nextCategory = normalizeBudgetCategory(
        updates.category ?? currentBudget.category
      );

      const { data: duplicateBudget, error: duplicateBudgetError } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", currentBudget.user_id)
        .eq("month", nextMonth)
        .eq("period", nextPeriod)
        .eq("category", nextCategory)
        .neq("id", id)
        .maybeSingle();

      if (duplicateBudgetError) throw new Error(duplicateBudgetError.message);
      if (duplicateBudget) {
        throw new Error("A budget already exists for this category and period");
      }

      const normalizedUpdates = {
        ...updates,
        ...(updates.category !== undefined ? { category: nextCategory } : {}),
        ...(updates.month !== undefined || updates.period !== undefined
          ? { month: nextMonth, period: nextPeriod }
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
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(isBrowserOffline() ? "Budget update saved offline" : "Budget updated");
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
      if (isBrowserOffline()) {
        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "updateBudget",
          payload: { id, rollover },
        });

        updateOfflineBudgetInCache(queryClient, id, { rollover });
        return { id, rollover };
      }

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
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(
        isBrowserOffline()
          ? rollover
            ? "Rollover enable saved offline"
            : "Rollover disable saved offline"
          : rollover
            ? "Rollover enabled"
            : "Rollover disabled"
      );
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
      period = "monthly",
    }: {
      sourceMonth: string;
      targetMonth: string;
      period?: BudgetPeriod;
    }) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch source budgets
      const { data: sourceBudgets, error: fetchError } = await supabase
        .from("budgets")
        .select("category, amount, period")
        .eq("month", sourceMonth)
        .eq("period", period)
        .eq("user_id", user.id);

      if (fetchError) throw new Error(fetchError.message);
      if (!sourceBudgets || sourceBudgets.length === 0) {
        throw new Error("No budgets found in the previous period");
      }

      // Check what already exists in target month
      const { data: existingBudgets } = await supabase
        .from("budgets")
        .select("category")
        .eq("month", targetMonth)
        .eq("period", period)
        .eq("user_id", user.id);

      const existingCategories = new Set(
        (existingBudgets || []).map((b: { category: string }) => b.category)
      );

      // Only copy categories that don't already exist
      const newBudgets = sourceBudgets
        .filter((b: { category: string }) => !existingCategories.has(b.category))
        .map((b: { category: string; amount: number; period: string }) => ({
          category: b.category,
          amount: b.amount,
          month: targetMonth,
          period,
          user_id: user.id,
        }));

      if (newBudgets.length === 0) {
        throw new Error("All categories already have budgets this period");
      }

      const { error: insertError } = await supabase
        .from("budgets")
        .insert(newBudgets);

      if (insertError) throw new Error(insertError.message);
      return newBudgets.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
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
      if (isBrowserOffline()) {
        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "deleteBudget",
          payload: { id },
        });
        removeOfflineBudgetFromCache(queryClient, id);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["budgets"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(isBrowserOffline() ? "Budget delete saved offline" : "Budget deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete budget", { description: error.message });
    },
  });
}
