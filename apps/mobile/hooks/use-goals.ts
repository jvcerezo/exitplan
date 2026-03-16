import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Goal, GoalInsert } from "@exitplan/core";

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Goal[]> => {
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
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.from("goals").select("*");

      if (error) throw new Error(error.message);

      const total = data.length;
      const completed = data.filter((g: Goal) => g.is_completed).length;
      const totalTarget = data.reduce((sum: number, g: Goal) => sum + g.target_amount, 0);
      const totalSaved = data.reduce((sum: number, g: Goal) => sum + g.current_amount, 0);

      return {
        total,
        completed,
        active: total - completed,
        totalTarget: Math.round(totalTarget * 100) / 100,
        totalSaved: Math.round(totalSaved * 100) / 100,
      };
    },
  });
}

export function useAddGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (goal: GoalInsert) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("goals")
        .insert({ ...goal, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
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
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useAddFundsToGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      goalId,
      accountId,
      amount,
    }: {
      goalId: string;
      accountId: string;
      amount: number;
    }) => {
      const { error } = await supabase.rpc("add_funds_to_goal", {
        p_goal_id: goalId,
        p_account_id: accountId,
        p_amount: Math.abs(amount),
        p_note: null,
        p_funding_date: new Date().toISOString().split("T")[0],
      });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("goals").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousList = queryClient.getQueryData<Goal[]>(["goals"]);
      queryClient.setQueryData<Goal[]>(["goals"], (old) =>
        (old ?? []).filter((g) => g.id !== id)
      );
      return { previousList };
    },
    onError: (_error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["goals"], context.previousList);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}
