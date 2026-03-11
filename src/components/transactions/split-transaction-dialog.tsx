"use client";

import { useState } from "react";
import { Plus, Trash2, Split } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import type { Transaction } from "@/lib/types/database";

interface SplitPart {
  amount: string;
  category: string;
  description: string;
  accountId: string;
}

interface SplitTransactionDialogProps {
  transaction: Transaction;
}

export function SplitTransactionDialog({ transaction }: SplitTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const addTransaction = useAddTransaction();
  const deleteTransaction = useDeleteTransaction();
  const { data: accounts } = useAccounts();
  const activeAccounts = accounts?.filter((a) => !a.is_archived) ?? [];

  const isExpense = transaction.amount < 0;
  const totalAbs = Math.abs(transaction.amount);
  const categories = isExpense ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const [parts, setParts] = useState<SplitPart[]>([
    {
      amount: (totalAbs / 2).toFixed(2),
      category: transaction.category,
      description: transaction.description,
      accountId: transaction.account_id ?? "",
    },
    {
      amount: (totalAbs / 2).toFixed(2),
      category: "",
      description: "",
      accountId: transaction.account_id ?? "",
    },
  ]);

  const allocatedTotal = parts.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const remaining = Math.round((totalAbs - allocatedTotal) * 100) / 100;
  const isBalanced = Math.abs(remaining) < 0.01;

  function updatePart(index: number, field: keyof SplitPart, value: string) {
    setParts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function addPart() {
    setParts((prev) => [
      ...prev,
      { amount: "0.00", category: "", description: "", accountId: transaction.account_id ?? "" },
    ]);
  }

  function removePart(index: number) {
    if (parts.length <= 2) return;
    setParts((prev) => prev.filter((_, i) => i !== index));
  }

  // Auto-fill last part's amount to balance
  function autoBalance() {
    if (parts.length < 2) return;
    const otherSum = parts.slice(0, -1).reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
    const lastAmt = Math.max(0, Math.round((totalAbs - otherSum) * 100) / 100);
    setParts((prev) =>
      prev.map((p, i) => (i === prev.length - 1 ? { ...p, amount: lastAmt.toFixed(2) } : p))
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isBalanced) return;

    const splitGroupId = crypto.randomUUID();

    await Promise.all(
      parts.map((part) => {
        const amt = isExpense ? -Math.abs(parseFloat(part.amount)) : Math.abs(parseFloat(part.amount));
        return addTransaction.mutateAsync({
          amount: amt,
          category: part.category || transaction.category,
          description: part.description || transaction.description,
          date: transaction.date,
          currency: transaction.currency,
          account_id: part.accountId || null,
          tags: transaction.tags,
          transfer_id: splitGroupId,
        });
      })
    );

    // Delete the original transaction now that it's been split
    await deleteTransaction.mutateAsync(transaction.id);

    setOpen(false);
  }

  const currencySymbol =
    CURRENCIES.find((c) => c.code === transaction.currency)?.symbol ?? "₱";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label="Split transaction">
          <Split className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Split Transaction</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Source transaction summary */}
          <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm flex items-center justify-between">
            <span className="text-muted-foreground truncate max-w-[60%]">{transaction.description}</span>
            <span className="font-semibold">{currencySymbol}{totalAbs.toFixed(2)}</span>
          </div>

          {/* Split parts */}
          <div className="space-y-3">
            {parts.map((part, i) => {
              const selectedAccount = activeAccounts.find((a) => a.id === part.accountId);
              const sym = CURRENCIES.find((c) => c.code === selectedAccount?.currency)?.symbol ?? currencySymbol;
              return (
                <div key={i} className="rounded-lg border p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Part {i + 1}</span>
                    {parts.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removePart(i)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove part"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-bold text-muted-foreground/50">{sym}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      value={part.amount}
                      onChange={(e) => updatePart(i, "amount", e.target.value)}
                      className="flex-1 bg-transparent text-lg font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    {i === parts.length - 1 && !isBalanced && (
                      <button
                        type="button"
                        onClick={autoBalance}
                        className="text-xs text-primary hover:underline shrink-0"
                      >
                        Auto-fill
                      </button>
                    )}
                  </div>

                  {/* Category pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => updatePart(i, "category", cat.toLowerCase())}
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-medium transition-colors border",
                          part.category === cat.toLowerCase()
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Description + Account */}
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={part.description}
                      onChange={(e) => updatePart(i, "description", e.target.value)}
                      placeholder="Note..."
                      className="rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
                    />
                    {activeAccounts.length > 0 && (
                      <select
                        value={part.accountId}
                        onChange={(e) => updatePart(i, "accountId", e.target.value)}
                        className="rounded-lg border bg-background px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">No account</option>
                        {activeAccounts.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Balance indicator */}
          <div className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2 text-sm",
            isBalanced ? "bg-green-500/10" : "bg-amber-500/10"
          )}>
            <span className={cn("font-medium", isBalanced ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400")}>
              {isBalanced ? "✓ Balanced" : `${formatCurrency(Math.abs(remaining))} ${remaining > 0 ? "unallocated" : "over"}`}
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(allocatedTotal)} / {formatCurrency(totalAbs)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={addPart} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Part
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isBalanced || addTransaction.isPending || parts.some((p) => !p.category)}
            >
              {addTransaction.isPending ? "Splitting..." : "Create Split"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
