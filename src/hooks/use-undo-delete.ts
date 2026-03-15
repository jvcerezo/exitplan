"use client";

import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const DEFAULT_UNDO_WINDOW_MS = 1200;

export function useUndoDelete(
  table: string,
  queryKeys: string[][],
  deleteFn?: (id: string) => Promise<void>,
  undoWindowMs = DEFAULT_UNDO_WINDOW_MS
) {
  const queryClient = useQueryClient();
  const pendingRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const execute = useCallback(
    (id: string, label: string) => {
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

      // Schedule real delete after short undo window
      const timeout = setTimeout(async () => {
        pendingRef.current.delete(id);
        try {
          if (deleteFn) {
            await deleteFn(id);
          } else {
            const supabase = createClient();
            const { error } = await supabase.from(table).delete().eq("id", id);
            if (error) throw error;
          }
        } catch {
          for (const snap of snapshots) {
            queryClient.setQueryData(snap.key, snap.data);
          }
          toast.error(`Failed to delete ${label}`);
        }
        for (const key of queryKeys) {
          queryClient.invalidateQueries({ queryKey: key });
        }
      }, undoWindowMs);

      pendingRef.current.set(id, timeout);

      toast(`${label} deleted`, {
        action: {
          label: "Undo",
          onClick: () => {
            clearTimeout(timeout);
            pendingRef.current.delete(id);
            for (const snap of snapshots) {
              queryClient.setQueryData(snap.key, snap.data);
            }
          },
        },
        duration: undoWindowMs,
      });
    },
    [deleteFn, queryClient, table, queryKeys, undoWindowMs]
  );

  return execute;
}
