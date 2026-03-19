import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchMonthlyObligations } from "./use-monthly-obligations";

export interface SavingsRateData {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  savingsRatePercent: number;
  lastMonthSavingsPercent?: number;
}

export function useSavingsRate() {
  return useQuery({
    queryKey: ["savings-rate"],
    queryFn: async (): Promise<SavingsRateData> => {
      const supabase = createClient();
      const now = new Date();

      // Current month range
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      // Last month range
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStart = lastMonthDate
        .toISOString()
        .split("T")[0];
      const lastMonthEnd = new Date(
        lastMonthDate.getFullYear(),
        lastMonthDate.getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const [currentTxResult, lastTxResult, currentObligations, lastObligations] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, category")
          .gte("date", currentMonthStart)
          .lte("date", currentMonthEnd),
        supabase
          .from("transactions")
          .select("amount, category")
          .gte("date", lastMonthStart)
          .lte("date", lastMonthEnd),
        fetchMonthlyObligations(currentMonthStart, currentMonthEnd),
        fetchMonthlyObligations(lastMonthStart, lastMonthEnd),
      ]);

      if (currentTxResult.error) throw new Error(currentTxResult.error.message);
      if (lastTxResult.error) throw new Error(lastTxResult.error.message);

      const currentTx = (currentTxResult.data || []).filter((t) => t.category !== "transfer");
      const lastTx = (lastTxResult.data || []).filter((t) => t.category !== "transfer");

      // Current month
      const monthlyIncome = currentTx
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const txExpenses = currentTx
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Add obligations not already captured in transactions
      // Paid contributions already show as transactions, so only add unpaid portion
      const monthlyExpenses = txExpenses + currentObligations.contributionsTotal - currentObligations.contributionsPaid;

      const monthlySavings = monthlyIncome - monthlyExpenses;
      const savingsRatePercent = monthlyIncome > 0
        ? Math.round((monthlySavings / monthlyIncome) * 100)
        : 0;

      // Last month for comparison
      const lastMonthIncome = lastTx
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const lastTxExpenses = lastTx
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const lastMonthExpenses = lastTxExpenses + lastObligations.contributionsTotal - lastObligations.contributionsPaid;

      const lastMonthSavings = lastMonthIncome - lastMonthExpenses;
      const lastMonthSavingsPercent = lastMonthIncome > 0
        ? Math.round((lastMonthSavings / lastMonthIncome) * 100)
        : undefined;

      return {
        monthlyIncome: Math.round(monthlyIncome * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        monthlySavings: Math.round(monthlySavings * 100) / 100,
        savingsRatePercent,
        lastMonthSavingsPercent,
      };
    },
  });
}
