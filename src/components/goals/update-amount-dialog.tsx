"use client";

import { useState } from "react";
import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useUpdateGoal } from "@/hooks/use-goals";
import type { Goal } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils";

export function UpdateAmountDialog({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const updateGoal = useUpdateGoal();

  const remaining = Math.round((goal.target_amount - goal.current_amount) * 100) / 100;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const addAmount = parseFloat(amount);

    if (!addAmount || addAmount <= 0) return;

    const newAmount = Math.round((goal.current_amount + addAmount) * 100) / 100;
    const isCompleted = newAmount >= goal.target_amount;

    await updateGoal.mutateAsync({
      id: goal.id,
      current_amount: newAmount,
      is_completed: isCompleted,
    });

    setOpen(false);
    setAmount("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setAmount("");
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
            disabled={updateGoal.isPending || !amount}
          >
            {updateGoal.isPending ? "Adding..." : "Add Funds"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
