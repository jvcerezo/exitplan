"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

/**
 * Batches realtime invalidations so rapid-fire DB changes
 * (e.g. a transaction insert that also updates the account balance)
 * coalesce into a single invalidation pass instead of 20+ individual refetches.
 */
function useDebouncedInvalidator(delayMs = 300) {
  const queryClient = useQueryClient();
  const pendingKeys = useRef<Set<string>>(new Set());
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const schedule = useCallback((...queryKeys: string[][]) => {
    for (const key of queryKeys) {
      pendingKeys.current.add(JSON.stringify(key));
    }

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const keys = [...pendingKeys.current];
      pendingKeys.current.clear();
      for (const serialized of keys) {
        queryClient.invalidateQueries({ queryKey: JSON.parse(serialized) });
      }
    }, delayMs);
  }, [queryClient, delayMs]);

  return schedule;
}

export function useRealtimeSync() {
  const [userId, setUserId] = useState<string | null>(null);
  const schedule = useDebouncedInvalidator();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUserId(session.user.id);
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
          schedule(
            ["transactions"],
            ["transactions", "summary"],
            ["budgets", "summary"],
            ["transactions", "spending-by-category"],
            ["transactions", "net-worth"],
            ["transactions", "spending-comparison"],
            ["transactions", "monthly-trend"],
            ["safe-to-spend"],
            ["savings-rate"],
            ["health-score"],
            ["accounts"],
            ["emergency-fund"]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals", filter },
        () => {
          schedule(
            ["goals"],
            ["goals", "summary"],
            ["safe-to-spend"],
            ["emergency-fund"],
            ["health-score"]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goal_fundings", filter },
        () => {
          schedule(
            ["goals"],
            ["goals", "summary"],
            ["safe-to-spend"],
            ["emergency-fund"],
            ["health-score"],
            ["transactions"],
            ["transactions", "summary"],
            ["accounts"]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budgets", filter },
        () => {
          schedule(
            ["budgets"],
            ["budgets", "summary"],
            ["safe-to-spend"],
            ["health-score"],
            ["transactions", "summary"]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "exchange_rates", filter },
        () => {
          schedule(["exchange-rates"]);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "accounts", filter },
        () => {
          schedule(
            ["accounts"],
            ["transactions", "net-worth"],
            ["health-score"],
            ["safe-to-spend"],
            ["emergency-fund"]
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles", filter },
        () => {
          schedule(["profile"]);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bug_reports", filter },
        () => {
          schedule(["bug-reports", "mine"]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, schedule]);
}
