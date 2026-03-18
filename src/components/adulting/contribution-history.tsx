"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useContributions, useUpdateContribution, useDeleteContribution, useMarkContributionPaid } from "@/hooks/use-contributions";
import { useAccounts } from "@/hooks/use-accounts";
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import type { Contribution } from "@/lib/types/database";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { LogPastContributionsDialog } from "@/components/adulting/log-past-contributions-dialog";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  sss: { label: "SSS", color: "text-blue-500", bg: "bg-blue-500/10" },
  philhealth: { label: "PhilHealth", color: "text-green-500", bg: "bg-green-500/10" },
  pagibig: { label: "Pag-IBIG", color: "text-orange-500", bg: "bg-orange-500/10" },
};

function groupByPeriod(contributions: Contribution[]) {
  const map = new Map<string, Contribution[]>();
  for (const c of contributions) {
    const list = map.get(c.period) ?? [];
    list.push(c);
    map.set(c.period, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function PeriodGroup({
  period,
  items,
  accounts,
}: {
  period: string;
  items: Contribution[];
  accounts: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [payingContribution, setPayingContribution] = useState<Contribution | null>(null);
  const [pickedAccountId, setPickedAccountId] = useState<string>("none");

  const updateContribution = useUpdateContribution();
  const deleteContribution = useDeleteContribution();
  const markPaid = useMarkContributionPaid();

  const allPaid = items.every((c) => c.is_paid);
  const employeeTotal = items.reduce((sum, c) => sum + c.employee_share, 0);

  const [yr, mo] = period.split("-");
  const label = new Date(Number(yr), Number(mo) - 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  function handleTogglePaid(c: Contribution) {
    if (c.is_paid) {
      // Un-mark as paid (no transaction reversal, just toggle)
      updateContribution.mutate({ id: c.id, is_paid: false });
    } else {
      // Mark as paid — prompt for account first
      setPickedAccountId("none");
      setPayingContribution(c);
    }
  }

  function confirmPay() {
    if (!payingContribution) return;
    markPaid.mutate({
      contribution: payingContribution,
      accountId: pickedAccountId !== "none" ? pickedAccountId : undefined,
    }, {
      onSuccess: () => setPayingContribution(null),
    });
  }

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {allPaid ? (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="text-left">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-[11px] text-muted-foreground">
              {items.length} contributions · your share: {formatCurrency(employeeTotal)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allPaid ? "default" : "secondary"} className="text-[10px]">
            {allPaid ? "Paid" : "Pending"}
          </Badge>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/60">
          {items.map((c, i) => {
            const meta = TYPE_LABELS[c.type];
            return (
              <div key={c.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">
                        Your share: {formatCurrency(c.employee_share)}
                      </p>
                      {c.employer_share != null && (
                        <p className="text-[11px] text-muted-foreground">
                          Employer: {formatCurrency(c.employer_share)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => handleTogglePaid(c)}
                    >
                      {c.is_paid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => setConfirmDeleteId(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDeleteDialog
        open={confirmDeleteId !== null}
        onOpenChange={(o) => { if (!o) setConfirmDeleteId(null); }}
        title="Delete contribution?"
        description="This will permanently remove this contribution record."
        isPending={deleteContribution.isPending}
        onConfirm={() => {
          if (confirmDeleteId) {
            deleteContribution.mutate(confirmDeleteId, {
              onSuccess: () => setConfirmDeleteId(null),
            });
          }
        }}
      />

      {/* Account picker for marking as paid */}
      <Dialog open={payingContribution !== null} onOpenChange={(o) => { if (!o) setPayingContribution(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm">
              Mark {payingContribution ? TYPE_LABELS[payingContribution.type]?.label : ""} as Paid
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Select which account to deduct {payingContribution ? formatCurrency(payingContribution.employee_share) : ""} from.
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
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setPayingContribution(null)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1" onClick={confirmPay} disabled={markPaid.isPending || pickedAccountId === "none"}>
                {markPaid.isPending ? "Saving…" : "Pay & Record"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function ContributionHistory() {
  const { data, isLoading } = useContributions();
  const { data: accounts } = useAccounts();
  const [logOpen, setLogOpen] = useState(false);

  const accountList = accounts ?? [];

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border/60">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Loading history…
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <>
        <Card className="rounded-2xl border border-border/60">
          <CardContent className="p-8 text-center space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">No saved contributions yet.</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use the calculator above or log existing contributions manually.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setLogOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Log Past Contributions
            </Button>
          </CardContent>
        </Card>
        <LogPastContributionsDialog open={logOpen} onOpenChange={setLogOpen} />
      </>
    );
  }

  const grouped = groupByPeriod(data);

  return (
    <>
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Contribution History</CardTitle>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1.5" onClick={() => setLogOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Log Past
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {grouped.map(([period, items]) => (
            <PeriodGroup key={period} period={period} items={items} accounts={accountList} />
          ))}
        </CardContent>
      </Card>
      <LogPastContributionsDialog open={logOpen} onOpenChange={setLogOpen} />
    </>
  );
}
