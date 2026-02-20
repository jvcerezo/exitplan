"use client";

import { useState } from "react";
import {
  Plus,
  Utensils,
  Home,
  Car,
  Film,
  Heart,
  GraduationCap,
  Ellipsis,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddBudget, useBudgetRecommendations } from "@/hooks/use-budgets";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  food: Utensils,
  housing: Home,
  transportation: Car,
  entertainment: Film,
  healthcare: Heart,
  education: GraduationCap,
  other: Ellipsis,
};

interface AddBudgetDialogProps {
  month: string;
  existingCategories: string[];
}

export function AddBudgetDialog({ month, existingCategories }: AddBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const addBudget = useAddBudget();
  const { data: recommendations } = useBudgetRecommendations();

  const suggestion = recommendations?.find(
    (r) => r.category === category
  );

  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await addBudget.mutateAsync({
      category,
      amount: parseFloat(amount),
      month,
    });

    setOpen(false);
    setCategory("");
    setAmount("");
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
          Set a monthly spending limit for a category.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category pills */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Ellipsis;
                const isSelected = category === cat.toLowerCase();
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat.toLowerCase())}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Monthly Limit
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
                min="1"
                max="9999999999.99"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            {suggestion && (
              <button
                type="button"
                onClick={() => setAmount(String(suggestion.suggested))}
                className="text-xs text-primary hover:underline"
              >
                Suggested: {formatCurrency(suggestion.suggested)} (avg{" "}
                {formatCurrency(suggestion.average)}/mo)
              </button>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addBudget.isPending || !category || !amount}
          >
            {addBudget.isPending ? "Adding..." : "Add Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
