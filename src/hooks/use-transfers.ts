import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { enqueueOfflineMutation } from "@/lib/offline/store";
import { updateOfflineAccountBalance } from "@/lib/offline/query-cache";
import { createOfflineId, isBrowserOffline } from "@/lib/offline/utils";
import { toast } from "sonner";

interface CreateTransferInput {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  date: string;
  description?: string;
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fromAccountId,
      toAccountId,
      amount,
      date,
      description,
    }: CreateTransferInput) => {
      if (isBrowserOffline()) {
        await enqueueOfflineMutation({
          id: createOfflineId("mutation"),
          type: "createTransfer",
          payload: {
            fromAccountId,
            toAccountId,
            amount,
            date,
            description,
          },
        });

        const normalizedAmount = Math.abs(amount);
        updateOfflineAccountBalance(queryClient, fromAccountId, -normalizedAmount);
        updateOfflineAccountBalance(queryClient, toAccountId, normalizedAmount);
        return null;
      }

      const supabase = createClient();
      const { data, error } = await supabase.rpc("create_account_transfer", {
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        transfer_amount: Math.abs(amount),
        transfer_date: date,
        transfer_description: description ?? null,
      });

      if (error) throw new Error(error.message);

      return data;
    },
    onSuccess: () => {
      if (!isBrowserOffline()) {
        queryClient.invalidateQueries({ queryKey: ["transactions"] });
        queryClient.invalidateQueries({ queryKey: ["accounts"] });
        queryClient.invalidateQueries({ queryKey: ["safe-to-spend"] });
        queryClient.invalidateQueries({ queryKey: ["emergency-fund"] });
        queryClient.invalidateQueries({ queryKey: ["savings-rate"] });
        queryClient.invalidateQueries({ queryKey: ["health-score"] });
        queryClient.invalidateQueries({ queryKey: ["transactions", "summary"] });
      }
      toast.success(isBrowserOffline() ? "Transfer saved offline" : "Transfer completed");
    },
    onError: (error) => {
      toast.error("Failed to transfer", { description: error.message });
    },
  });
}
