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
import {
  useInsurancePolicies, useUpdateInsurancePolicy,
  useDeleteInsurancePolicy, usePayInsurancePremium,
} from "@/hooks/use-insurance";
import { useAccounts } from "@/hooks/use-accounts";
import { Shield, Heart, Car, Home, Trash2, AlertTriangle, Wallet, CircleDollarSign } from "lucide-react";
import type { InsurancePolicy } from "@/lib/types/database";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";

const TYPE_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  life: { label: "Life", icon: Shield, color: "text-blue-500", bg: "bg-blue-500/10" },
  health: { label: "Health", icon: Heart, color: "text-red-500", bg: "bg-red-500/10" },
  hmo: { label: "HMO", icon: Heart, color: "text-pink-500", bg: "bg-pink-500/10" },
  car: { label: "Car", icon: Car, color: "text-purple-500", bg: "bg-purple-500/10" },
  property: { label: "Property", icon: Home, color: "text-teal-500", bg: "bg-teal-500/10" },
  ctpl: { label: "CTPL", icon: Car, color: "text-orange-500", bg: "bg-orange-500/10" },
  other: { label: "Other", icon: Shield, color: "text-muted-foreground", bg: "bg-muted" },
};

const FREQ_LABEL: Record<string, string> = {
  monthly: "mo", quarterly: "qtr", semi_annual: "6mo", annual: "yr",
};

const FREQ_MULTIPLIER: Record<string, number> = {
  monthly: 12, quarterly: 4, semi_annual: 2, annual: 1,
};

function PolicyRow({
  policy,
  accounts,
}: {
  policy: InsurancePolicy;
  accounts: { id: string; name: string }[];
}) {
  const update = useUpdateInsurancePolicy();
  const remove = useDeleteInsurancePolicy();
  const payPremium = usePayInsurancePremium();

  const [showPayDialog, setShowPayDialog] = useState(false);
  const [pickedAccountId, setPickedAccountId] = useState<string>(policy.account_id ?? "none");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meta = TYPE_META[policy.type] ?? TYPE_META.other;
  const Icon = meta.icon;
  const annualPremium = policy.premium_amount * (FREQ_MULTIPLIER[policy.premium_frequency] ?? 12);
  const linkedAccount = accounts.find((a) => a.id === policy.account_id);

  const isRenewingSoon = (() => {
    if (!policy.renewal_date) return false;
    const [y, m, d] = policy.renewal_date.split("-").map(Number);
    const renewal = new Date(y, m - 1, d);
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const days = (renewal.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  })();

  function handlePayPremium() {
    if (policy.account_id) {
      payPremium.mutate({ policy });
    } else {
      setPickedAccountId("none");
      setShowPayDialog(true);
    }
  }

  function confirmPayPremium() {
    payPremium.mutate({
      policy,
      accountId: pickedAccountId !== "none" ? pickedAccountId : undefined,
    });
    setShowPayDialog(false);
  }

  return (
    <>
      <div className={`p-4 ${!policy.is_active ? "opacity-50" : ""}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
              <Icon className={`h-4 w-4 ${meta.color}`} />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{policy.name}</p>
                <Badge variant="secondary" className="text-[10px]">{meta.label}</Badge>
                {isRenewingSoon && (
                  <Badge variant="destructive" className="text-[10px] gap-1">
                    <AlertTriangle className="h-2.5 w-2.5" />Renews soon
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {policy.provider && `${policy.provider} · `}
                {formatCurrency(policy.premium_amount)}/{FREQ_LABEL[policy.premium_frequency]}
                {policy.coverage_amount && ` · Covered: ${formatCurrency(policy.coverage_amount)}`}
              </p>
              {policy.renewal_date && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Renewal: {new Date(policy.renewal_date).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              )}
              {linkedAccount && (
                <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Wallet className="h-2.5 w-2.5" />{linkedAccount.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="text-xs font-bold">{formatCurrency(annualPremium)}/yr</p>
            </div>
            {policy.is_active && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={handlePayPremium}
                disabled={payPremium.isPending}
                title="Pay premium"
              >
                <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => update.mutate({ id: policy.id, is_active: !policy.is_active })}
            >
              <Shield className={`h-3.5 w-3.5 ${policy.is_active ? "text-primary" : "text-muted-foreground"}`} />
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
        title="Remove policy?"
        description={`"${policy.name}" will be permanently removed.`}
        isPending={remove.isPending}
        onConfirm={() => remove.mutate(policy.id, { onSuccess: () => setConfirmDelete(false) })}
      />

      {/* Account picker shown when no account linked */}
      <Dialog open={showPayDialog} onOpenChange={setShowPayDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">Pay Premium — {policy.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Select which account to deduct {formatCurrency(policy.premium_amount)} from.
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
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowPayDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={confirmPayPremium} disabled={payPremium.isPending || pickedAccountId === "none"}>
                {payPremium.isPending ? "Saving…" : "Pay & Record"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function InsuranceList() {
  const { data, isLoading } = useInsurancePolicies();
  const { data: accounts } = useAccounts();
  const accountList = accounts ?? [];

  if (isLoading) return (
    <Card className="rounded-2xl border border-border/60">
      <CardContent className="p-6 text-center text-sm text-muted-foreground">Loading policies…</CardContent>
    </Card>
  );

  if (!data || data.length === 0) return (
    <Card className="rounded-2xl border border-border/60">
      <CardContent className="p-8 text-center">
        <p className="text-sm text-muted-foreground">No insurance policies tracked yet.</p>
        <p className="text-xs text-muted-foreground mt-1">Add your policies above to monitor coverage and premiums.</p>
      </CardContent>
    </Card>
  );

  const active = data.filter((p) => p.is_active);
  const inactive = data.filter((p) => !p.is_active);

  return (
    <Card className="rounded-2xl border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">
          Active Policies
          {active.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({active.length})</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {active.map((policy, i) => (
          <div key={policy.id}>
            {i > 0 && <Separator />}
            <PolicyRow policy={policy} accounts={accountList} />
          </div>
        ))}
        {inactive.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-2">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Inactive ({inactive.length})</p>
            </div>
            {inactive.map((policy, i) => (
              <div key={policy.id}>
                {i > 0 && <Separator />}
                <PolicyRow policy={policy} accounts={accountList} />
              </div>
            ))}
          </>
        )}
      </CardContent>
    </Card>
  );
}
