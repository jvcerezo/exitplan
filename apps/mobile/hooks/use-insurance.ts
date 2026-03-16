import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InsurancePolicy, InsurancePolicyInsert } from "@exitplan/core";

export function useInsurancePolicies() {
  return useQuery({
    queryKey: ["insurance"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<InsurancePolicy[]> => {
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
      const { data, error } = await supabase
        .from("insurance_policies")
        .select("*")
        .eq("is_active", true);
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("insurance_policies")
        .insert({ ...policy, user_id: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
    },
  });
}

export function useUpdateInsurancePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<InsurancePolicyInsert> & { id: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from("insurance_policies")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
    },
  });
}

export function useDeleteInsurancePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("insurance_policies").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance"] });
    },
  });
}
