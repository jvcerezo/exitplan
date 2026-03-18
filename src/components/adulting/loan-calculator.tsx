"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { calculateMonthlyPayment, calculateTotalInterest } from "@/lib/debt-math";

export function LoanCalculator() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("5");

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) / 100 || 0;
  const months = (parseFloat(years) || 0) * 12;

  const monthly = useMemo(() => p > 0 && months > 0 ? calculateMonthlyPayment(p, r, months) : 0, [p, r, months]);
  const totalInterest = useMemo(() => p > 0 && months > 0 ? calculateTotalInterest(p, r, months) : 0, [p, r, months]);
  const totalPaid = monthly * months;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Loan Amount (₱)</Label>
          <Input type="number" min="0" max="999999999" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Annual Interest Rate (%)</Label>
          <Input type="number" min="0" max="100" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Loan Term (years)</Label>
          <Input type="number" min="1" max="30" value={years} onChange={(e) => setYears(e.target.value)} className="h-9" />
        </div>
      </div>
      <Separator />
      <div className="grid gap-3 grid-cols-3">
        <div>
          <p className="text-[11px] text-muted-foreground">Monthly Payment</p>
          <p className="text-xl font-bold text-primary mt-0.5">{formatCurrency(monthly)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Total Interest</p>
          <p className="text-xl font-bold text-destructive mt-0.5">{formatCurrency(totalInterest)}</p>
        </div>
        <div>
          <p className="text-[11px] text-muted-foreground">Total Paid</p>
          <p className="text-xl font-bold mt-0.5">{formatCurrency(totalPaid)}</p>
        </div>
      </div>
      {p > 0 && totalPaid > 0 && (
        <div className="rounded-xl bg-muted/30 p-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Principal ({Math.round((p / totalPaid) * 100)}%)</span>
            <span>Interest ({Math.round((totalInterest / totalPaid) * 100)}%)</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-primary rounded-l-full" style={{ width: `${(p / totalPaid) * 100}%` }} />
            <div className="h-full bg-destructive/60 rounded-r-full flex-1" />
          </div>
        </div>
      )}
    </div>
  );
}
