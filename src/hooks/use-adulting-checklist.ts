import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useChecklistProgress() {
  return useQuery({
    queryKey: ["adulting-checklist"],
    queryFn: async (): Promise<Set<string>> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("adulting_checklist_progress")
        .select("item_id");

      if (error) throw new Error(error.message);
      return new Set((data ?? []).map((r) => r.item_id));
    },
  });
}

export function useToggleChecklistItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      const supabase = createClient();

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
      const prev = queryClient.getQueryData<Set<string>>(["adulting-checklist"]);

      queryClient.setQueryData<Set<string>>(["adulting-checklist"], (old) => {
        const next = new Set(old ?? []);
        if (completed) next.add(itemId);
        else next.delete(itemId);
        return next;
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
