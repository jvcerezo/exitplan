"use client";

import { useState, useEffect } from "react";
import { Coins } from "lucide-react";
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
import { useAddFundsToGoal } from "@/hooks/use-goals";
import { useAccounts } from "@/hooks/use-accounts";
import type { Goal } from "@/lib/types/database";
import { CURRENCIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

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

export function UpdateAmountDialog({
  goal,
  triggerLabel = "Add Funds",
}: {
  goal: Goal;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const addFundsToGoal = useAddFundsToGoal();
  const { data: accounts } = useAccounts();

  const activeAccounts = accounts ?? [];
  const selectedAccount = activeAccounts.find((a) => a.id === accountId);
  const remaining = Math.round((goal.target_amount - goal.current_amount) * 100) / 100;
  const isPending = addFundsToGoal.isPending;
  const accountCurrencySymbol =
    CURRENCIES.find((currency) => currency.code === selectedAccount?.currency)?.symbol ?? "₱";

  // Default to linked account on open, or first account if none linked
  useEffect(() => {
    if (open && activeAccounts.length > 0 && !accountId) {
      const linkedId = goal.account_id;
      const defaultId =
        linkedId && activeAccounts.some((a) => a.id === linkedId)
          ? linkedId
          : activeAccounts[0].id;
      setAccountId(defaultId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeAccounts.length]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const addAmount = parseFloat(amount);

    if (!addAmount || addAmount <= 0) return;

    if (!accountId || !selectedAccount) {
      toast.error("Select an account first");
      return;
    }

    if (selectedAccount.balance < addAmount) {
      toast.error("Insufficient account balance");
      return;
    }

    await addFundsToGoal.mutateAsync({
      goalId: goal.id,
      accountId,
      amount: addAmount,
    });

    setOpen(false);
    setAmount("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setAmount("");
          setAccountId("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 rounded-full border-primary/30 bg-primary/5 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
        >
          <Coins className="h-4 w-4 mr-1.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Add Funds to &ldquo;{goal.name}&rdquo;</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {formatCurrency(remaining)} remaining to reach your goal.
          </p>

          {/* Account picker */}
          {activeAccounts.length > 0 && (
            <div className="space-y-1.5 min-w-0">
              <p className="text-xs font-medium text-muted-foreground">From</p>
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

          {/* Big amount input */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Amount to Add
            </p>
            <div className="flex items-baseline gap-2 py-2">
              <span className="text-3xl font-bold text-muted-foreground/50">
                {accountCurrencySymbol}
              </span>
              <input
                name="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formatAmount(amount)}
                onChange={(e) => setAmount(parseAmountInput(e.target.value))}
                required
                autoFocus
                className="w-0 min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !amount || !accountId || activeAccounts.length === 0}
          >
            {isPending ? "Adding..." : "Add Funds"}
          </Button>

          {activeAccounts.length === 0 && (
            <p className="text-xs text-destructive text-center">
              Add an account first before funding goals.
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
