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

      const [goalResult, accountResult] = await Promise.all([
        supabase
          .from("goals")
          .select("current_amount, target_amount")
          .eq("id", goalId)
          .single(),
        supabase
          .from("accounts")
          .select("balance")
          .eq("id", accountId)
          .single(),
      ]);

      if (goalResult.error) throw new Error(goalResult.error.message);
      if (accountResult.error) throw new Error(accountResult.error.message);

      const newGoalAmount =
        Math.round((goalResult.data.current_amount + amount) * 100) / 100;
      const newAccountBalance =
        Math.round((accountResult.data.balance - amount) * 100) / 100;
      const isCompleted = newGoalAmount >= goalResult.data.target_amount;

      const [goalUpdate, accountUpdate] = await Promise.all([
        supabase
          .from("goals")
          .update({ current_amount: newGoalAmount, is_completed: isCompleted })
          .eq("id", goalId),
        supabase
          .from("accounts")
          .update({ balance: newAccountBalance })
          .eq("id", accountId),
      ]);

      if (goalUpdate.error) throw new Error(goalUpdate.error.message);
      if (accountUpdate.error) throw new Error(accountUpdate.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
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
    },
  });
}
