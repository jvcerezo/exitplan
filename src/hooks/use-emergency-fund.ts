import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface EmergencyFundData {
  currentAmount: number;
  monthlyExpenses: number;
  targetMonths: number; // 3, 4, 5, or 6
  targetAmount: number;
  monthsCovered: number;
  progressPercent: number;
}

export function useEmergencyFund(targetMonths: number = 3) {
  return useQuery({
    queryKey: ["emergency-fund", targetMonths],
    queryFn: async (): Promise<EmergencyFundData> => {
      const supabase = createClient();

      // Get current month's expenses
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      // Fetch transactions for current month to calculate average monthly expenses
      const { data: currentTx, error: txError } = await supabase
        .from("transactions")
        .select("amount")
        .gte("date", currentMonthStart)
        .lte("date", currentMonthEnd)
        .lt("amount", 0); // only expenses

      if (txError) throw new Error(txError.message);

      // Get total non-archived account balances
      const { data: accounts, error: accountError } = await supabase
        .from("accounts")
        .select("balance")
        .eq("is_archived", false);

      if (accountError) throw new Error(accountError.message);

      const monthlyExpenses = (currentTx || []).reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );

      const currentAmount = (accounts || []).reduce(
        (sum, a) => sum + Number(a.balance),
        0
      );

      const targetAmount = monthlyExpenses * targetMonths;
      const monthsCovered = monthlyExpenses > 0 
        ? Math.round((currentAmount / monthlyExpenses) * 10) / 10 
        : 0;
      const progressPercent = targetAmount > 0 
        ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
        : 0;

      return {
        currentAmount: Math.round(currentAmount * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        targetMonths,
        targetAmount: Math.round(targetAmount * 100) / 100,
        monthsCovered,
        progressPercent,
      };
    },
  });
}
