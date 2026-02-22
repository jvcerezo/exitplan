"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateGoal, useAddFundsToGoal } from "@/hooks/use-goals";
import { useAccounts } from "@/hooks/use-accounts";
import type { Goal } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function UpdateAmountDialog({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const updateGoal = useUpdateGoal();
  const addFundsToGoal = useAddFundsToGoal();
  const { data: accounts } = useAccounts();

  const activeAccounts = accounts?.filter((a) => !a.is_archived) ?? [];
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);
  const remaining = Math.round((goal.target_amount - goal.current_amount) * 100) / 100;
  const isPending = updateGoal.isPending || addFundsToGoal.isPending;

  // Default to first account on open
  useEffect(() => {
    if (open && activeAccounts.length > 0 && !accountId) {
      setAccountId(activeAccounts[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeAccounts.length]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const addAmount = parseFloat(amount);

    if (!addAmount || addAmount <= 0) return;

    if (accountId && selectedAccount) {
      // Deduct from account
      await addFundsToGoal.mutateAsync({
        goalId: goal.id,
        accountId,
        amount: addAmount,
      });
    } else {
      // No accounts — just update the goal directly
      const newAmount = Math.round((goal.current_amount + addAmount) * 100) / 100;
      const isCompleted = newAmount >= goal.target_amount;
      await updateGoal.mutateAsync({
        id: goal.id,
        current_amount: newAmount,
        is_completed: isCompleted,
      });
    }

    setOpen(false);
    setAmount("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setAmount("");
          setAccountId("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Coins className="h-4 w-4 mr-1.5" />
          Add Funds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Funds to &ldquo;{goal.name}&rdquo;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {formatCurrency(remaining)} remaining to reach your goal.
          </p>

          {/* Account picker */}
          {activeAccounts.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                From
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {activeAccounts.map((account) => (
                  <button
                    key={account.id}
                    type="button"
                    onClick={() => setAccountId(account.id)}
                    className={cn(
                      "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                      accountId === account.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    {account.name} {formatCurrency(account.balance, account.currency)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Big amount input */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Amount to Add
            </p>
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
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                autoFocus
                className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !amount}
          >
            {isPending ? "Adding..." : "Add Funds"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
