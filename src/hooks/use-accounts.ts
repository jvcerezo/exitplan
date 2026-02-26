import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Account, AccountInsert } from "@/lib/types/database";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    queryFn: async (): Promise<Account[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .order("is_archived", { ascending: true })
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
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const normalizedName = account.name.trim();
      const incomingBalance = Number(account.balance ?? 0);

      const { data: existing, error: existingError } = await supabase
        .from("accounts")
        .select("id, balance, is_archived")
        .eq("user_id", user.id)
        .eq("name", normalizedName)
        .eq("type", account.type)
        .eq("currency", account.currency)
        .maybeSingle();

      if (existingError) throw new Error(existingError.message);

      if (existing) {
        const updatedBalance = Number(existing.balance ?? 0) + incomingBalance;
        const { error: updateError } = await supabase
          .from("accounts")
          .update({ balance: updatedBalance, is_archived: false })
          .eq("id", existing.id);

        if (updateError) throw new Error(updateError.message);
        return { ...existing, balance: updatedBalance, is_archived: false } as Account;
      }

      const { data, error } = await supabase
        .from("accounts")
        .insert({ ...account, name: normalizedName, user_id: user.id })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account added");
    },
    onError: (error) => {
      toast.error("Failed to add account", { description: error.message });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<AccountInsert> & { id: string }) => {
      const supabase = createClient();
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
      toast.success("Account updated");
    },
    onError: (error) => {
      toast.error("Failed to update account", { description: error.message });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete account", { description: error.message });
    },
  });
}
