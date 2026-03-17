"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Prefetches ALL user data into React Query cache on first mount.
 * This ensures every page has cached data available for offline use.
 * Runs once in the background — doesn't block the UI.
 */
export function usePrefetchAll() {
  const queryClient = useQueryClient();
  const hasPrefetched = useRef(false);

  useEffect(() => {
    if (hasPrefetched.current) return;
    hasPrefetched.current = true;

    void prefetchAllData(queryClient);
  }, [queryClient]);
}

async function prefetchAllData(queryClient: ReturnType<typeof useQueryClient>) {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return;

  const month = new Date().toISOString().slice(0, 7);

  const prefetches = [
    queryClient.prefetchQuery({
      queryKey: ["accounts"],
      queryFn: async () => {
        const { data } = await supabase.from("accounts").select("*").eq("is_archived", false).order("name");
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["transactions", "recent"],
      queryFn: async () => {
        const { data } = await supabase.from("transactions").select("*").order("date", { ascending: false }).order("created_at", { ascending: false }).limit(10);
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["goals"],
      queryFn: async () => {
        const { data } = await supabase.from("goals").select("*").order("is_completed").order("created_at", { ascending: false });
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["goals", "summary"],
      queryFn: async () => {
        const { data } = await supabase.from("goals").select("*");
        const goals = data ?? [];
        return {
          total: goals.length,
          completed: goals.filter((g: any) => g.is_completed).length,
          active: goals.filter((g: any) => !g.is_completed).length,
          totalTarget: goals.reduce((s: number, g: any) => s + g.target_amount, 0),
          totalSaved: goals.reduce((s: number, g: any) => s + g.current_amount, 0),
        };
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["budgets", month],
      queryFn: async () => {
        const { data } = await supabase.from("budgets").select("*").eq("month", month);
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["debts"],
      queryFn: async () => {
        const { data } = await supabase.from("debts").select("*").order("created_at", { ascending: false });
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["contributions"],
      queryFn: async () => {
        const { data } = await supabase.from("contributions").select("*").order("period", { ascending: false });
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["tax-records"],
      queryFn: async () => {
        const { data } = await supabase.from("tax_records").select("*").order("year", { ascending: false });
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["insurance"],
      queryFn: async () => {
        const { data } = await supabase.from("insurance_policies").select("*").order("created_at", { ascending: false });
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["bills"],
      queryFn: async () => {
        const { data } = await supabase.from("bills").select("*").order("created_at", { ascending: false });
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["profile"],
      queryFn: async () => {
        const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        return data;
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["exchange-rates"],
      queryFn: async () => {
        const { data } = await supabase.from("exchange_rates").select("*");
        return data ?? [];
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["recurring-transactions"],
      queryFn: async () => {
        const { data } = await supabase.from("recurring_transactions").select("*").order("next_run_date");
        return data ?? [];
      },
    }),
  ];

  try {
    await Promise.allSettled(prefetches);
    console.log("[prefetch] All data cached for offline use");
  } catch {
    // Non-critical
  }
}
