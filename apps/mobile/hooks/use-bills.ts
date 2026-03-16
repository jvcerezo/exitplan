import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Bill, BillInsert } from "@exitplan/core";

export function useBills() {
  return useQuery({
    queryKey: ["bills"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Bill[]> => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("is_active", { ascending: false })
        .order("category", { ascending: true });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useBillsSummary() {
  return useQuery({
    queryKey: ["bills", "summary"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .eq("is_active", true);
      if (error) throw new Error(error.message);

      const FREQ_MONTHLY: Record<string, number> = {
        monthly: 1, quarterly: 1 / 3, semi_annual: 1 / 6, annual: 1 / 12,
      };

      const bills = data as Bill[];
      const totalMonthly = bills.reduce((sum, b) => {
        const factor = FREQ_MONTHLY[b.billing_cycle] ?? 1;
        return sum + b.amount * factor;
      }, 0);

      const now = new Date();
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const dueSoon = bills.filter((b) => {
        if (!b.due_day) return false;
        let next = new Date(now.getFullYear(), now.getMonth(), b.due_day);
        if (next < todayMidnight) next = new Date(now.getFullYear(), now.getMonth() + 1, b.due_day);
        const daysUntil = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil >= 0 && daysUntil <= 7;
      });

      const byCategory = bills.reduce<Record<string, number>>((acc, b) => {
        const factor = FREQ_MONTHLY[b.billing_cycle] ?? 1;
        acc[b.category] = (acc[b.category] ?? 0) + b.amount * factor;
        return acc;
      }, {});

      return { bills, totalMonthly, dueSoon, byCategory, count: bills.length };
    },
  });
}

export function useAddBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bill: BillInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("bills")
        .insert({ ...bill, user_id: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useUpdateBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<BillInsert> & { id: string; is_active?: boolean; last_paid_date?: string | null }) => {
      const { data, error } = await supabase
        .from("bills")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useDeleteBill() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bills").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });
}

export function useMarkBillPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      bill,
      accountId,
    }: {
      bill: Bill;
      accountId?: string;
    }) => {
      const today = new Date().toISOString().slice(0, 10);
      const effectiveAccountId = accountId ?? bill.account_id;

      const { error: billError } = await supabase
        .from("bills")
        .update({ last_paid_date: today })
        .eq("id", bill.id);
      if (billError) throw new Error(billError.message);

      if (effectiveAccountId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.rpc("create_user_transaction", {
          p_amount: -Math.abs(bill.amount),
          p_category: bill.category,
          p_description: bill.name,
          p_date: today,
          p_currency: "PHP",
          p_account_id: effectiveAccountId,
          p_transfer_id: null,
          p_tags: null,
          p_attachment_path: null,
          p_split_group_id: null,
        });
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: (_, { bill, accountId }) => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
      const linkedAccount = accountId ?? bill.account_id;
      if (linkedAccount) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
      }
    },
  });
}
