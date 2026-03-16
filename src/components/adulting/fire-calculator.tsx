"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

/** Years to reach FIRE given current savings, monthly contribution, and expected return */
function yearsToFIRE(
  currentSavings: number,
  monthlyContribution: number,
  annualReturn: number,
  targetCorpus: number
): number {
  if (targetCorpus <= 0) return 0;
  if (annualReturn === 0) {
    if (monthlyContribution <= 0) return Infinity;
    return Math.ceil((targetCorpus - currentSavings) / (monthlyContribution * 12));
  }
  const r = annualReturn / 12;
  let balance = currentSavings;
  let months = 0;
  while (balance < targetCorpus && months < 600) {
    balance = balance * (1 + r) + monthlyContribution;
    months++;
  }
  return months / 12;
}

export function FireCalculator() {
  const [monthlyExpenses, setMonthlyExpenses] = useState("50000");
  const [currentSavings, setCurrentSavings] = useState("0");
  const [monthlyContribution, setMonthlyContribution] = useState("15000");
  const [expectedReturn, setExpectedReturn] = useState("8");
  const [withdrawalRate, setWithdrawalRate] = useState("4"); // safe withdrawal rate %

  const expenses = parseFloat(monthlyExpenses) || 0;
  const savings = parseFloat(currentSavings) || 0;
  const contribution = parseFloat(monthlyContribution) || 0;
  const returnRate = Math.max(0, Math.min(0.5, (parseFloat(expectedReturn) || 0) / 100));
  const swr = Math.max(0.01, Math.min(0.10, (parseFloat(withdrawalRate) || 4) / 100));

  const annualExpenses = expenses * 12;
  const fireNumber = swr > 0 ? annualExpenses / swr : 0;
  const yearsNeeded = useMemo(
    () => yearsToFIRE(savings, contribution, returnRate, fireNumber),
    [savings, contribution, returnRate, fireNumber]
  );
  function fireLabel(years: number) {
    if (!isFinite(years)) return "Never at this rate";
    const y = Math.floor(years);
    const m = Math.round((years - y) * 12);
    return m > 0 ? `${y} years ${m} months` : `${y} years`;
  }

  const savingsRate = expenses > 0 ? (contribution / (contribution + expenses)) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Monthly Expenses (₱)</Label>
          <Input type="number" min="0" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Current Savings / Investments (₱)</Label>
          <Input type="number" min="0" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Monthly Investment Contribution (₱)</Label>
          <Input type="number" min="0" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Expected Annual Return (%)</Label>
          <Input type="number" min="0" max="50" step="0.5" value={expectedReturn} onChange={(e) => setExpectedReturn(e.target.value)} className="h-9" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Safe Withdrawal Rate (%)</Label>
          <Input type="number" min="1" max="10" step="0.5" value={withdrawalRate} onChange={(e) => setWithdrawalRate(e.target.value)} className="h-9" />
          <p className="text-[10px] text-muted-foreground">
            {parseFloat(withdrawalRate) < 1 || parseFloat(withdrawalRate) > 10
              ? <span className="text-orange-500">Clamped to 1–10% range</span>
              : "4% is the common rule"}
          </p>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
          <p className="text-[10px] text-muted-foreground">FIRE Number</p>
          <p className="text-lg font-bold text-primary mt-0.5">{formatCurrency(fireNumber)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Annual / {withdrawalRate}% SWR</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-[10px] text-muted-foreground">Years to FIRE</p>
          <p className="text-lg font-bold mt-0.5">{isFinite(yearsNeeded) ? fireLabel(yearsNeeded) : "∞"}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-3">
          <p className="text-[10px] text-muted-foreground">Annual Expenses</p>
          <p className="text-lg font-bold mt-0.5">{formatCurrency(annualExpenses)}</p>
        </div>
        <div className={`rounded-xl border p-3 ${savingsRate >= 50 ? "border-primary/20 bg-primary/5" : "border-border/60"}`}>
          <p className="text-[10px] text-muted-foreground">Savings Rate</p>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <p className="text-lg font-bold">{savingsRate.toFixed(0)}%</p>
            {savingsRate >= 50 && <Badge className="text-[9px] py-0 h-4">FIRE territory</Badge>}
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-muted/30 p-3">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">FIRE</span> = Financial Independence, Retire Early. Your FIRE number is how much you need invested so that a {withdrawalRate}% annual withdrawal covers your expenses. Increasing your savings rate is the single most powerful lever — at 50%+ savings rate, you could retire in under 17 years.
        </p>
      </div>
    </div>
  );
}
