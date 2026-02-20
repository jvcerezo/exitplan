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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Generate a shared transfer_id
      const transferId = crypto.randomUUID();

      const label = description || "Transfer";

      // Insert two linked transactions
      const { error } = await supabase.from("transactions").insert([
        {
          user_id: user.id,
          amount: -Math.abs(amount),
          category: "transfer",
          description: label,
          date,
          currency: "PHP",
          account_id: fromAccountId,
          transfer_id: transferId,
        },
        {
          user_id: user.id,
          amount: Math.abs(amount),
          category: "transfer",
          description: label,
          date,
          currency: "PHP",
          account_id: toAccountId,
          transfer_id: transferId,
        },
      ]);

      if (error) throw new Error(error.message);
      return transferId;
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
