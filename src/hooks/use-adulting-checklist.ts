import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type ChecklistItemStatus = "done" | "skipped" | null;

interface ChecklistProgressRow {
  item_id: string;
  status: string;
}

export function useChecklistProgress() {
  return useQuery({
    queryKey: ["adulting-checklist"],
    staleTime: 0,
    queryFn: async (): Promise<Record<string, ChecklistItemStatus>> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("adulting_checklist_progress")
        .select("item_id, status");

      if (error) throw new Error(error.message);
      const map: Record<string, ChecklistItemStatus> = {};
      for (const row of (data ?? []) as ChecklistProgressRow[]) {
        map[row.item_id] = row.status as ChecklistItemStatus;
      }
      return map;
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, status }: { itemId: string; status: ChecklistItemStatus }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (status === null) {
        // Remove progress entry
        const { error } = await supabase
          .from("adulting_checklist_progress")
          .delete()
          .eq("item_id", itemId)
          .eq("user_id", user.id);
        if (error) throw new Error(error.message);
      } else {
        // Upsert with status
        const { error } = await supabase
          .from("adulting_checklist_progress")
          .upsert(
            { user_id: user.id, item_id: itemId, status },
            { onConflict: "user_id,item_id" }
          );
        if (error) throw new Error(error.message);
      }
    },
    onMutate: async ({ itemId, status }) => {
      await queryClient.cancelQueries({ queryKey: ["adulting-checklist"] });
      const prev = queryClient.getQueryData<Record<string, ChecklistItemStatus>>(["adulting-checklist"]);

      queryClient.setQueryData<Record<string, ChecklistItemStatus>>(["adulting-checklist"], (old) => {
        const map = { ...(old ?? {}) };
        if (status === null) {
          delete map[itemId];
        } else {
          map[itemId] = status;
        }
        return map;
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(["adulting-checklist"], context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["adulting-checklist"] });
    },
  });
}
