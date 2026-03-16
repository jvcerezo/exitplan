"use client";

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export function useUndoDelete(
  table: string,
  queryKeys: string[][],
  deleteFn?: (id: string) => Promise<void>
) {
  const queryClient = useQueryClient();
  const pendingRef = useRef<Set<string>>(new Set());

  const execute = useCallback(
    async (id: string, label: string) => {
      if (pendingRef.current.has(id)) {
        return;
      }

      pendingRef.current.add(id);

      // Snapshot all relevant query caches
      const snapshots: { key: readonly unknown[]; data: unknown }[] = [];
      for (const key of queryKeys) {
        const queries = queryClient.getQueriesData({ queryKey: key });
        for (const [queryKey, data] of queries) {
          snapshots.push({ key: queryKey, data });
        }
      }

      // Optimistically remove from all caches
      for (const key of queryKeys) {
        const queries = queryClient.getQueriesData({ queryKey: key });
        for (const [queryKey, data] of queries) {
          if (Array.isArray(data)) {
            queryClient.setQueryData(
              queryKey,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              data.filter((item: any) => item.id !== id)
            );
          }
        }
      }

      const toastId = toast.loading(`Deleting ${label}...`);

      try {
        if (deleteFn) {
          await deleteFn(id);
        } else {
          const supabase = createClient();
          const { error } = await supabase.from(table).delete().eq("id", id);
          if (error) throw error;
        }

        for (const key of queryKeys) {
          await queryClient.invalidateQueries({ queryKey: key });
        }

        toast.success(`${label} deleted`, { id: toastId });
      } catch {
        for (const snap of snapshots) {
          queryClient.setQueryData(snap.key, snap.data);
        }
        toast.error(`Failed to delete ${label}`, { id: toastId });
        throw new Error(`Failed to delete ${label}`);
      } finally {
        pendingRef.current.delete(id);
      }
    },
    [deleteFn, queryClient, table, queryKeys]
  );

  return execute;
}
