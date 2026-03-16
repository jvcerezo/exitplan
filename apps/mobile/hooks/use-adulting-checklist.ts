import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useChecklistProgress() {
  return useQuery({
    queryKey: ["adulting-checklist"],
    staleTime: 0,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from("adulting_checklist_progress")
        .select("item_id");

      if (error) throw new Error(error.message);
      return (data ?? []).map((r: { item_id: string }) => r.item_id);
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      if (completed) {
        const { error } = await supabase
          .from("adulting_checklist_progress")
          .insert({ item_id: itemId });
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase
          .from("adulting_checklist_progress")
          .delete()
          .eq("item_id", itemId);
        if (error) throw new Error(error.message);
      }
    },
    onMutate: async ({ itemId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ["adulting-checklist"] });
      const prev = queryClient.getQueryData<string[]>(["adulting-checklist"]);

      queryClient.setQueryData<string[]>(["adulting-checklist"], (old) => {
        const arr = old ?? [];
        if (completed) return arr.includes(itemId) ? arr : [...arr, itemId];
        return arr.filter((id) => id !== itemId);
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
