import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import { addOfflineGoalToCache } from "@/lib/offline/query-cache";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";
import type { Goal, GoalInsert } from "@/lib/types/database";

export function useGoals() {
  return useQuery({
    queryKey: ["goals"],
    staleTime: 10 * 60 * 1000,
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
    staleTime: 10 * 60 * 1000,
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
      if (isBrowserOffline()) {
        const localId = createOfflineId("goal");
        const offlineGoal: Goal = {
          id: localId,
          created_at: new Date().toISOString(),
          user_id: "offline",
          name: goal.name,
          target_amount: goal.target_amount,
          current_amount: goal.current_amount,
          deadline: goal.deadline,
          category: goal.category,
          is_completed: false,
        };

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "addGoal",
          payload: {
            localId,
            name: goal.name,
            target_amount: goal.target_amount,
            current_amount: goal.current_amount,
            deadline: goal.deadline,
            category: goal.category,
          },
        });

        addOfflineGoalToCache(queryClient, offlineGoal);
        return offlineGoal;
      }

      const supabase = createClient();
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
      queryClient.invalidateQueries({ queryKey: ["goals", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success(isBrowserOffline() ? "Goal saved offline" : "Goal created");
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
      queryClient.invalidateQueries({ queryKey: ["goals", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success("Goal updated");
    },
    onError: (error) => {
      toast.error("Failed to update goal", { description: error.message });
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
      const supabase = createClient();
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
      queryClient.invalidateQueries({ queryKey: ["goals", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      toast.success("Funds added to goal");
    },
    onError: (error) => {
      toast.error("Failed to add funds", { description: error.message });
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
      const previousList = queryClient.getQueryData<Goal[]>(["goals"]);
      if (previousList) {
        queryClient.setQueryData<Goal[]>(
          ["goals"],
          previousList.filter((g) => g.id !== id)
        );
      }
      return { previousList };
    },
    onError: (error, _id, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(["goals"], context.previousList);
      }
      toast.error("Failed to delete goal", { description: error.message });
    },
    onSuccess: () => {
      toast.success("Goal deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["goals", "summary"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
    },
  });
}
