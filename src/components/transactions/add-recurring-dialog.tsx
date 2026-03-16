"use client";

import { useState, useEffect } from "react";
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
  Repeat,
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
import { useAccounts } from "@/hooks/use-accounts";
import {
  useAddRecurringTransaction,
  useUpdateRecurringTransaction,
} from "@/hooks/use-recurring-transactions";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CURRENCIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RecurringTransaction, RecurringFrequency } from "@/lib/types/database";

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

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: "Day(s)",
  weekly: "Week(s)",
  monthly: "Month(s)",
};

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
  if (rest.length > 0) return `${normalizedInt || "0"}.${decimalPart}`;
  return normalizedInt;
}

interface AddRecurringDialogProps {
  existing?: RecurringTransaction;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddRecurringDialog({
  existing,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: AddRecurringDialogProps) {
  const isEditing = Boolean(existing);
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen! : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const [transactionType, setTransactionType] = useState<"income" | "expense">(
    existing ? (existing.amount > 0 ? "income" : "expense") : "expense"
  );
  const [amount, setAmount] = useState(existing ? String(Math.abs(existing.amount)) : "");
  const [category, setCategory] = useState(existing?.category ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [accountId, setAccountId] = useState(existing?.account_id ?? "");
  const [frequency, setFrequency] = useState<RecurringFrequency>(existing?.frequency ?? "monthly");
  const [intervalCount, setIntervalCount] = useState(String(existing?.interval_count ?? 1));
  const [startDate, setStartDate] = useState(
    existing?.start_date ?? new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(existing?.end_date ?? "");
  const [runTime, setRunTime] = useState(existing?.run_time ?? "");

  const { data: accounts } = useAccounts();
  const addRecurring = useAddRecurringTransaction();
  const updateRecurring = useUpdateRecurringTransaction();

  const activeAccounts = accounts ?? [];
  const categories = transactionType === "expense" ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);
  const currencySymbol =
    CURRENCIES.find((c) => c.code === (selectedAccount?.currency ?? "PHP"))?.symbol ?? "₱";

  // Reset when opened
  useEffect(() => {
    if (open) {
      if (existing) {
        setTransactionType(existing.amount > 0 ? "income" : "expense");
        setAmount(String(Math.abs(existing.amount)));
        setCategory(existing.category);
        setDescription(existing.description ?? "");
        setAccountId(existing.account_id ?? "");
        setFrequency(existing.frequency);
        setIntervalCount(String(existing.interval_count));
        setStartDate(existing.start_date);
        setEndDate(existing.end_date ?? "");
        setRunTime(existing.run_time ?? "");
      } else {
        setTransactionType("expense");
        setAmount("");
        setCategory("");
        setDescription("");
        setAccountId(activeAccounts[0]?.id ?? "");
        setFrequency("monthly");
        setIntervalCount("1");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setRunTime("");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-select first account if none selected
  useEffect(() => {
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0].id);
    }
  }, [accountId, activeAccounts]);

  // Reset category when type changes
  useEffect(() => {
    setCategory("");
  }, [transactionType]);

  const amountNum = parseFloat(amount) || 0;
  const intervalNum = Math.max(1, parseInt(intervalCount, 10) || 1);

  const isValid =
    amountNum > 0 &&
    category.length > 0 &&
    accountId.length > 0 &&
    startDate.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    const signedAmount = transactionType === "expense" ? -amountNum : amountNum;
    const currency = selectedAccount?.currency ?? "PHP";

    const payload = {
      amount: signedAmount,
      category,
      description: description || null,
      currency,
      account_id: accountId,
      frequency,
      interval_count: intervalNum,
      start_date: startDate,
      end_date: endDate || null,
      run_time: runTime || null,
      next_run_date: startDate,
      is_active: true,
      tags: null,
    };

    if (isEditing && existing) {
      await updateRecurring.mutateAsync({ id: existing.id, ...payload });
    } else {
      await addRecurring.mutateAsync(payload);
    }
    setOpen(false);
  }

  const isPending = addRecurring.isPending || updateRecurring.isPending;

  return (
    <>
      {trigger && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>{trigger}</DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <RecurringDialogBody
              isEditing={isEditing}
              transactionType={transactionType}
              setTransactionType={setTransactionType}
              amount={amount}
              setAmount={setAmount}
              category={category}
              setCategory={setCategory}
              description={description}
              setDescription={setDescription}
              accountId={accountId}
              setAccountId={setAccountId}
              frequency={frequency}
              setFrequency={setFrequency}
              intervalCount={intervalCount}
              setIntervalCount={setIntervalCount}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              runTime={runTime}
              setRunTime={setRunTime}
              categories={categories}
              activeAccounts={activeAccounts}
              currencySymbol={currencySymbol}
              isValid={isValid}
              isPending={isPending}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      )}
      {!trigger && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-md">
            <RecurringDialogBody
              isEditing={isEditing}
              transactionType={transactionType}
              setTransactionType={setTransactionType}
              amount={amount}
              setAmount={setAmount}
              category={category}
              setCategory={setCategory}
              description={description}
              setDescription={setDescription}
              accountId={accountId}
              setAccountId={setAccountId}
              frequency={frequency}
              setFrequency={setFrequency}
              intervalCount={intervalCount}
              setIntervalCount={setIntervalCount}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              runTime={runTime}
              setRunTime={setRunTime}
              categories={categories}
              activeAccounts={activeAccounts}
              currencySymbol={currencySymbol}
              isValid={isValid}
              isPending={isPending}
              onSubmit={handleSubmit}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

interface BodyProps {
  isEditing: boolean;
  transactionType: "income" | "expense";
  setTransactionType: (v: "income" | "expense") => void;
  amount: string;
  setAmount: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  accountId: string;
  setAccountId: (v: string) => void;
  frequency: RecurringFrequency;
  setFrequency: (v: RecurringFrequency) => void;
  intervalCount: string;
  setIntervalCount: (v: string) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  runTime: string;
  setRunTime: (v: string) => void;
  categories: readonly string[];
  activeAccounts: { id: string; name: string; currency: string }[];
  currencySymbol: string;
  isValid: boolean;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

function RecurringDialogBody({
  isEditing,
  transactionType,
  setTransactionType,
  amount,
  setAmount,
  category,
  setCategory,
  description,
  setDescription,
  accountId,
  setAccountId,
  frequency,
  setFrequency,
  intervalCount,
  setIntervalCount,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  runTime,
  setRunTime,
  categories,
  activeAccounts,
  currencySymbol,
  isValid,
  isPending,
  onSubmit,
}: BodyProps) {
  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Repeat className="h-4 w-4 text-primary" />
          {isEditing ? "Edit Recurring Transaction" : "New Recurring Transaction"}
        </DialogTitle>
      </DialogHeader>

      <form onSubmit={onSubmit} className="space-y-4 mt-2">
        {/* Type toggle */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setTransactionType("expense")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors",
              transactionType === "expense"
                ? "bg-destructive/10 text-destructive"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Minus className="h-4 w-4" />
            Expense
          </button>
          <button
            type="button"
            onClick={() => setTransactionType("income")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors",
              transactionType === "income"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Plus className="h-4 w-4" />
            Income
          </button>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currencySymbol}
            </span>
            <input
              type="text"
              inputMode="decimal"
              autoFocus
              value={formatAmount(amount)}
              onChange={(e) => setAmount(parseAmountInput(e.target.value))}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</label>
          <div className="grid grid-cols-3 gap-1.5">
            {categories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Ellipsis;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors",
                    category === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Repeat every
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={1}
              max={365}
              value={intervalCount}
              onChange={(e) => setIntervalCount(e.target.value)}
              className="w-20 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <Select value={frequency} onValueChange={(v) => setFrequency(v as RecurringFrequency)}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(FREQUENCY_LABELS) as RecurringFrequency[]).map((f) => (
                  <SelectItem key={f} value={f}>
                    {FREQUENCY_LABELS[f]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Start, End, Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              End date <span className="text-muted-foreground/60">(optional)</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Time <span className="text-muted-foreground/60">(optional — only process after this time)</span>
            </label>
            <input
              type="time"
              value={runTime}
              onChange={(e) => setRunTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Account */}
        {activeAccounts.length > 0 && (
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Account</label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {activeAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Description <span className="text-muted-foreground/60">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Netflix subscription"
            maxLength={200}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <Button type="submit" className="w-full" disabled={!isValid || isPending}>
          {isPending
            ? isEditing
              ? "Saving…"
              : "Creating…"
            : isEditing
              ? "Save changes"
              : "Create recurring transaction"}
        </Button>
      </form>
    </>
  );
}
