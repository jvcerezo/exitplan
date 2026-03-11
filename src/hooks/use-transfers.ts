import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
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
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Transfer completed");
    },
    onError: (error) => {
      toast.error("Failed to transfer", { description: error.message });
    },
  });
}
