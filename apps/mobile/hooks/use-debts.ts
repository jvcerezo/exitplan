import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Debt, DebtInsert } from "@exitplan/core";

export function useDebts() {
  return useQuery({
    queryKey: ["debts"],
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<Debt[]> => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .order("is_paid_off", { ascending: true })
        .order("current_balance", { ascending: false });
      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useDebtSummary() {
  return useQuery({
    queryKey: ["debts", "summary"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("debts")
        .select("*")
        .eq("is_paid_off", false);
      if (error) throw new Error(error.message);

      const debts = data as Debt[];
      const totalDebt = debts.reduce((s, d) => s + d.current_balance, 0);
      const totalMinimum = debts.reduce((s, d) => s + d.minimum_payment, 0);
      const highestRate = debts.reduce((max, d) => Math.max(max, d.interest_rate), 0);

      return { debts, totalDebt, totalMinimum, highestRate, count: debts.length };
    },
  });
}

export function useAddDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (debt: DebtInsert) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("debts")
        .insert({ ...debt, user_id: user.id })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<DebtInsert> & { id: string; is_paid_off?: boolean }) => {
      const { data, error } = await supabase
        .from("debts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useRecordDebtPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      debt,
      paymentAmount,
      accountId,
    }: {
      debt: Debt;
      paymentAmount: number;
      accountId?: string;
    }) => {
      const newBalance = Math.max(0, debt.current_balance - paymentAmount);
      const isPaidOff = newBalance <= 0;

      const { error: debtError } = await supabase
        .from("debts")
        .update({ current_balance: newBalance, is_paid_off: isPaidOff })
        .eq("id", debt.id);
      if (debtError) throw new Error(debtError.message);

      const effectiveAccountId = accountId ?? debt.account_id;
      if (effectiveAccountId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");

        const { error } = await supabase.rpc("create_user_transaction", {
          p_amount: -Math.abs(paymentAmount),
          p_category: "debt_payment",
          p_description: `${debt.name} payment`,
          p_date: new Date().toISOString().slice(0, 10),
          p_currency: "PHP",
          p_account_id: effectiveAccountId,
          p_transfer_id: null,
          p_tags: null,
          p_attachment_path: null,
          p_split_group_id: null,
        });
        if (error) throw new Error(error.message);
      }

      return { newBalance, isPaidOff };
    },
    onSuccess: (_result, { accountId, debt }) => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      const linked = accountId ?? debt.account_id;
      if (linked) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
      }
    },
  });
}
