"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Minus,
  Utensils,
  Home,
  Car,
  Film,
  Heart,
  GraduationCap,
  Banknote,
  Laptop,
  TrendingUp,
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
import { useAddTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  food: Utensils,
  housing: Home,
  transportation: Car,
  entertainment: Film,
  healthcare: Heart,
  education: GraduationCap,
  salary: Banknote,
  freelance: Laptop,
  investment: TrendingUp,
  other: Ellipsis,
};

interface AddTransactionDialogProps {
  type: "expense" | "income";
  defaultAccountId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddTransactionDialog({
  type,
  defaultAccountId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [accountId, setAccountId] = useState(defaultAccountId ?? "");
  const amountRef = useRef<HTMLInputElement>(null);

  const { data: accounts } = useAccounts();
  const addTransaction = useAddTransaction();

  const activeAccounts = accounts?.filter((a) => !a.is_archived) ?? [];
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);
  const currencySymbol =
    CURRENCIES.find((c) => c.code === (selectedAccount?.currency ?? "PHP"))
      ?.symbol ?? "₱";

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Reset & auto-focus amount on open
  useEffect(() => {
    if (open) {
      setCategory("");
      setCustomCategory("");
      setAccountId(defaultAccountId || activeAccounts[0]?.id || "");
      setTimeout(() => amountRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawAmount = parseFloat(formData.get("amount") as string);
    const amount =
      type === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim().toLowerCase()
        : category.toLowerCase();

    await addTransaction.mutateAsync({
      amount,
      category: finalCategory,
      currency: selectedAccount?.currency ?? "PHP",
      description: (formData.get("description") as string) || category,
      date:
        (formData.get("date") as string) ||
        new Date().toISOString().split("T")[0],
      account_id: accountId || null,
    });

    setOpen(false);
  }

  const label = type === "expense" ? "Expense" : "Income";

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add {label}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account selector pills */}
        {activeAccounts.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Account
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
                  {account.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Amount */}
        <div className="flex items-baseline gap-2 py-2">
          <span className="text-3xl font-bold text-muted-foreground/50">
            {currencySymbol}
          </span>
          <input
            ref={amountRef}
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

        {/* Category pills */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Category
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Ellipsis;
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== "Other") setCustomCategory("");
                  }}
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
          {category === "Other" && (
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="What category?"
              autoFocus
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
            />
          )}
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

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={addTransaction.isPending || !category}
        >
          {addTransaction.isPending ? "Adding..." : `Add ${label}`}
        </Button>
      </form>
    </DialogContent>
  );

  // Controlled mode: no trigger, dialog is opened externally
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        {dialogContent}
      </Dialog>
    );
  }

  // Uncontrolled mode: render trigger
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant={type === "income" ? "outline" : "default"}>
            {type === "expense" ? (
              <Minus className="h-4 w-4 mr-2" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Add {label}
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
