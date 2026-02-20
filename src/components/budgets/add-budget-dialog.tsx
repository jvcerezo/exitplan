"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
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
import { useAddBudget } from "@/hooks/use-budgets";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

interface AddBudgetDialogProps {
  month: string;
  existingCategories: string[];
}

export function AddBudgetDialog({ month, existingCategories }: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const addBudget = useAddBudget();

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    await addBudget.mutateAsync({
      category,
      amount: parseFloat(formData.get("amount") as string),
      month,
    });

    setOpen(false);
    setCategory("");
  }

  if (availableCategories.length === 0) {
    return (
      <Button disabled>
        <Plus className="h-4 w-4 mr-2" />
        All Categories Budgeted
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Budget
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Set a monthly spending limit. Your expenses in this category will be tracked against it.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-amount">Monthly Limit</Label>
            <Input
              id="budget-amount"
              name="amount"
              type="number"
              step="0.01"
              min="1"
              max="9999999999.99"
              placeholder="₱0.00"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addBudget.isPending}
          >
            {addBudget.isPending ? "Adding..." : "Add Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
