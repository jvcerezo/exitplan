"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await undoDelete(id, description);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-muted-foreground hover:text-destructive"
        aria-label="Delete transaction"
        onClick={() => setConfirmOpen(true)}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete transaction?"
        description="This permanently deletes the transaction and updates balances."
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </>
  );
}
