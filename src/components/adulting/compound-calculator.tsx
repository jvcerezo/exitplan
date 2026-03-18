"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export function CompoundCalculator() {
  const [principal, setPrincipal] = useState("10000");
  const [monthly, setMonthly] = useState("3000");
  const [rate, setRate] = useState("8");
  const [years, setYears] = useState("10");

  const p = parseFloat(principal) || 0;
  const m = parseFloat(monthly) || 0;
  const r = (parseFloat(rate) || 0) / 100 / 12;
  const n = (parseFloat(years) || 0) * 12;

  const { futureValue, totalContributions, totalInterest } = useMemo(() => {
    if (n === 0) return { futureValue: p, totalContributions: p, totalInterest: 0 };
    const fvPrincipal = p * Math.pow(1 + r, n);
    const fvContributions = r > 0 ? m * ((Math.pow(1 + r, n) - 1) / r) : m * n;
    const fv = fvPrincipal + fvContributions;
    const contrib = p + m * n;
    return {
      futureValue: Math.round(fv * 100) / 100,
      totalContributions: Math.round(contrib * 100) / 100,
      totalInterest: Math.round((fv - contrib) * 100) / 100,
    };
  }, [p, m, r, n]);

  const multiplier = totalContributions > 0 ? futureValue / totalContributions : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label className="text-xs">Initial Amount (₱)</Label>
          <Input type="number" min="0" max="999999999" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Monthly Contribution (₱)</Label>
          <Input type="number" min="0" max="9999999" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Annual Return (%)</Label>
          <Input type="number" min="0" max="100" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Years</Label>
          <Input type="number" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)} className="h-9" />
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 grid-cols-3">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[10px] text-muted-foreground">Future Value</p>
          <p className="text-lg font-bold text-primary mt-0.5">{formatCurrency(futureValue)}</p>
          <p className="text-[10px] text-muted-foreground">{multiplier.toFixed(1)}× your money</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-[10px] text-muted-foreground">Total Invested</p>
          <p className="text-lg font-bold mt-0.5">{formatCurrency(totalContributions)}</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
          <p className="text-[10px] text-muted-foreground">Interest Earned</p>
          <p className="text-lg font-bold text-green-600 mt-0.5">{formatCurrency(totalInterest)}</p>
        </div>
      </div>

      {futureValue > 0 && (
        <div className="rounded-xl bg-muted/30 p-3">
          <div className="flex justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>Invested ({((totalContributions / futureValue) * 100).toFixed(0)}%)</span>
            <span>Interest ({((totalInterest / futureValue) * 100).toFixed(0)}%)</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden flex">
            <div className="h-full bg-primary/60 rounded-l-full" style={{ width: `${(totalContributions / futureValue) * 100}%` }} />
            <div className="h-full bg-green-500/60 rounded-r-full flex-1" />
          </div>
        </div>
      )}
    </div>
  );
}
