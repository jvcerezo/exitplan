"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

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
      .channel("db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transactions", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["transactions"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "goals", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["goals"] });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "budgets", filter },
        () => {
          queryClient.invalidateQueries({ queryKey: ["budgets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
