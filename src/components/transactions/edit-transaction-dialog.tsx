"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTransaction } from "@/hooks/use-transactions";
import { CATEGORIES } from "@/lib/constants";
import type { Transaction } from "@/lib/types/database";

export function EditTransactionDialog({
  transaction,
}: {
  transaction: Transaction;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(
    transaction.amount > 0 ? "income" : "expense"
  );
  const [category, setCategory] = useState(transaction.category);
  const updateTransaction = useUpdateTransaction();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const rawAmount = parseFloat(formData.get("amount") as string);
    const amount =
      type === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    await updateTransaction.mutateAsync({
      id: transaction.id,
      amount,
      category,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    });

    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Edit transaction">
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Amount</Label>
            <Input
              id="edit-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              max="9999999999.99"
              defaultValue={Math.abs(transaction.amount)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Input
              id="edit-description"
              name="description"
              defaultValue={transaction.description}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
              name="date"
              type="date"
              defaultValue={transaction.date}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={updateTransaction.isPending}
          >
            {updateTransaction.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
