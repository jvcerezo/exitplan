"use client";

import Link from "next/link";
import { CreditCard, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useDebtSummary } from "@/hooks/use-debts";
import { AddDebtDialog } from "@/components/adulting/add-debt-dialog";
import { DebtList } from "@/components/adulting/debt-list";
import { PayoffStrategy } from "@/components/adulting/payoff-strategy";
import { AutomationCard } from "@/components/adulting/automation-card";

export default function DebtsPage() {
  const { data: summary } = useDebtSummary();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Debt Manager</h1>
              <p className="text-sm text-muted-foreground">Track balances · Avalanche &amp; Snowball payoff</p>
            </div>
          </div>
          <div className="hidden sm:block"><AddDebtDialog /></div>
        </div>
      </div>

      {summary && summary.count > 0 && (
        <div className="grid gap-2.5 grid-cols-3">
          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Total Debt</p>
              <p className="text-sm sm:text-xl font-bold mt-0.5 truncate">{formatCurrency(summary.totalDebt)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Min. Monthly</p>
              <p className="text-sm sm:text-xl font-bold mt-0.5 truncate">{formatCurrency(summary.totalMinimum)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-orange-500/20 bg-orange-500/5">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Highest Rate</p>
              <p className="text-sm sm:text-xl font-bold text-orange-500 mt-0.5">{(summary.highestRate * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Automation */}
      <AutomationCard
        storageKey="exitplan_auto_debts"
        title="Payment Reminders"
        description="Get notified before your debt payments are due."
        features={[
          "Debts with a due day appear in Upcoming Payments on your Home page",
          "Push notifications sent 3 days before due date",
          "Record a payment to create a transaction and reduce your balance",
          "Set a due day on each debt to enable reminders",
        ]}
      />

      <div className="sm:hidden"><AddDebtDialog /></div>
      <DebtList />
      <PayoffStrategy />
    </div>
  );
}
