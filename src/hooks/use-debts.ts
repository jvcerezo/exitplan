import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Debt, DebtInsert } from "@/lib/types/database";

export function useDebts() {
  return useQuery({
    queryKey: ["debts"],
    staleTime: 30 * 60 * 1000,
    queryFn: async (): Promise<Debt[]> => {
      const supabase = createClient();
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
    staleTime: 30 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("debts")
        .select("id, name, current_balance, interest_rate, minimum_payment")
        .eq("is_paid_off", false);
      if (error) throw new Error(error.message);

      const debts = data;
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("debts").insert({ ...debt, user_id: user.id }).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      toast.success("Debt added");
    },
    onError: (e) => toast.error("Failed to add debt", { description: e.message }),
  });
}

export function useUpdateDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DebtInsert> & { id: string; is_paid_off?: boolean }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("debts").update(updates).eq("id", id).select().single();
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      toast.success("Debt updated");
    },
    onError: (e) => toast.error("Failed to update debt", { description: e.message }),
  });
}

export function useDeleteDebt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("debts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      toast.success("Debt removed");
    },
    onError: (e) => toast.error("Failed to delete debt", { description: e.message }),
  });
}

/** Record a debt payment: reduces current_balance, optionally creates an expense transaction. */
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
      const supabase = createClient();
      const newBalance = Math.max(0, debt.current_balance - paymentAmount);
      const isPaidOff = newBalance <= 0;

      // Update debt balance (and mark paid off if cleared)
      const { error: debtError } = await supabase
        .from("debts")
        .update({ current_balance: newBalance, is_paid_off: isPaidOff })
        .eq("id", debt.id);
      if (debtError) throw new Error(debtError.message);

      // Create expense transaction if account provided
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
    onSuccess: (result, { accountId, debt }) => {
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      const linked = accountId ?? debt.account_id;
      if (linked) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["budgets", "summary"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(result.isPaidOff ? "Debt paid off! 🎉" : "Payment recorded");
    },
    onError: (e) => toast.error("Failed to record payment", { description: e.message }),
  });
}
