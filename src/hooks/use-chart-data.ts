import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface SpendingByCategory {
  category: string;
  amount: number;
}

interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
}

export function useSpendingByCategory() {
  return useQuery({
    queryKey: ["transactions", "spending-by-category"],
    queryFn: async (): Promise<SpendingByCategory[]> => {
      const supabase = createClient();

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("category, amount")
        .lt("amount", 0)
        .gte("date", startOfMonth)
        .lte("date", endOfMonth);

      if (error) throw new Error(error.message);

      const categoryMap: Record<string, number> = {};
      for (const tx of data) {
        const cat = tx.category;
        categoryMap[cat] = (categoryMap[cat] || 0) + Math.abs(tx.amount);
      }

      return Object.entries(categoryMap)
        .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
        .sort((a, b) => b.amount - a.amount);
    },
  });
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface NetWorthPoint {
  month: string;
  balance: number;
}

export function useNetWorthOverTime() {
  return useQuery({
    queryKey: ["transactions", "net-worth"],
    queryFn: async (): Promise<NetWorthPoint[]> => {
      const supabase = createClient();
      const now = new Date();
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      const startDate = twelveMonthsAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, date")
        .order("date", { ascending: true });

      if (error) throw new Error(error.message);

      // Compute balance before the 12-month window
      let runningTotal = 0;
      for (const tx of data) {
        if (tx.date < startDate) {
          runningTotal += tx.amount;
        }
      }

      // Initialize 12 months
      const monthKeys: string[] = [];
      const monthContributions: Record<string, number> = {};
      for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthKeys.push(key);
        monthContributions[key] = 0;
      }

      // Sum contributions within window
      for (const tx of data) {
        if (tx.date >= startDate) {
          const [year, month] = tx.date.split("-");
          const key = `${year}-${month}`;
          if (monthContributions[key] !== undefined) {
            monthContributions[key] += tx.amount;
          }
        }
      }

      // Build cumulative points
      const points: NetWorthPoint[] = [];
      for (const key of monthKeys) {
        runningTotal += monthContributions[key] || 0;
        const [yearStr, monthStr] = key.split("-");
        const monthIndex = parseInt(monthStr, 10) - 1;
        const year = parseInt(yearStr, 10);
        const label =
          year !== now.getFullYear()
            ? `${MONTH_NAMES[monthIndex]} '${String(year).slice(2)}`
            : MONTH_NAMES[monthIndex];
        points.push({
          month: label,
          balance: Math.round(runningTotal * 100) / 100,
        });
      }

      return points;
    },
  });
}

interface SpendingComparison {
  category: string;
  currentMonth: number;
  previousMonth: number;
  changePercent: number;
}

export function useSpendingComparison() {
  return useQuery({
    queryKey: ["transactions", "spending-comparison"],
    queryFn: async (): Promise<SpendingComparison[]> => {
      const supabase = createClient();
      const now = new Date();

      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString().split("T")[0];
      const currentEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString().split("T")[0];
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString().split("T")[0];
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString().split("T")[0];

      const [currentResult, prevResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("category, amount")
          .lt("amount", 0)
          .gte("date", currentStart)
          .lte("date", currentEnd),
        supabase
          .from("transactions")
          .select("category, amount")
          .lt("amount", 0)
          .gte("date", prevStart)
          .lte("date", prevEnd),
      ]);

      if (currentResult.error) throw new Error(currentResult.error.message);
      if (prevResult.error) throw new Error(prevResult.error.message);

      const currentMap: Record<string, number> = {};
      const prevMap: Record<string, number> = {};

      for (const tx of currentResult.data) {
        currentMap[tx.category] = (currentMap[tx.category] || 0) + Math.abs(tx.amount);
      }
      for (const tx of prevResult.data) {
        prevMap[tx.category] = (prevMap[tx.category] || 0) + Math.abs(tx.amount);
      }

      const allCategories = new Set([...Object.keys(currentMap), ...Object.keys(prevMap)]);

      return Array.from(allCategories)
        .map((category) => {
          const current = Math.round((currentMap[category] || 0) * 100) / 100;
          const previous = Math.round((prevMap[category] || 0) * 100) / 100;
          const changePercent = previous > 0
            ? Math.round(((current - previous) / previous) * 100)
            : current > 0 ? 100 : 0;
          return { category, currentMonth: current, previousMonth: previous, changePercent };
        })
        .sort((a, b) => (b.currentMonth + b.previousMonth) - (a.currentMonth + a.previousMonth));
    },
  });
}

export function useMonthlyTrend() {
  return useQuery({
    queryKey: ["transactions", "monthly-trend"],
    queryFn: async (): Promise<MonthlyTrend[]> => {
      const supabase = createClient();

      const now = new Date();
      const sixMonthsAgo = new Date(
        now.getFullYear(),
        now.getMonth() - 5,
        1
      );
      const startDate = sixMonthsAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("transactions")
        .select("amount, date")
        .gte("date", startDate);

      if (error) throw new Error(error.message);

      const monthMap: Record<string, { income: number; expenses: number }> = {};

      // Initialize all 6 months so we always have entries
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap[key] = { income: 0, expenses: 0 };
      }

      for (const tx of data) {
        const [year, month] = tx.date.split("-");
        const key = `${year}-${month}`;
        if (monthMap[key]) {
          if (tx.amount > 0) {
            monthMap[key].income += tx.amount;
          } else {
            monthMap[key].expenses += Math.abs(tx.amount);
          }
        }
      }

      return Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, values]) => {
          const [yearStr, monthStr] = key.split("-");
          const monthIndex = parseInt(monthStr, 10) - 1;
          const year = parseInt(yearStr, 10);
          const currentYear = now.getFullYear();
          const label = year !== currentYear
            ? `${MONTH_NAMES[monthIndex]} '${String(year).slice(2)}`
            : MONTH_NAMES[monthIndex];
          return {
            month: label,
            income: Math.round(values.income * 100) / 100,
            expenses: Math.round(values.expenses * 100) / 100,
          };
        });
    },
  });
}
