import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Contribution, ContributionInsert } from "@/lib/types/database";

export function useContributions(period?: string) {
  return useQuery({
    queryKey: ["contributions", period ?? "all"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Contribution[]> => {
      const supabase = createClient();
      let query = supabase
        .from("contributions")
        .select("*")
        .order("period", { ascending: false })
        .order("type", { ascending: true });

      if (period) {
        query = query.eq("period", period);
      }

      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useContributionSummary() {
  return useQuery({
    queryKey: ["contributions", "summary"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contributions")
        .select("*")
        .order("period", { ascending: false });

      if (error) throw new Error(error.message);

      const contributions = data as Contribution[];
      const totalPaid = contributions.filter((c) => c.is_paid).reduce((sum, c) => sum + c.employee_share, 0);
      const totalUnpaid = contributions.filter((c) => !c.is_paid).reduce((sum, c) => sum + c.employee_share, 0);
      const byType = {
        sss: contributions.filter((c) => c.type === "sss"),
        philhealth: contributions.filter((c) => c.type === "philhealth"),
        pagibig: contributions.filter((c) => c.type === "pagibig"),
      };

      return { contributions, totalPaid, totalUnpaid, byType };
    },
  });
}

export function useAddContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contribution: ContributionInsert) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("contributions")
        .insert({ ...contribution, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast.success("Contribution saved");
    },
    onError: (error) => {
      toast.error("Failed to save contribution", { description: error.message });
    },
  });
}

export function useUpdateContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContributionInsert> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contributions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast.success("Contribution updated");
    },
    onError: (error) => {
      toast.error("Failed to update contribution", { description: error.message });
    },
  });
}

export function useDeleteContribution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("contributions").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      toast.success("Contribution deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete contribution", { description: error.message });
    },
  });
}
