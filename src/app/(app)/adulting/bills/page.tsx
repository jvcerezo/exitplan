"use client";

import Link from "next/link";
import { Receipt, ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useBillsSummary } from "@/hooks/use-bills";
import { AddBillDialog } from "@/components/adulting/add-bill-dialog";
import { BillsList } from "@/components/adulting/bills-list";

export default function BillsPage() {
  const { data: summary } = useBillsSummary();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link href="/adulting"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-3 w-3" />
          Adulting Hub
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
              <Receipt className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bills &amp; Subscriptions</h1>
              <p className="text-sm text-muted-foreground">Track recurring expenses and due dates</p>
            </div>
          </div>
          <div className="hidden sm:block"><AddBillDialog /></div>
        </div>
      </div>

      {/* Summary */}
      {summary && summary.count > 0 && (
        <div className="grid gap-3 grid-cols-3">
          <Card className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Monthly Total</p>
              <p className="text-xl font-bold text-indigo-600 mt-0.5">{formatCurrency(summary.totalMonthly)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Annual Cost</p>
              <p className="text-xl font-bold mt-0.5">{formatCurrency(summary.totalMonthly * 12)}</p>
            </CardContent>
          </Card>
          <Card className={`rounded-2xl border ${summary.dueSoon.length > 0 ? "border-orange-500/20 bg-orange-500/5" : "border-border/60"}`}>
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">Due This Week</p>
              <p className={`text-xl font-bold mt-0.5 ${summary.dueSoon.length > 0 ? "text-orange-500" : ""}`}>
                {summary.dueSoon.length}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Due soon alert */}
      {summary && summary.dueSoon.length > 0 && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-orange-600">Due within 7 days</p>
            <ul className="mt-1 space-y-0.5">
              {summary.dueSoon.map((b) => (
                <li key={b.id} className="text-[11px] text-muted-foreground">
                  {b.name} — Day {b.due_day} · {formatCurrency(b.amount)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {summary && Object.keys(summary.byCategory).length > 0 && (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(summary.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, amount]) => (
              <div key={cat} className="rounded-xl border border-border/60 bg-card/80 p-3">
                <p className="text-[10px] font-medium text-muted-foreground capitalize">
                  {cat.replace(/_/g, " ")}
                </p>
                <p className="text-sm font-bold mt-0.5">{formatCurrency(amount)}/mo</p>
              </div>
            ))}
        </div>
      )}

      {/* Mobile add */}
      <div className="sm:hidden"><AddBillDialog /></div>

      {/* Bills list */}
      <BillsList />
    </div>
  );
}
