import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { Account, AccountInsert } from "@exitplan/core";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_archived", false)
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: AccountInsert) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const normalizedName = account.name.trim();
      const incomingBalance = Number(account.balance ?? 0);
      const normalizedIncomingBalance = Number.isFinite(incomingBalance)
        ? Math.max(0, incomingBalance)
        : 0;
      const transactionDate = new Date().toISOString().split("T")[0];

      const { data: existing, error: existingError } = await supabase
        .from("accounts")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", normalizedName)
        .eq("type", account.type)
        .eq("currency", account.currency)
        .maybeSingle();

      if (existingError) throw new Error(existingError.message);

      if (existing) {
        if (normalizedIncomingBalance > 0) {
          const { error: txError } = await supabase.rpc("create_user_transaction", {
            p_amount: normalizedIncomingBalance,
            p_category: "salary",
            p_description: `Opening balance: ${normalizedName}`,
            p_date: transactionDate,
            p_currency: account.currency,
            p_account_id: existing.id,
            p_transfer_id: null,
            p_split_group_id: null,
            p_tags: ["opening-balance"],
            p_attachment_path: null,
          });

          if (txError) throw new Error(txError.message);
        }

        const { data: refreshed, error: refreshedError } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", existing.id)
          .single();

        if (refreshedError) throw new Error(refreshedError.message);
        return refreshed as Account;
      }

      const { data, error } = await supabase
        .from("accounts")
        .insert({ ...account, name: normalizedName, user_id: user.id, balance: 0 })
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (normalizedIncomingBalance > 0) {
        const { error: txError } = await supabase.rpc("create_user_transaction", {
          p_amount: normalizedIncomingBalance,
          p_category: "salary",
          p_description: `Opening balance: ${normalizedName}`,
          p_date: transactionDate,
          p_currency: account.currency,
          p_account_id: data.id,
          p_transfer_id: null,
          p_split_group_id: null,
          p_tags: ["opening-balance"],
          p_attachment_path: null,
        });

        if (txError) {
          await supabase.from("accounts").delete().eq("id", data.id);
          throw new Error(txError.message);
        }

        const { data: refreshed, error: refreshedError } = await supabase
          .from("accounts")
          .select("*")
          .eq("id", data.id)
          .single();

        if (refreshedError) throw new Error(refreshedError.message);
        return refreshed as Account;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AccountInsert> & { id: string }) => {
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const { error } = await supabase
        .from("accounts")
        .update({ is_archived: archive })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
