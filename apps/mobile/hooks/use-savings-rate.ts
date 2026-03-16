import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<SavingsRateData> => {
      const now = new Date();

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthStart = lastMonthDate.toISOString().split("T")[0];
      const lastMonthEnd = new Date(
        lastMonthDate.getFullYear(),
        lastMonthDate.getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const { data: currentTx, error: currentError } = await supabase
        .from("transactions")
        .select("amount")
        .gte("date", currentMonthStart)
        .lte("date", currentMonthEnd);

      if (currentError) throw new Error(currentError.message);

      const { data: lastTx, error: lastError } = await supabase
        .from("transactions")
        .select("amount")
        .gte("date", lastMonthStart)
        .lte("date", lastMonthEnd);

      if (lastError) throw new Error(lastError.message);

      const monthlyIncome = (currentTx || [])
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = (currentTx || [])
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const monthlySavings = monthlyIncome - monthlyExpenses;
      const savingsRatePercent =
        monthlyIncome > 0
          ? Math.round((monthlySavings / monthlyIncome) * 100)
          : 0;

      const lastMonthIncome = (lastTx || [])
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

      const lastMonthExpenses = (lastTx || [])
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const lastMonthSavings = lastMonthIncome - lastMonthExpenses;
      const lastMonthSavingsPercent =
        lastMonthIncome > 0
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
