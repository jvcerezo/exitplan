"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useDebts } from "@/hooks/use-debts";
import { calculateAvalanche, calculateSnowball } from "@/lib/debt-math";
import { TrendingDown, Zap, Info } from "lucide-react";

export function PayoffStrategy() {
  const { data: debts } = useDebts();
  const [extraBudget, setExtraBudget] = useState("0");

  const activeDebts = useMemo(() => (debts ?? []).filter((d) => !d.is_paid_off), [debts]);

  const totalMinimum = activeDebts.reduce((s, d) => s + d.minimum_payment, 0);
  const extra = parseFloat(extraBudget) || 0;
  const monthlyBudget = totalMinimum + extra;

  const inputs = activeDebts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.current_balance,
    annualRate: d.interest_rate,
    minimumPayment: d.minimum_payment,
  }));

  const avalanche = useMemo(() => calculateAvalanche(inputs, monthlyBudget), [inputs, monthlyBudget]);
  const snowball = useMemo(() => calculateSnowball(inputs, monthlyBudget), [inputs, monthlyBudget]);

  if (activeDebts.length === 0) return null;

  const interestSaved = snowball.totalInterestPaid - avalanche.totalInterestPaid;
  const monthsSaved = snowball.months - avalanche.months;
  const avalancheWins = avalanche.totalInterestPaid <= snowball.totalInterestPaid;

  function monthsToYearsLabel(months: number) {
    if (months >= 600) return "50+ years";
    const y = Math.floor(months / 12);
    const m = months % 12;
    return y > 0 ? `${y}y ${m}m` : `${m} months`;
  }

  const debtNameById = Object.fromEntries(activeDebts.map((d) => [d.id, d.name]));

  return (
    <Card className="rounded-2xl border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Payoff Strategies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Budget input */}
        <div className="space-y-1.5">
          <Label className="text-xs">Extra Monthly Payment on top of minimums (₱)</Label>
          <div className="flex items-center gap-2">
            <Input type="number" min="0" value={extraBudget}
              onChange={(e) => setExtraBudget(e.target.value)}
              placeholder="0" className="h-9 w-40" />
            <span className="text-xs text-muted-foreground">
              Total budget: {formatCurrency(monthlyBudget)}/mo (min: {formatCurrency(totalMinimum)})
            </span>
          </div>
        </div>

        {/* Strategy comparison */}
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Avalanche */}
          <div className={`rounded-xl border p-4 space-y-2 ${avalancheWins ? "border-primary/30 bg-primary/5" : "border-border/60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold">Avalanche</span>
              </div>
              {avalancheWins && <Badge className="text-[9px] py-0 h-4">Recommended</Badge>}
            </div>
            <p className="text-[11px] text-muted-foreground">Highest interest first — saves the most money</p>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payoff time</span>
                <span className="font-bold">{monthsToYearsLabel(avalanche.months)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total interest</span>
                <span className="font-bold text-destructive">{formatCurrency(avalanche.totalInterestPaid)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-bold">{formatCurrency(avalanche.totalPaid)}</span>
              </div>
            </div>
            {avalanche.payoffOrder.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Payoff order:</p>
                <div className="flex flex-wrap gap-1">
                  {avalanche.payoffOrder.map((id, i) => (
                    <span key={id} className="text-[10px] bg-muted rounded-full px-2 py-0.5">
                      {i + 1}. {debtNameById[id] ?? id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Snowball */}
          <div className={`rounded-xl border p-4 space-y-2 ${!avalancheWins ? "border-primary/30 bg-primary/5" : "border-border/60"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-xs font-bold">Snowball</span>
              </div>
              {!avalancheWins && <Badge className="text-[9px] py-0 h-4">Recommended</Badge>}
            </div>
            <p className="text-[11px] text-muted-foreground">Smallest balance first — quick wins for motivation</p>
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Payoff time</span>
                <span className="font-bold">{monthsToYearsLabel(snowball.months)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total interest</span>
                <span className="font-bold text-destructive">{formatCurrency(snowball.totalInterestPaid)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total paid</span>
                <span className="font-bold">{formatCurrency(snowball.totalPaid)}</span>
              </div>
            </div>
            {snowball.payoffOrder.length > 0 && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-1">Payoff order:</p>
                <div className="flex flex-wrap gap-1">
                  {snowball.payoffOrder.map((id, i) => (
                    <span key={id} className="text-[10px] bg-muted rounded-full px-2 py-0.5">
                      {i + 1}. {debtNameById[id] ?? id}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comparison summary */}
        <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-3">
          <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground">
            {Math.abs(interestSaved) > 0
              ? `Avalanche saves ${formatCurrency(Math.abs(interestSaved))} in interest and ${Math.abs(monthsSaved)} month${Math.abs(monthsSaved) !== 1 ? "s" : ""} vs Snowball. Snowball gives you ${snowball.payoffOrder.length > 0 ? snowball.payoffOrder.length : "multiple"} faster early wins for motivation.`
              : "Both strategies yield similar results with your current debts."}
            {" "}Adding extra money each month dramatically reduces total interest paid.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
