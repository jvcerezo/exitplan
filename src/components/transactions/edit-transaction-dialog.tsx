"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { cn, formatCurrency } from "@/lib/utils";
import type { Transaction } from "@/lib/types/database";
import { TagInput } from "@/components/ui/tag-input";
import { toast } from "sonner";

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

const ALL_KNOWN_CATEGORIES = [
  ...EXPENSE_CATEGORIES.map((c) => c.toLowerCase()),
  ...INCOME_CATEGORIES.map((c) => c.toLowerCase()),
];

export function EditTransactionDialog({
  transaction,
}: {
  transaction: Transaction;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(
    transaction.amount > 0 ? "income" : "expense"
  );

  const isCustomStored =
    transaction.category !== "transfer" &&
    !ALL_KNOWN_CATEGORIES.includes(transaction.category.toLowerCase());

  const [category, setCategory] = useState(
    isCustomStored ? "Other" : transaction.category
  );
  const [customCategory, setCustomCategory] = useState(
    isCustomStored ? transaction.category : ""
  );
  const [accountId, setAccountId] = useState(transaction.account_id ?? "");
  const [tags, setTags] = useState<string[]>(transaction.tags ?? []);
  const updateTransaction = useUpdateTransaction();
  const { data: accounts } = useAccounts();

  const activeAccounts = accounts ?? [];
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);
  const currencySymbol =
    CURRENCIES.find(
      (c) =>
        c.code ===
        (selectedAccount?.currency ?? transaction.currency ?? "PHP")
    )?.symbol ?? "₱";

  const categories =
    type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0].id);
    }
  }, [accountId, activeAccounts]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!accountId) {
      toast.error("Select an account before saving this transaction");
      return;
    }

    const rawAmount = parseFloat(formData.get("amount") as string);
    const amount =
      type === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount);

    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim().toLowerCase()
        : category.toLowerCase();

    await updateTransaction.mutateAsync({
      id: transaction.id,
      amount,
      category: finalCategory,
      currency: selectedAccount?.currency ?? transaction.currency ?? "PHP",
      description: (formData.get("description") as string) || category,
      date: formData.get("date") as string,
      account_id: accountId,
      tags: tags.length > 0 ? tags : null,
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
      <DialogContent className="sm:max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 min-w-0">
          {/* Account selector */}
          {activeAccounts.length > 0 && (
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Account
              </p>
              <Select value={accountId} onValueChange={setAccountId}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Choose an account" />
                </SelectTrigger>
                <SelectContent>
                  {activeAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <span className="truncate font-medium">{account.name}</span>
                        <span className="shrink-0 text-[10px] text-muted-foreground">
                          {account.currency}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedAccount && (
                <div className="rounded-xl border border-border/70 bg-muted/25 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {selectedAccount.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{selectedAccount.type}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-primary">
                      {formatCurrency(selectedAccount.balance, selectedAccount.currency)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Type toggle */}
          <div className="flex rounded-lg border p-0.5">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategory("");
                setCustomCategory("");
              }}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                type === "expense"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategory("");
                setCustomCategory("");
              }}
              className={cn(
                "flex-1 rounded-md py-2 text-sm font-medium transition-colors",
                type === "income"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="flex items-baseline gap-2 py-2">
            <span className="text-3xl font-bold text-muted-foreground/50">
              {currencySymbol}
            </span>
            <input
              name="amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              max="9999999999.99"
              defaultValue={Math.abs(transaction.amount)}
              required
              className="w-0 min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                const isSelected =
                  category.toLowerCase() === cat.toLowerCase();
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

          {/* Description + Date */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] min-w-0">
            <input
              name="description"
              defaultValue={transaction.description}
              placeholder="Add a note..."
              className="w-full min-w-0 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
            />
            <input
              name="date"
              type="date"
              defaultValue={transaction.date}
              required
              className="w-full min-w-0 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          {/* Tags */}
          <TagInput tags={tags} onChange={setTags} placeholder="Add tags..." />

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={updateTransaction.isPending || !category || !accountId}
          >
            {updateTransaction.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
