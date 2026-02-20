"use client";

import { useState } from "react";
import { ArrowRightLeft, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateTransfer } from "@/hooks/use-transfers";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency, cn } from "@/lib/utils";

export function TransferDialog() {
  const [open, setOpen] = useState(false);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const { data: accounts } = useAccounts();
  const createTransfer = useCreateTransfer();

  const activeAccounts = accounts?.filter((a) => !a.is_archived) ?? [];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await createTransfer.mutateAsync({
      fromAccountId: fromId,
      toAccountId: toId,
      amount: parseFloat(formData.get("amount") as string),
      date: formData.get("date") as string,
      description: (formData.get("description") as string) || undefined,
    });

    setOpen(false);
    setFromId("");
    setToId("");
  }

  if (activeAccounts.length < 2) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* From account */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">From</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeAccounts
                .filter((a) => a.id !== toId)
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setFromId(a.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                      fromId === a.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {a.name}
                    <span className="ml-1 opacity-70">
                      {formatCurrency(a.balance, a.currency)}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="rounded-full bg-muted p-1.5">
              <ArrowDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* To account */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">To</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {activeAccounts
                .filter((a) => a.id !== fromId)
                .map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setToId(a.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                      toId === a.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {a.name}
                    <span className="ml-1 opacity-70">
                      {formatCurrency(a.balance, a.currency)}
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex items-baseline gap-2 py-2">
            <span className="text-3xl font-bold text-muted-foreground/50">
              ₱
            </span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max="9999999999.99"
              placeholder="0.00"
              required
              className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {/* Note + Date */}
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input
              name="description"
              placeholder="Add a note..."
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
            />
            <input
              name="date"
              type="date"
              defaultValue={new Date().toISOString().split("T")[0]}
              required
              className="rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={createTransfer.isPending || !fromId || !toId}
          >
            {createTransfer.isPending ? "Transferring..." : "Transfer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
