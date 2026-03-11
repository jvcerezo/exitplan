"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { useDeleteTransaction } from "@/hooks/use-transactions";

const QUERY_KEYS = [["transactions"]];

export function DeleteTransactionDialog({
  id,
  description,
}: {
  id: string;
  description: string;
}) {
  const deleteTransaction = useDeleteTransaction();
  const undoDelete = useUndoDelete(
    "transactions",
    QUERY_KEYS,
    async (transactionId: string) => {
      await deleteTransaction.mutateAsync(transactionId);
    }
  );

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="text-muted-foreground hover:text-destructive"
      aria-label="Delete transaction"
      onClick={() => undoDelete(id, description)}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
