import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { invalidateFinancialQueries } from "@/lib/query-utils";
import { toast } from "sonner";
import type { Contribution, ContributionInsert } from "@/lib/types/database";

export function useContributions(period?: string) {
  return useQuery({
    queryKey: ["contributions", period ?? "all"],
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
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("contributions")
        .select("id, type, period, employee_share, is_paid")
        .order("period", { ascending: false });

      if (error) throw new Error(error.message);

      const contributions = data;
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
        .upsert(
          { ...contribution, user_id: user.id },
          { onConflict: "user_id,type,period" }
        )
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
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

export function useBulkAddContributions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contributions: ContributionInsert[]) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const records = contributions.map((c) => ({ ...c, user_id: user.id }));
      const { error } = await supabase
        .from("contributions")
        .upsert(records, { onConflict: "user_id,type,period" });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
    },
    onError: () => {
      toast.error("Failed to import contributions. Please try again.");
    },
  });
}

/** Mark a contribution as paid and optionally create an expense transaction. */
export function useMarkContributionPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      contribution,
      accountId,
    }: {
      contribution: Contribution;
      accountId?: string;
    }) => {
      const supabase = createClient();

      // Mark as paid
      const { error: updateError } = await supabase
        .from("contributions")
        .update({ is_paid: true })
        .eq("id", contribution.id);
      if (updateError) throw new Error(updateError.message);

      // Create expense transaction if account provided
      if (accountId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const TYPE_LABELS: Record<string, string> = {
          sss: "SSS",
          philhealth: "PhilHealth",
          pagibig: "Pag-IBIG",
        };

        const { error } = await supabase.rpc("create_user_transaction", {
          p_amount: -Math.abs(contribution.employee_share),
          p_category: "government",
          p_description: `${TYPE_LABELS[contribution.type] ?? contribution.type} contribution (${contribution.period})`,
          p_date: new Date().toISOString().slice(0, 10),
          p_currency: "PHP",
          p_account_id: accountId,
          p_transfer_id: null,
          p_tags: null,
          p_attachment_path: null,
          p_split_group_id: null,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({ queryKey: ["contributions"] });
      if (accountId) {
        invalidateFinancialQueries(queryClient);
      }
      toast.success(accountId ? "Contribution paid — transaction recorded" : "Contribution marked as paid");
    },
    onError: (error) => {
      toast.error("Failed to mark contribution as paid", { description: error.message });
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
