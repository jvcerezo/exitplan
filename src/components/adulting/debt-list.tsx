"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useDebts, useUpdateDebt, useDeleteDebt, useRecordDebtPayment } from "@/hooks/use-debts";
import { useAccounts } from "@/hooks/use-accounts";
import { CheckCircle2, Trash2, CreditCard, Building2, Car, Home, Wallet, CircleDollarSign, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { Debt } from "@/lib/types/database";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  credit_card: { label: "Credit Card", icon: CreditCard, color: "text-red-500", bg: "bg-red-500/10" },
  personal_loan: { label: "Personal Loan", icon: Building2, color: "text-orange-500", bg: "bg-orange-500/10" },
  sss_loan: { label: "SSS Loan", icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
  pagibig_loan: { label: "Pag-IBIG Loan", icon: Home, color: "text-green-500", bg: "bg-green-500/10" },
  home_loan: { label: "Home Loan", icon: Home, color: "text-teal-500", bg: "bg-teal-500/10" },
  car_loan: { label: "Car Loan", icon: Car, color: "text-purple-500", bg: "bg-purple-500/10" },
  salary_loan: { label: "Salary Loan", icon: Building2, color: "text-yellow-600", bg: "bg-yellow-500/10" },
  other: { label: "Other", icon: CreditCard, color: "text-muted-foreground", bg: "bg-muted" },
};

function DebtRow({ debt, accounts }: { debt: Debt; accounts: { id: string; name: string }[] }) {
  const update = useUpdateDebt();
  const remove = useDeleteDebt();
  const recordPayment = useRecordDebtPayment();

  const [showPayDialog, setShowPayDialog] = useState(false);
  const [payAmount, setPayAmount] = useState(String(debt.minimum_payment || ""));
  const [pickedAccountId, setPickedAccountId] = useState<string>(debt.account_id ?? "");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = TYPE_META[debt.type] ?? TYPE_META.other;
  const Icon = meta.icon;
  const paidPct = debt.original_amount > 0
    ? Math.max(0, Math.min(100, ((debt.original_amount - debt.current_balance) / debt.original_amount) * 100))
    : 0;
  const linkedAccount = accounts.find((a) => a.id === debt.account_id);

  function openPayDialog() {
    setPayAmount(String(debt.minimum_payment || ""));
    setPickedAccountId(debt.account_id ?? (accounts[0]?.id ?? ""));
    setShowPayDialog(true);
  }

  function confirmPayment() {
    const amount = parseFloat(payAmount);
    if (!amount || amount <= 0) return;
    if (!pickedAccountId) return;
    recordPayment.mutate({
      debt,
      paymentAmount: amount,
      accountId: pickedAccountId,
    });
    setShowPayDialog(false);
  }

  function handleReopen() {
    update.mutate({ id: debt.id, is_paid_off: false });
  }

  return (
    <>
      <div className={`p-4 ${debt.is_paid_off ? "opacity-50" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
              <Icon className={`h-4 w-4 ${meta.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold">{debt.name}</p>
                <Badge variant="secondary" className="text-[10px]">{meta.label}</Badge>
                {debt.lender && (
                  <span className="text-[10px] text-muted-foreground">{debt.lender}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(debt.interest_rate * 100).toFixed(2)}% annual · Min: {formatCurrency(debt.minimum_payment)}/mo
                {debt.due_day && ` · Due day ${debt.due_day}`}
              </p>
              {linkedAccount && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Wallet className="h-2.5 w-2.5" />{linkedAccount.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <p className={`text-sm font-bold ${debt.is_paid_off ? "text-primary" : "text-destructive"}`}>
              {debt.is_paid_off ? "Paid Off" : formatCurrency(debt.current_balance)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-destructive hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {!debt.is_paid_off && debt.original_amount > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>Paid {paidPct.toFixed(0)}%</span>
              <span>{formatCurrency(debt.original_amount - debt.current_balance)} of {formatCurrency(debt.original_amount)}</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-primary/60 transition-all" style={{ width: `${paidPct}%` }} />
            </div>
          </div>
        )}

        {/* Actions */}
        {debt.is_paid_off ? (
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-xs text-muted-foreground flex-1">This debt has been fully paid off.</span>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5" onClick={handleReopen}>
              <RotateCcw className="h-3 w-3" />
              Reopen
            </Button>
          </div>
        ) : (
          <div className="mt-3">
            <Button variant="outline" size="sm" className="w-full gap-2 h-8" onClick={openPayDialog}>
              <CircleDollarSign className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove debt?"
        description={`"${debt.name}" will be permanently removed.`}
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(debt.id, { onSuccess: () => setConfirmDelete(false) })}
      />

      {/* Payment dialog */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Record Payment — {debt.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Payment Amount (₱)</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="h-9"
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground">
                Remaining balance: {formatCurrency(debt.current_balance)}
                {debt.minimum_payment > 0 && ` · Min: ${formatCurrency(debt.minimum_payment)}`}
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Pay From Account <span className="text-destructive">*</span></Label>
              <Select value={pickedAccountId} onValueChange={setPickedAccountId}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select account…" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <p className="text-[10px] text-destructive">Add an account first before recording payments.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowPayDialog(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={confirmPayment}
                disabled={recordPayment.isPending || !parseFloat(payAmount) || !pickedAccountId}
              >
                {recordPayment.isPending ? "Saving…" : "Pay & Record"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DebtList() {
  const { data, isLoading } = useDebts();
  const { data: accounts } = useAccounts();
  const accountList = accounts ?? [];

  if (isLoading) return (
    <Card className="rounded-2xl border border-border/60">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">Loading debts…</CardContent>
    </Card>
  );

  if (!data || data.length === 0) return (
    <Card className="rounded-2xl border border-border/60">
      <CardContent className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No debts tracked yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Add a debt above to start tracking your payoff progress.</p>
      </CardContent>
    </Card>
  );

  const active = data.filter((d) => !d.is_paid_off);
  const paidOff = data.filter((d) => d.is_paid_off);

  return (
    <Card className="rounded-2xl border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Active Debts
          {active.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({active.length})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {active.map((debt, i) => (
          <div key={debt.id}>
            {i > 0 && <Separator />}
            <DebtRow debt={debt} accounts={accountList} />
          </div>
        ))}
        {paidOff.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Paid Off ({paidOff.length})
              </p>
            </div>
            {paidOff.map((debt, i) => (
              <div key={debt.id}>
                {i > 0 && <Separator />}
                <DebtRow debt={debt} accounts={accountList} />
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
