import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface EmergencyFundData {
  currentAmount: number;
  monthlyExpenses: number;
  targetMonths: number;
  targetAmount: number;
  monthsCovered: number;
  progressPercent: number;
  hasGoal: boolean;
  goalName: string | null;
  goalTargetAmount: number | null;
}

export function useEmergencyFund(targetMonths: number = 3) {
  return useQuery({
    queryKey: ["emergency-fund", targetMonths],
    queryFn: async (): Promise<EmergencyFundData> => {
      const supabase = createClient();

      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const [txResult, accountResult, goalResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount")
          .gte("date", currentMonthStart)
          .lte("date", currentMonthEnd)
          .lt("amount", 0),
        supabase
          .from("accounts")
          .select("balance"),
        supabase
          .from("goals")
          .select("name, category, current_amount, target_amount, is_completed, created_at")
          .eq("is_completed", false)
          .order("created_at", { ascending: false }),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (accountResult.error) throw new Error(accountResult.error.message);
      if (goalResult.error) throw new Error(goalResult.error.message);

      const monthlyExpenses = (txResult.data || []).reduce(
        (sum, t) => sum + Math.abs(t.amount),
        0
      );

      const activeGoals = goalResult.data ?? [];
      const goal = activeGoals.find((goal) => {
        const category = String(goal.category ?? "").toLowerCase();
        const name = String(goal.name ?? "").toLowerCase();
        return category.includes("emergency") || name.includes("emergency");
      }) ?? null;

      let currentAmount: number;
      let targetAmount: number;
      const hasGoal = !!goal;
      const goalName = goal?.name ?? null;
      const goalTargetAmount = goal ? Number(goal.target_amount) : null;

      if (goal) {
        // Use the goal's saved amount and target as source of truth
        currentAmount = Number(goal.current_amount);
        targetAmount = Number(goal.target_amount);
      } else {
        // Fall back to total account balances vs expense-based target
        currentAmount = (accountResult.data || []).reduce(
          (sum, a) => sum + Number(a.balance),
          0
        );
        targetAmount = monthlyExpenses * targetMonths;
      }

      const monthsCovered =
        monthlyExpenses > 0
          ? Math.round((currentAmount / monthlyExpenses) * 10) / 10
          : 0;

      const progressPercent =
        targetAmount > 0
          ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
          : 0;

      return {
        currentAmount: Math.round(currentAmount * 100) / 100,
        monthlyExpenses: Math.round(monthlyExpenses * 100) / 100,
        targetMonths,
        targetAmount: Math.round(targetAmount * 100) / 100,
        monthsCovered,
        progressPercent,
        hasGoal,
        goalName,
        goalTargetAmount: goalTargetAmount !== null ? Math.round(goalTargetAmount * 100) / 100 : null,
      };
    },
  });
}
