import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SubScore {
  label: string;
  score: number;
  weight: number;
  detail: string;
}

export interface HealthScore {
  total: number;
  subScores: SubScore[];
}

export function useHealthScore() {
  return useQuery({
    queryKey: ["health-score"],
    queryFn: async (): Promise<HealthScore> => {
      const supabase = createClient();
      const now = new Date();

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const budgetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [txResult, budgetResult, accountResult, goalResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, date, category")
          .gte("date", currentMonthStart)
          .lte("date", currentMonthEnd),
        supabase.from("budgets").select("*").eq("month", budgetMonth),
        supabase.from("accounts").select("balance"),
        supabase.from("goals").select("current_amount, target_amount, is_completed"),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (budgetResult.error) throw new Error(budgetResult.error.message);

      const transactions = txResult.data;
      const budgets = budgetResult.data;
      const accounts = accountResult.data ?? [];
      const goals = goalResult.data ?? [];

      const accountsTotal = accounts.reduce(
        (sum, a) => sum + Number(a.balance),
        0
      );

      // Exclude transfers and goal funding from income/expense totals
      const nonTransferTx = transactions.filter(
        (t) => t.category !== "transfer" && t.category !== "goal_funding"
      );

      const income = nonTransferTx
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = nonTransferTx
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      // ----- 1. Savings Rate (40%) -----
      // 20% savings rate = perfect score (100), linear
      const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      const savingsRateScore = income > 0
        ? Math.min(100, Math.max(0, (savingsRate / 20) * 100))
        : 0;

      // ----- 2. Budget Adherence (20%) -----
      // % of budgets where spending is under the limit; default 50 if no budgets
      const spentByCategory: Record<string, number> = {};
      for (const tx of nonTransferTx) {
        if (tx.amount < 0) {
          const normalizedCat = tx.category.trim().toLowerCase();
          spentByCategory[normalizedCat] =
            (spentByCategory[normalizedCat] || 0) + Math.abs(tx.amount);
        }
      }

      let budgetAdherenceScore = 50; // default if no budgets
      let budgetAdherenceDetail = "No budgets set";
      if (budgets.length > 0) {
        const underBudget = budgets.filter(
          (b) => (spentByCategory[b.category] || 0) <= b.amount
        ).length;
        budgetAdherenceScore = Math.min(
          100,
          Math.max(0, (underBudget / budgets.length) * 100)
        );
        budgetAdherenceDetail = `${underBudget}/${budgets.length} under limit`;
      }

      // ----- 3. Goal Progress (20%) -----
      // Average progress across all active goals; 100% if all completed or no goals
      const activeGoals = goals.filter((g) => !g.is_completed);
      let goalProgressScore = 50; // default if no goals
      let goalProgressDetail = "No active goals";
      if (activeGoals.length > 0) {
        const avgProgress =
          activeGoals.reduce((sum, g) => {
            const pct = g.target_amount > 0
              ? Math.min(100, (g.current_amount / g.target_amount) * 100)
              : 0;
            return sum + pct;
          }, 0) / activeGoals.length;
        goalProgressScore = Math.min(100, Math.max(0, avgProgress));
        goalProgressDetail = `${avgProgress.toFixed(0)}% avg across ${activeGoals.length} goal${activeGoals.length > 1 ? "s" : ""}`;
      } else if (goals.length > 0 && activeGoals.length === 0) {
        // All goals completed
        goalProgressScore = 100;
        goalProgressDetail = "All goals completed";
      }

      // ----- 4. Emergency Fund (20%) -----
      // 3 months of expenses covered = perfect score (100)
      const monthlyExpenses = expenses > 0 ? expenses : 10000;
      const emergencyMonths = accountsTotal / monthlyExpenses;
      const emergencyFundScore = Math.min(
        100,
        Math.max(0, (emergencyMonths / 3) * 100)
      );

      const subScores: SubScore[] = [
        {
          label: "Savings Rate",
          score: Math.round(savingsRateScore),
          weight: 40,
          detail:
            income > 0
              ? `${savingsRate.toFixed(0)}% of income saved`
              : "No income this month",
        },
        {
          label: "Budget Adherence",
          score: Math.round(budgetAdherenceScore),
          weight: 20,
          detail: budgetAdherenceDetail,
        },
        {
          label: "Goal Progress",
          score: Math.round(goalProgressScore),
          weight: 20,
          detail: goalProgressDetail,
        },
        {
          label: "Emergency Fund",
          score: Math.round(emergencyFundScore),
          weight: 20,
          detail: `${emergencyMonths.toFixed(1)} of 3 months covered`,
        },
      ];

      const total = Math.round(
        subScores.reduce((sum, s) => sum + (s.score * s.weight) / 100, 0)
      );

      return { total, subScores };
    },
  });
}
