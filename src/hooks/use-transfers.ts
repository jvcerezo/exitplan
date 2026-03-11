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

      // Fetch both account balances
      const [fromResult, toResult] = await Promise.all([
        supabase.from("accounts").select("balance").eq("id", fromAccountId).single(),
        supabase.from("accounts").select("balance").eq("id", toAccountId).single(),
      ]);

      if (fromResult.error) throw new Error(fromResult.error.message);
      if (toResult.error) throw new Error(toResult.error.message);

      const absAmount = Math.abs(amount);

      if (fromResult.data.balance < absAmount) {
        throw new Error("Insufficient balance in source account");
      }

      // Update both balances atomically
      const [fromUpdate, toUpdate] = await Promise.all([
        supabase
          .from("accounts")
          .update({ balance: Math.round((fromResult.data.balance - absAmount) * 100) / 100 })
          .eq("id", fromAccountId),
        supabase
          .from("accounts")
          .update({ balance: Math.round((toResult.data.balance + absAmount) * 100) / 100 })
          .eq("id", toAccountId),
      ]);

      if (fromUpdate.error) throw new Error(fromUpdate.error.message);
      if (toUpdate.error) throw new Error(toUpdate.error.message);

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
