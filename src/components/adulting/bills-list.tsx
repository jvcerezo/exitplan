"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useBills, useUpdateBill, useDeleteBill, useMarkBillPaid } from "@/hooks/use-bills";
import { useAccounts } from "@/hooks/use-accounts";
import {
  Zap, Droplets, Wifi, Smartphone, Tv, Home, Building2, Play,
  Monitor, Dumbbell, MoreHorizontal, CheckCircle2, Trash2, AlertCircle, Wallet,
} from "lucide-react";
import type { Bill } from "@/lib/types/database";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const CATEGORY_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  electricity: { label: "Electricity", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  water: { label: "Water", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
  internet: { label: "Internet", icon: Wifi, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  mobile: { label: "Mobile", icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10" },
  cable_tv: { label: "Cable TV", icon: Tv, color: "text-purple-500", bg: "bg-purple-500/10" },
  rent: { label: "Rent", icon: Home, color: "text-orange-500", bg: "bg-orange-500/10" },
  association_dues: { label: "Association", icon: Building2, color: "text-teal-500", bg: "bg-teal-500/10" },
  streaming: { label: "Streaming", icon: Play, color: "text-red-500", bg: "bg-red-500/10" },
  software: { label: "Software", icon: Monitor, color: "text-cyan-500", bg: "bg-cyan-500/10" },
  gym: { label: "Gym", icon: Dumbbell, color: "text-pink-500", bg: "bg-pink-500/10" },
  other: { label: "Other", icon: MoreHorizontal, color: "text-muted-foreground", bg: "bg-muted" },
};

const FREQ_MONTHLY: Record<string, number> = {
  monthly: 1, quarterly: 1 / 3, semi_annual: 1 / 6, annual: 1 / 12,
};

const FREQ_LABEL: Record<string, string> = {
  monthly: "/mo", quarterly: "/qtr", semi_annual: "/6mo", annual: "/yr",
};

function isDueSoon(dueDay: number | null): boolean {
  if (!dueDay) return false;
  const now = new Date();
  // Compare against today midnight so bills due today are included
  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let next = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (next < todayMidnight) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }
  const daysUntil = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return daysUntil >= 0 && daysUntil <= 7;
}

function BillRow({ bill, accounts }: { bill: Bill; accounts: { id: string; name: string }[] }) {
  const remove = useDeleteBill();
  const markPaid = useMarkBillPaid();
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [pickedAccountId, setPickedAccountId] = useState<string>("none");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = CATEGORY_META[bill.category] ?? CATEGORY_META.other;
  const Icon = meta.icon;
  const monthlyEquiv = bill.amount * (FREQ_MONTHLY[bill.billing_cycle] ?? 1);
  const dueSoon = isDueSoon(bill.due_day);
  const paidToday = bill.last_paid_date === new Date().toISOString().slice(0, 10);
  const linkedAccount = accounts.find((a) => a.id === bill.account_id);

  function handleMarkPaid() {
    if (bill.account_id) {
      // Account already linked — create transaction immediately
      markPaid.mutate({ bill });
    } else {
      // No account linked — prompt user to pick one or skip
      setPickedAccountId("none");
      setShowAccountPicker(true);
    }
  }

  function confirmMarkPaid() {
    markPaid.mutate({
      bill,
      accountId: pickedAccountId !== "none" ? pickedAccountId : undefined,
    });
    setShowAccountPicker(false);
  }

  return (
    <>
      <div className={`p-4 ${!bill.is_active ? "opacity-50" : ""}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
              <Icon className={`h-4 w-4 ${meta.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{bill.name}</p>
                {dueSoon && bill.is_active && (
                  <Badge variant="destructive" className="text-[10px] gap-1">
                    <AlertCircle className="h-2.5 w-2.5" />Due day {bill.due_day}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {bill.provider && `${bill.provider} · `}
                {formatCurrency(bill.amount)}{FREQ_LABEL[bill.billing_cycle]}
                {bill.billing_cycle !== "monthly" && ` (≈ ${formatCurrency(monthlyEquiv)}/mo)`}
              </p>
              {linkedAccount && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Wallet className="h-2.5 w-2.5" />{linkedAccount.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={handleMarkPaid}
              disabled={markPaid.isPending}
              title={bill.account_id ? "Mark paid & record transaction" : "Mark as paid"}
            >
              <CheckCircle2 className={`h-3.5 w-3.5 ${paidToday ? "text-primary" : "text-muted-foreground"}`} />
            </Button>
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
      </div>

      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Remove bill?"
        description={`"${bill.name}" will be permanently removed.`}
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(bill.id, { onSuccess: () => setConfirmDelete(false) })}
      />

      {/* Account picker dialog — shown when bill has no account linked */}
      <Dialog open={showAccountPicker} onOpenChange={setShowAccountPicker}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Mark "{bill.name}" as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Select which account to deduct {formatCurrency(bill.amount)} from.
              </p>
              <Select value={pickedAccountId} onValueChange={setPickedAccountId}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select an account…" /></SelectTrigger>
                <SelectContent>
                  {accounts.map((a) => (
                    <SelectItem key={a.id} value={a.id} className="text-xs">{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAccountPicker(false)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={confirmMarkPaid} disabled={markPaid.isPending || pickedAccountId === "none"}>
                {markPaid.isPending ? "Saving…" : "Pay & Record"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function BillsList() {
  const { data, isLoading } = useBills();
  const { data: accounts } = useAccounts();
  const accountList = accounts ?? [];

  if (isLoading) return (
    <Card className="rounded-2xl border border-border/60">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">Loading bills…</CardContent>
    </Card>
  );

  if (!data || data.length === 0) return (
    <Card className="rounded-2xl border border-border/60">
      <CardContent className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No bills tracked yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Add your recurring bills and subscriptions above.</p>
      </CardContent>
    </Card>
  );

  const active = data.filter((b) => b.is_active);
  const inactive = data.filter((b) => !b.is_active);

  return (
    <Card className="rounded-2xl border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Bills &amp; Subscriptions
          {active.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({active.length} active)</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {active.map((bill, i) => (
          <div key={bill.id}>
            {i > 0 && <Separator />}
            <BillRow bill={bill} accounts={accountList} />
          </div>
        ))}
        {inactive.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Inactive ({inactive.length})</p>
            </div>
            {inactive.map((bill, i) => (
              <div key={bill.id}>
                {i > 0 && <Separator />}
                <BillRow bill={bill} accounts={accountList} />
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
