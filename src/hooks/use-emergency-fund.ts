import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { fetchMonthlyObligations } from "./use-monthly-obligations";

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

      const [txResult, accountResult, goalResult, obligations] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, category")
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
        fetchMonthlyObligations(currentMonthStart, currentMonthEnd),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (accountResult.error) throw new Error(accountResult.error.message);
      if (goalResult.error) throw new Error(goalResult.error.message);

      // Transaction-based expenses (excluding transfers)
      const txExpenses = (txResult.data || [])
        .filter((t) => t.category !== "transfer")
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // Total monthly expenses = transactions + unpaid contributions
      const monthlyExpenses = txExpenses + obligations.contributionsTotal - obligations.contributionsPaid;

      // For the emergency fund target, use the full obligation picture
      // (what you'd need to cover each month if income stopped)
      const fullMonthlyBurn = txExpenses + obligations.total - obligations.contributionsPaid;

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
        currentAmount = Number(goal.current_amount);
        targetAmount = Number(goal.target_amount);
      } else {
        currentAmount = (accountResult.data || []).reduce(
          (sum, a) => sum + Number(a.balance),
          0
        );
        targetAmount = fullMonthlyBurn * targetMonths;
      }

      const monthsCovered =
        fullMonthlyBurn > 0
          ? Math.round((currentAmount / fullMonthlyBurn) * 10) / 10
          : 0;

      const progressPercent =
        targetAmount > 0
          ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
          : 0;

      return {
        currentAmount: Math.round(currentAmount * 100) / 100,
        monthlyExpenses: Math.round(fullMonthlyBurn * 100) / 100,
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
