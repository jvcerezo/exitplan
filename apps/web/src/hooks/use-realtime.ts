"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  function invalidateTransactionDerivedQueries() {
    queryClient.invalidateQueries({ queryKey: ["transactions"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "spending-by-category"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "net-worth"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "spending-comparison"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "monthly-trend"] });
    queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
    queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
    queryClient.invalidateQueries({ queryKey: ["health-score"] });
  }

  function invalidateGoalDerivedQueries() {
    queryClient.invalidateQueries({ queryKey: ["goals"] });
    queryClient.invalidateQueries({ queryKey: ["goals", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
    queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
    queryClient.invalidateQueries({ queryKey: ["health-score"] });
  }

  function invalidateBudgetDerivedQueries() {
    queryClient.invalidateQueries({ queryKey: ["budgets"] });
    queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
    queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
    queryClient.invalidateQueries({ queryKey: ["health-score"] });
    queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const filter = `user_id=eq.${userId}`;

    const channel = supabase
      .channel(`db-changes-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter },
        () => {
          invalidateTransactionDerivedQueries();
          queryClient.invalidateQueries({ queryKey: ["accounts"] });
          queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals", filter },
        () => {
          invalidateGoalDerivedQueries();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goal_fundings", filter },
        () => {
          invalidateGoalDerivedQueries();
          invalidateTransactionDerivedQueries();
          queryClient.invalidateQueries({ queryKey: ["accounts"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budgets", filter },
        () => {
          invalidateBudgetDerivedQueries();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exchange_rates", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["exchange-rates"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accounts", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["accounts"] });
          queryClient.invalidateQueries({ queryKey: ["transactions", "net-worth"] });
          queryClient.invalidateQueries({ queryKey: ["health-score"] });
          queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
          queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["profile"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bug_reports", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["bug-reports", "mine"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
