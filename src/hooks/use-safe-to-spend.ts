import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SafeToSpendData {
  safeToSpend: number;
  monthlyIncome: number;
  budgetAllocated: number;
  goalContributions: number;
  alreadySpent: number;
  // Breakdown
  totalExpenses: number;
  remainingBudget: number;
}

export function useSafeToSpend() {
  return useQuery({
    queryKey: ["safe-to-spend"],
    staleTime: 10 * 60 * 1000,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    queryFn: async (): Promise<SafeToSpendData> => {
      const supabase = createClient();
      const now = new Date();

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];
      const budgetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [txResult, budgetResult, goalFundingResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount")
          .gte("date", monthStart)
          .lte("date", monthEnd),
        supabase
          .from("budgets")
          .select("amount")
          .eq("month", budgetMonth),
        supabase
          .from("goal_fundings")
          .select("amount")
          .gte("funding_date", monthStart)
          .lte("funding_date", monthEnd),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (budgetResult.error) throw new Error(budgetResult.error.message);
      if (goalFundingResult.error) throw new Error(goalFundingResult.error.message);

      const transactions = txResult.data ?? [];
      const budgets = budgetResult.data ?? [];
      const goalFundings = goalFundingResult.data ?? [];

      // Income this month
      const monthlyIncome = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      // Actual expenses already spent this month (absolute)
      const alreadySpent = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Total budget allocated this month (the limit they set)
      const budgetAllocated = budgets.reduce((sum, b) => sum + Number(b.amount), 0);

      // Actual goal contributions this month from the funding ledger.
      const goalContributions = goalFundings.reduce(
        (sum, funding) => sum + Number(funding.amount),
        0
      );

      // Remaining budget after what's already spent
      const remainingBudget = Math.max(0, budgetAllocated - alreadySpent);

      // Safe to spend = income - budget limits - this month's goal contributions.
      const safeToSpend = Math.max(
        0,
        Math.round(
          (monthlyIncome - budgetAllocated - goalContributions) * 100
        ) / 100
      );

      return {
        safeToSpend: Math.round(safeToSpend * 100) / 100,
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        budgetAllocated: Math.round(budgetAllocated * 100) / 100,
        goalContributions: Math.round(goalContributions * 100) / 100,
        alreadySpent: Math.round(alreadySpent * 100) / 100,
        totalExpenses: Math.round(alreadySpent * 100) / 100,
        remainingBudget: Math.round(remainingBudget * 100) / 100,
      };
    },
  });
}
