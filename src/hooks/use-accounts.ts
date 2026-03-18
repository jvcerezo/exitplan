import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import {
  addOfflineAccountToCache,
  removeOfflineAccountFromCache,
  updateOfflineAccountInCache,
} from "@/lib/offline/query-cache";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";
import type { Account, AccountInsert } from "@/lib/types/database";

export function useAccounts() {
  return useQuery({
    queryKey: ["accounts"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Account[]> => {
      const supabase = createClient();
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

export function useArchivedAccounts() {
  return useQuery({
    queryKey: ["accounts", "archived"],
    staleTime: 10 * 60 * 1000,
    queryFn: async (): Promise<Account[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("is_archived", true)
        .order("name", { ascending: true });

      if (error) throw new Error(error.message);
      return data;
    },
  });
}

export function useArchiveAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("accounts")
        .update({ is_archived: archive })
        .eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: (_data, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success(archive ? "Account archived" : "Account restored");
    },
    onError: (error) => {
      toast.error("Failed to update account", { description: error.message });
    },
  });
}

export function useAddAccount() {
  const queryClient = useQueryClient();

  function upsertAccountInCache(account: Account) {
    queryClient.setQueryData<Account[] | undefined>(["accounts"], (current) => {
      const next = (current ?? []).filter((existing) => existing.id !== account.id);
      next.push(account);
      return next.sort((left, right) => left.name.localeCompare(right.name));
    });
  }

  return useMutation({
    mutationFn: async (account: AccountInsert) => {
      if (isBrowserOffline()) {
        const localId = createOfflineId("account");
        const offlineAccount: Account = {
          id: localId,
          created_at: new Date().toISOString(),
          user_id: "offline",
          name: account.name.trim(),
          type: account.type,
          currency: account.currency,
          balance: Number(account.balance ?? 0),
          is_archived: false,
        };

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "addAccount",
          payload: {
            localId,
            name: offlineAccount.name,
            type: offlineAccount.type,
            currency: offlineAccount.currency,
            balance: offlineAccount.balance,
          },
        });

        addOfflineAccountToCache(queryClient, offlineAccount);
        return offlineAccount;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const normalizedName = account.name.trim();
      const incomingBalance = Number(account.balance ?? 0);
      // Credit cards can have negative balances (outstanding balance)
      const normalizedIncomingBalance = Number.isFinite(incomingBalance)
        ? account.type === "credit-card" ? incomingBalance : Math.max(0, incomingBalance)
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
    onSuccess: (account) => {
      upsertAccountInCache(account);
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["health-score"] });
      queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
      queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
      queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
      toast.success(isBrowserOffline() ? "Account saved offline" : "Account added");
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
      if (isBrowserOffline()) {
        const normalizedName = updates.name?.trim();
        const offlineUpdates = {
          ...updates,
          ...(normalizedName ? { name: normalizedName } : {}),
        };

        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "updateAccount",
          payload: { id, ...offlineUpdates },
        });

        updateOfflineAccountInCache(queryClient, id, offlineUpdates as Partial<Account>);
        return { id, ...offlineUpdates };
      }

      const supabase = createClient();

      const { data: existingAccount, error: existingAccountError } = await supabase
        .from("accounts")
        .select("id, name")
        .eq("id", id)
        .single();

      if (existingAccountError) throw new Error(existingAccountError.message);

      const normalizedName = updates.name?.trim();
      const shouldPropagateRename =
        Boolean(normalizedName) &&
        normalizedName !== existingAccount.name;

      const { data, error } = await supabase
        .from("accounts")
        .update({
          ...updates,
          ...(normalizedName ? { name: normalizedName } : {}),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw new Error(error.message);

      if (shouldPropagateRename && normalizedName) {
        const { error: transactionRenameError } = await supabase
          .from("transactions")
          .update({ description: `Opening balance: ${normalizedName}` })
          .eq("account_id", id)
          .ilike("description", "Opening balance:%");

        if (transactionRenameError) {
          throw new Error(transactionRenameError.message);
        }
      }

      return data;
    },
    onSuccess: () => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(isBrowserOffline() ? "Account update saved offline" : "Account updated");
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
      if (isBrowserOffline()) {
        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "deleteAccount",
          payload: { id },
        });

        removeOfflineAccountFromCache(queryClient, id);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.from("accounts").delete().eq("id", id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(isBrowserOffline() ? "Account delete saved offline" : "Account deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete account", { description: error.message });
    },
  });
}
