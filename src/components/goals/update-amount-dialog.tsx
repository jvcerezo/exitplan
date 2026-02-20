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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateGoal } from "@/hooks/use-goals";
import type { Goal } from "@/lib/types/database";
import { formatCurrency } from "@/lib/utils";

export function UpdateAmountDialog({ goal }: { goal: Goal }) {
  const [open, setOpen] = useState(false);
  const updateGoal = useUpdateGoal();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const addAmount = parseFloat(formData.get("amount") as string);

    if (!addAmount || addAmount <= 0) return;

    const newAmount = Math.round((goal.current_amount + addAmount) * 100) / 100;
    const isCompleted = newAmount >= goal.target_amount;

    await updateGoal.mutateAsync({
      id: goal.id,
      current_amount: newAmount,
      is_completed: isCompleted,
    });

    setOpen(false);
  }

  const remaining = Math.round((goal.target_amount - goal.current_amount) * 100) / 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {formatCurrency(remaining)} remaining to reach your goal.
          </p>
          <div className="space-y-2">
            <Label htmlFor="add-amount">Amount to Add</Label>
            <Input
              id="add-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="9999999999.99"
              placeholder="₱0.00"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={updateGoal.isPending}
          >
            {updateGoal.isPending ? "Adding..." : "Add Funds"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
