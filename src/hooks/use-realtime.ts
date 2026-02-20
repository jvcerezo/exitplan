"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["goals"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budgets" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["budgets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
