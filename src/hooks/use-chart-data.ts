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
