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
  Split,
  Trash2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { TagInput } from "@/components/ui/tag-input";
import { useAddTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
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

// A split part only needs an account and the amount charged to it.
// Category, description, date are shared across all parts.
interface SplitPart {
  accountId: string;
  amount: string;
}

interface AddTransactionDialogProps {
  type: "expense" | "income";
  defaultAccountId?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function formatAmount(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

function parseAmountInput(value: string): string {
  const stripped = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!stripped) return "";

  const [intPartRaw, ...rest] = stripped.split(".");
  const decimalPart = rest.join("");
  const normalizedInt = intPartRaw.replace(/^0+(?=\d)/, "");

  if (rest.length > 0) {
    return `${normalizedInt || "0"}.${decimalPart}`;
  }

  return normalizedInt;
}

export function AddTransactionDialog({
  type,
  defaultAccountId,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddTransactionDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [resumeAfterAccountOpen, setResumeAfterAccountOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  // Shared fields
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const amountRef = useRef<HTMLInputElement>(null);

  // Normal mode
  const [accountId, setAccountId] = useState(defaultAccountId ?? "");
  const [amount, setAmount] = useState("");

  // Split mode
  const [splitMode, setSplitMode] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [splitParts, setSplitParts] = useState<SplitPart[]>([
    { accountId: defaultAccountId ?? "", amount: "" },
    { accountId: "", amount: "" },
  ]);

  const { data: accounts } = useAccounts();
  const addTransaction = useAddTransaction();

  const activeAccounts = accounts ?? [];
  const hasNoAccounts = accounts !== undefined && activeAccounts.length === 0;
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);
  const currencySymbol =
    CURRENCIES.find((c) => c.code === (selectedAccount?.currency ?? "PHP"))?.symbol ?? "₱";

  // Derived split calculations
  const totalVal = parseFloat(totalAmount) || 0;
  const allocated = splitParts.reduce((s, p) => s + (parseFloat(p.amount) || 0), 0);
  const remaining = Math.round((totalVal - allocated) * 100) / 100;
  const isBalanced = totalVal > 0 && Math.abs(remaining) < 0.01;
  const selectedSplitAccounts = splitParts
    .map((p) => p.accountId)
    .filter((id) => id.length > 0);
  const hasDuplicateSplitAccounts =
    new Set(selectedSplitAccounts).size !== selectedSplitAccounts.length;
  const allSplitAccountsSelected =
    splitParts.length > 0 && splitParts.every((p) => p.accountId.length > 0);
  const canAddMoreSplitParts = splitParts.length < activeAccounts.length;

  const label = type === "expense" ? "Expense" : "Income";
  const categories = type === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  // Reset on open
  useEffect(() => {
    if (open) {
      const firstId = defaultAccountId || activeAccounts[0]?.id || "";
      setCategory("");
      setCustomCategory("");
      setTags([]);
      setAccountId(firstId);
      setAmount("");
      setSplitMode(false);
      setTotalAmount("");
      setSplitParts([
        { accountId: firstId, amount: "" },
        { accountId: "", amount: "" },
      ]);
      setTimeout(() => amountRef.current?.focus(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (open && hasNoAccounts && type === "income" && !accountDialogOpen) {
      setResumeAfterAccountOpen(true);
      setOpen(false);
      setAccountDialogOpen(true);
    }
  }, [accountDialogOpen, hasNoAccounts, open, setOpen, type]);

  useEffect(() => {
    if (!accountDialogOpen && resumeAfterAccountOpen && activeAccounts.length > 0) {
      setResumeAfterAccountOpen(false);
      setOpen(true);
    }
  }, [accountDialogOpen, activeAccounts.length, resumeAfterAccountOpen, setOpen]);

  function openAccountFlow(options?: { reopenTransaction?: boolean }) {
    setResumeAfterAccountOpen(Boolean(options?.reopenTransaction));
    setOpen(false);
    setAccountDialogOpen(true);
  }

  function updatePart(index: number, field: keyof SplitPart, value: string) {
    setSplitParts((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  }

  function addPart() {
    if (!canAddMoreSplitParts) return;
    setSplitParts((prev) => [...prev, { accountId: "", amount: "" }]);
  }

  function removePart(index: number) {
    if (splitParts.length <= 2) return;
    setSplitParts((prev) => prev.filter((_, i) => i !== index));
  }

  function autoFillLast() {
    if (remaining <= 0) return;
    setSplitParts((prev) =>
      prev.map((p, i) => (i === prev.length - 1 ? { ...p, amount: remaining.toFixed(2) } : p))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (hasNoAccounts) {
      toast.error("Create an account first before adding income or expense");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const date = (formData.get("date") as string) || new Date().toISOString().split("T")[0];
    const description = (formData.get("description") as string) || "";
    const finalCategory =
      category === "Other" && customCategory.trim()
        ? customCategory.trim().toLowerCase()
        : category.toLowerCase();

    // Validate account balances for expenses
    if (type === "expense") {
      if (splitMode) {
        for (const part of splitParts) {
          const partAcc = activeAccounts.find((a) => a.id === part.accountId);
          const partAmount = parseFloat(part.amount) || 0;
          if (partAcc && partAcc.balance - partAmount < 0) {
            toast.error(`Insufficient balance in ${partAcc.name}`);
            return;
          }
        }
      } else {
        const rawAmount = parseFloat(amount);
        if (selectedAccount && selectedAccount.balance - rawAmount < 0) {
          toast.error(`Insufficient balance in ${selectedAccount.name}`);
          return;
        }
      }
    }

    if (splitMode) {
      if (!allSplitAccountsSelected || hasDuplicateSplitAccounts) {
        toast.error("Select different accounts for each split part");
        return;
      }

      const splitGroupId = crypto.randomUUID();
      await Promise.all(
        splitParts.map((part) => {
          const partAcc = activeAccounts.find((a) => a.id === part.accountId);
          const amt =
            type === "expense"
              ? -Math.abs(parseFloat(part.amount))
              : Math.abs(parseFloat(part.amount));
          return addTransaction.mutateAsync({
            amount: amt,
            category: finalCategory,
            description: description || finalCategory,
            date,
            currency: partAcc?.currency ?? "PHP",
            account_id: part.accountId || null,
            tags: tags.length > 0 ? tags : null,
            split_group_id: splitGroupId,
          });
        })
      );
    } else {
      if (!accountId) {
        toast.error("Select an account before adding this transaction");
        return;
      }

      const rawAmount = parseFloat(amount);
      const signedAmount = type === "expense" ? -Math.abs(rawAmount) : Math.abs(rawAmount);
      await addTransaction.mutateAsync({
        amount: signedAmount,
        category: finalCategory,
        currency: selectedAccount?.currency ?? "PHP",
        description: description || finalCategory,
        date,
        account_id: accountId || null,
        tags: tags.length > 0 ? tags : null,
      });
    }

    setOpen(false);
  }

  // Shared bottom fields rendered in both modes
  const sharedFields = (
    <>
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Category</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Ellipsis;
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
                  category === cat
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
            className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-1 focus:ring-ring"
          />
        )}
      </div>

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

      <TagInput tags={tags} onChange={setTags} placeholder="Add tags..." />
    </>
  );

  const dialogContent = (
    <DialogContent className="sm:max-w-md max-h-[90svh] overflow-y-auto overflow-x-hidden">
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <DialogTitle>Add {label}</DialogTitle>
          {type === "expense" && (
            <button
              type="button"
              onClick={() => setSplitMode((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-colors",
                splitMode
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
              )}
            >
              <Split className="h-3 w-3" />
              Split
            </button>
          )}
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* NORMAL MODE */}
        {!splitMode && (
          <>
            {activeAccounts.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Account</p>
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {activeAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccountId(acc.id)}
                      className={cn(
                        "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                        accountId === acc.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasNoAccounts && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      Open an account first
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {type === "income"
                        ? "Income needs an account so ExitPlan knows where to deposit it."
                        : "Expenses need an account so ExitPlan knows where the money came from."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => openAccountFlow({ reopenTransaction: type === "income" })}
                      >
                        Open Account
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setOpen(false)}
                      >
                        Maybe later
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-baseline gap-2 py-2">
              <span className="text-3xl font-bold text-muted-foreground/50">{currencySymbol}</span>
              <input
                ref={amountRef}
                name="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formatAmount(amount)}
                onChange={(e) => setAmount(parseAmountInput(e.target.value))}
                required
                disabled={hasNoAccounts}
                className="w-0 min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30"
              />
            </div>

            {!hasNoAccounts && sharedFields}

            {!hasNoAccounts && (
              <Button
                type="submit"
                className="w-full"
                disabled={addTransaction.isPending || !category || !accountId}
              >
                {addTransaction.isPending ? "Adding..." : `Add ${label}`}
              </Button>
            )}
          </>
        )}

        {/* SPLIT MODE */}
        {splitMode && (
          <>
            {/* Total amount */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Total amount</p>
              <div className="flex items-baseline gap-2 py-1">
                <span className="text-3xl font-bold text-muted-foreground/50">{currencySymbol}</span>
                <input
                  ref={amountRef}
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  max="9999999999.99"
                  placeholder="0.00"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  required
                  className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>

            {/* Account split rows */}
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Split between accounts
              </p>

              <div className="rounded-xl border overflow-hidden divide-y">
                {splitParts.map((part, i) => {
                  const partAcc = activeAccounts.find((a) => a.id === part.accountId);
                  const partSym =
                    CURRENCIES.find((c) => c.code === partAcc?.currency)?.symbol ?? currencySymbol;
                  const isLast = i === splitParts.length - 1;
                  const canAutoFill = isLast && !isBalanced && totalVal > 0 && remaining > 0;

                  return (
                    <div key={i} className="flex items-center gap-2 px-3 py-2.5 bg-background">
                      {/* Account pills */}
                      <div className="flex-1 flex flex-wrap gap-1.5 min-w-0">
                        {activeAccounts.length > 0 ? (
                          activeAccounts.map((acc) => {
                            const selectedInOtherPart = splitParts.some(
                              (otherPart, idx) =>
                                idx !== i && otherPart.accountId === acc.id
                            );

                            return (
                              <button
                                key={acc.id}
                                type="button"
                                onClick={() => updatePart(i, "accountId", acc.id)}
                                disabled={selectedInOtherPart}
                                className={cn(
                                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium transition-colors border",
                                  part.accountId === acc.id
                                    ? "bg-primary/10 text-primary border-primary/40"
                                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
                                  selectedInOtherPart &&
                                    "opacity-40 cursor-not-allowed hover:bg-muted/50"
                                )}
                              >
                                {acc.name}
                              </button>
                            );
                          })
                        ) : (
                          <span className="text-xs text-muted-foreground">No accounts</span>
                        )}
                      </div>

                      {/* Amount */}
                      <div className="flex items-baseline gap-0.5 shrink-0">
                        <span className="text-sm text-muted-foreground/60">{partSym}</span>
                        <input
                          type="number"
                          inputMode="decimal"
                          step="0.01"
                          min="0.01"
                          value={part.amount}
                          onChange={(e) => updatePart(i, "amount", e.target.value)}
                          placeholder="0.00"
                          className="w-24 bg-transparent text-right text-sm font-semibold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>

                      {/* Auto-fill or remove */}
                      <div className="w-14 shrink-0 text-right">
                        {canAutoFill ? (
                          <button
                            type="button"
                            onClick={autoFillLast}
                            className="text-xs text-primary hover:underline"
                          >
                            Auto-fill
                          </button>
                        ) : splitParts.length > 2 ? (
                          <button
                            type="button"
                            onClick={() => removePart(i)}
                            className="inline-flex text-muted-foreground hover:text-destructive transition-colors"
                            aria-label="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer: add account + balance status */}
              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={addPart}
                  disabled={!canAddMoreSplitParts}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="h-3 w-3" />
                  {canAddMoreSplitParts ? "Add account" : "All accounts used"}
                </button>
                {totalVal > 0 && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      isBalanced
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    {isBalanced
                      ? `✓ ${formatCurrency(totalVal)} balanced`
                      : `${formatCurrency(Math.abs(remaining))} ${remaining > 0 ? "left to assign" : "over"}`}
                  </span>
                )}
              </div>
            </div>

            {!hasNoAccounts && sharedFields}

            {!hasNoAccounts && (
              <Button
                type="submit"
                className="w-full"
                disabled={
                  addTransaction.isPending ||
                  !isBalanced ||
                  !category ||
                  !allSplitAccountsSelected ||
                  hasDuplicateSplitAccounts
                }
              >
                {addTransaction.isPending ? "Adding..." : `Add Split ${label}`}
              </Button>
            )}
          </>
        )}
      </form>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <>
        <Dialog open={open} onOpenChange={setOpen}>
          {dialogContent}
        </Dialog>
        <AddAccountDialog
          open={accountDialogOpen}
          onOpenChange={(nextOpen) => {
            setAccountDialogOpen(nextOpen);
            if (!nextOpen && hasNoAccounts) {
              setResumeAfterAccountOpen(false);
            }
          }}
        />
      </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button
            variant={type === "expense" ? "outline" : "default"}
            title={
              hasNoAccounts
                ? type === "income"
                  ? "Open an account first, then add income"
                  : "Open an account first to track expenses"
                : undefined
            }
            onClick={
              hasNoAccounts && type === "income"
                ? (event) => {
                    event.preventDefault();
                    openAccountFlow({ reopenTransaction: true });
                  }
                : undefined
            }
          >
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
      <AddAccountDialog
        open={accountDialogOpen}
        onOpenChange={(nextOpen) => {
          setAccountDialogOpen(nextOpen);
          if (!nextOpen && hasNoAccounts) {
            setResumeAfterAccountOpen(false);
          }
        }}
      />
    </Dialog>
  );
}
