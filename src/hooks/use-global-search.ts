import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface SearchResult {
  id: string;
  type: "transaction" | "goal" | "budget";
  title: string;
  subtitle: string;
  href: string;
}

export function useGlobalSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length < 2) return [];

      const supabase = createClient();
      const search = query.slice(0, 200);

      const [txResult, goalResult, budgetResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, description, category, amount, date")
          .ilike("description", `%${search}%`)
          .order("date", { ascending: false })
          .limit(5),
        supabase
          .from("goals")
          .select("id, name, target_amount, current_amount")
          .ilike("name", `%${search}%`)
          .limit(5),
        supabase
          .from("budgets")
          .select("id, category, amount, month")
          .ilike("category", `%${search}%`)
          .limit(5),
      ]);

      const results: SearchResult[] = [];

      if (txResult.data) {
        for (const tx of txResult.data) {
          results.push({
            id: tx.id,
            type: "transaction",
            title: tx.description,
            subtitle: `${tx.category} · ${tx.date}`,
            href: "/transactions",
          });
        }
      }

      if (goalResult.data) {
        for (const g of goalResult.data) {
          results.push({
            id: g.id,
            type: "goal",
            title: g.name,
            subtitle: `₱${g.current_amount.toLocaleString()} of ₱${g.target_amount.toLocaleString()}`,
            href: "/goals",
          });
        }
      }

      if (budgetResult.data) {
        for (const b of budgetResult.data) {
          results.push({
            id: b.id,
            type: "budget",
            title: b.category,
            subtitle: `₱${b.amount.toLocaleString()} · ${b.month}`,
            href: "/budgets",
          });
        }
      }

      return results;
    },
    enabled: query.length >= 2,
  });
}
