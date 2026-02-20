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

      const { data, error } = await supabase
        .from("accounts")
        .insert({ ...account, user_id: user.id })
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
