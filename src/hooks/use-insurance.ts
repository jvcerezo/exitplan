import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { InsurancePolicy, InsurancePolicyInsert } from "@/lib/types/database";

export function useInsurancePolicies() {
  return useQuery({
    queryKey: ["insurance"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<InsurancePolicy[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("insurance_policies")
        .select("*")
        .order("is_active", { ascending: false })
        .order("type", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useInsuranceSummary() {
  return useQuery({
    queryKey: ["insurance", "summary"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("insurance_policies").select("*").eq("is_active", true);
      if (error) throw new Error(error.message);

      const policies = data as InsurancePolicy[];

      const FREQ_MULTIPLIER: Record<string, number> = {
        monthly: 12, quarterly: 4, semi_annual: 2, annual: 1,
      };

      const totalAnnualPremium = policies.reduce((sum, p) => {
        const multiplier = FREQ_MULTIPLIER[p.premium_frequency] ?? 12;
        return sum + p.premium_amount * multiplier;
      }, 0);

      const totalCoverage = policies.reduce((sum, p) => sum + (p.coverage_amount ?? 0), 0);
      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const renewingSoon = policies.filter((p) => {
        if (!p.renewal_date) return false;
        // Parse YYYY-MM-DD as local date (avoid UTC midnight offset)
        const [y, m, d] = p.renewal_date.split("-").map(Number);
        const renewal = new Date(y, m - 1, d);
        const days = (renewal.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
      });

      return { policies, totalAnnualPremium, totalCoverage, renewingSoon, count: policies.length };
    },
  });
}

export function useAddInsurancePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (policy: InsurancePolicyInsert) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("insurance_policies").insert({ ...policy, user_id: user.id }).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      toast.success("Policy added");
    },
    onError: (e) => toast.error("Failed to add policy", { description: e.message }),
  });
}

export function useUpdateInsurancePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InsurancePolicyInsert> & { id: string; is_active?: boolean }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("insurance_policies").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      toast.success("Policy updated");
    },
    onError: (e) => toast.error("Failed to update policy", { description: e.message }),
  });
}

export function useDeleteInsurancePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("insurance_policies").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
      toast.success("Policy removed");
    },
    onError: (e) => toast.error("Failed to delete policy", { description: e.message }),
  });
}

/** Pay an insurance premium: creates an expense transaction from the linked account. */
export function usePayInsurancePremium() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      policy,
      accountId,
    }: {
      policy: InsurancePolicy;
      accountId?: string;
    }) => {
      const supabase = createClient();
      const effectiveAccountId = accountId ?? policy.account_id;
      if (!effectiveAccountId) return; // no account — nothing to do beyond the caller's intent

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.rpc("create_user_transaction", {
        p_amount: -Math.abs(policy.premium_amount),
        p_category: "insurance",
        p_description: `${policy.name} premium`,
        p_date: new Date().toISOString().slice(0, 10),
        p_currency: "PHP",
        p_account_id: effectiveAccountId,
        p_transfer_id: null,
        p_tags: null,
        p_attachment_path: null,
        p_split_group_id: null,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: (_, { policy, accountId }) => {
      const linked = accountId ?? policy.account_id;
      if (linked) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(linked ? "Premium paid — transaction recorded" : "Premium recorded");
    },
    onError: (e) => toast.error("Failed to record premium payment", { description: e.message }),
  });
}
