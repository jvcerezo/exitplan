import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

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
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<HealthScore> => {
      const now = new Date();

      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const budgetMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

      const [txResult, budgetResult, goalResult, accountResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("amount, date, category")
          .gte("date", currentMonthStart)
          .lte("date", currentMonthEnd),
        supabase.from("budgets").select("*").eq("month", budgetMonth),
        supabase.from("goals").select("*"),
        supabase.from("accounts").select("balance"),
      ]);

      if (txResult.error) throw new Error(txResult.error.message);
      if (budgetResult.error) throw new Error(budgetResult.error.message);
      if (goalResult.error) throw new Error(goalResult.error.message);

      const transactions = txResult.data;
      const budgets = budgetResult.data;
      const goals = goalResult.data;
      const accounts = accountResult.data ?? [];
      const accountsTotal = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

      // ----- Savings Rate (30%) -----
      const income = transactions
        .filter((t) => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);
      const expenses = transactions
        .filter((t) => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const savingsRate = income > 0 ? (income - expenses) / income : 0;
      const savingsScore = Math.min(100, Math.max(0, (savingsRate / 0.2) * 100));

      // ----- Budget Adherence (25%) -----
      const spentByCategory: Record<string, number> = {};
      for (const tx of transactions) {
        if (tx.amount < 0) {
          const normalizedCat = tx.category.trim().toLowerCase();
          spentByCategory[normalizedCat] =
            (spentByCategory[normalizedCat] || 0) + Math.abs(tx.amount);
        }
      }
      let budgetScore = 0;
      if (budgets.length > 0) {
        const underBudget = budgets.filter(
          (b: { category: string; amount: number }) =>
            (spentByCategory[b.category] || 0) <= b.amount
        ).length;
        budgetScore = (underBudget / budgets.length) * 100;
      }

      // ----- Goal Progress (25%) -----
      const activeGoals = goals.filter((g: { is_completed: boolean }) => !g.is_completed);
      let goalScore = 0;
      if (activeGoals.length > 0) {
        const totalProgress = activeGoals.reduce(
          (sum: number, g: { target_amount: number; current_amount: number }) => {
            const pct =
              g.target_amount > 0 ? Math.min(1, g.current_amount / g.target_amount) : 0;
            return sum + pct;
          },
          0
        );
        goalScore = (totalProgress / activeGoals.length) * 100;
      }

      // ----- Emergency Fund (20%) -----
      const emergencyGoal = goals.find(
        (g: { name: string; category: string }) =>
          g.name.toLowerCase().includes("emergency") ||
          g.category.toLowerCase().includes("emergency")
      );
      const monthlyExpenses = expenses > 0 ? expenses : 10000;
      const targetEmergency = monthlyExpenses * 3;
      const cushionAmount = emergencyGoal
        ? (emergencyGoal as { current_amount: number }).current_amount
        : accountsTotal;
      let emergencyScore = 0;
      if (cushionAmount > 0) {
        emergencyScore = Math.min(100, (cushionAmount / targetEmergency) * 100);
      }

      const subScores: SubScore[] = [
        {
          label: "Savings Rate",
          score: Math.round(savingsScore),
          weight: 30,
          detail:
            income > 0
              ? `${(savingsRate * 100).toFixed(0)}% of income saved`
              : "No income this month",
        },
        {
          label: "Budget Adherence",
          score: Math.round(budgetScore),
          weight: 25,
          detail:
            budgets.length > 0
              ? `${budgets.filter((b: { category: string; amount: number }) => (spentByCategory[b.category] || 0) <= b.amount).length}/${budgets.length} under budget`
              : "No budgets set",
        },
        {
          label: "Goal Progress",
          score: Math.round(goalScore),
          weight: 25,
          detail:
            activeGoals.length > 0
              ? `${activeGoals.length} active goal${activeGoals.length > 1 ? "s" : ""}`
              : "No active goals",
        },
        {
          label: "Emergency Fund",
          score: Math.round(emergencyScore),
          weight: 20,
          detail: emergencyGoal
            ? `₱${(emergencyGoal as { current_amount: number }).current_amount.toLocaleString()} saved`
            : accountsTotal > 0
              ? `₱${Math.round(accountsTotal).toLocaleString()} in accounts`
              : "No emergency fund goal",
        },
      ];

      const total = Math.round(
        subScores.reduce((sum, s) => sum + (s.score * s.weight) / 100, 0)
      );

      return { total, subScores };
    },
  });
}
