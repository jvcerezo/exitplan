import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Goal, GoalInsert } from "@/lib/types/database";

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    queryFn: async (): Promise<Goal[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("is_completed", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useGoalsSummary() {
  return useQuery({
    queryKey: ["goals", "summary"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("goals").select("*");

      if (error) throw new Error(error.message);

      const total = data.length;
      const completed = data.filter((g: Goal) => g.is_completed).length;
      const totalTarget = data.reduce(
        (sum: number, g: Goal) => sum + g.target_amount,
        0
      );
      const totalSaved = data.reduce(
        (sum: number, g: Goal) => sum + g.current_amount,
        0
      );

      return { total, completed, active: total - completed, totalTarget, totalSaved };
    },
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalInsert) => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("goals")
        .insert({ ...goal, user_id: user!.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal created");
    },
    onError: (error) => {
      toast.error("Failed to create goal", { description: error.message });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<GoalInsert> & { id: string; is_completed?: boolean }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast.success("Goal updated");
    },
    onError: (error) => {
      toast.error("Failed to update goal", { description: error.message });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("goals").delete().eq("id", id);

      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previous = queryClient.getQueriesData({ queryKey: ["goals"] });
      queryClient.setQueriesData(
        { queryKey: ["goals"] },
        (old: Goal[] | undefined) => old?.filter((g) => g.id !== id)
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        context.previous.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
      toast.error("Failed to delete goal", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Goal deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });
}
