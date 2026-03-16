"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, ArrowLeft, Info, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { calculate13thMonth } from "@/lib/ph-math";

export default function ThirteenthMonthPage() {
  const [basicSalary, setBasicSalary] = useState("25000");
  const [monthsWorked, setMonthsWorked] = useState("12");

  const result = useMemo(() => {
    const salary = parseFloat(basicSalary) || 0;
    const months = Math.min(12, Math.max(0, parseFloat(monthsWorked) || 0));
    return calculate13thMonth(salary, months);
  }, [basicSalary, monthsWorked]);

  const facts = [
    "Presidential Decree 851 mandates 13th month pay for all rank-and-file employees.",
    "Must be paid on or before December 24 each year.",
    "Computed as: (Basic Salary × Months Worked) ÷ 12.",
    "Up to ₱90,000 is exempt from income tax (combined with other bonuses).",
    "Managerial employees are not covered — but many companies still grant it.",
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/adulting"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Adulting Hub
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10">
            <Gift className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">13th Month Pay</h1>
            <p className="text-sm text-muted-foreground">
              Estimate your 13th month and understand the ₱90,000 tax exemption.
            </p>
          </div>
        </div>
      </div>

      {/* Calculator */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Basic Monthly Salary (₱)</Label>
              <Input
                type="number"
                min="0"
                value={basicSalary}
                onChange={(e) => setBasicSalary(e.target.value)}
                placeholder="25000"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Months Worked This Year</Label>
              <Input
                type="number"
                min="0"
                max="12"
                value={monthsWorked}
                onChange={(e) => setMonthsWorked(e.target.value)}
                placeholder="12"
                className="h-9"
              />
              <p className="text-[10px] text-muted-foreground">1 to 12 months</p>
            </div>
          </div>

          <Separator />

          {/* Results */}
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
              <span className="text-xs text-muted-foreground">Gross 13th Month Pay</span>
              <span className="text-sm font-bold">{formatCurrency(result.gross)}</span>
            </div>
            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-green-500/10">
              <div>
                <span className="text-xs font-medium text-green-600">Tax-Exempt Portion</span>
                <p className="text-[10px] text-muted-foreground">Up to ₱90,000 per year</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-green-600">{formatCurrency(result.taxExemptPortion)}</span>
                {result.taxExemptPortion >= 90000 && (
                  <Badge variant="secondary" className="ml-2 text-[9px]">Capped</Badge>
                )}
              </div>
            </div>
            {result.taxable > 0 && (
              <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-orange-500/10">
                <span className="text-xs font-medium text-orange-600">Taxable Amount</span>
                <span className="text-sm font-bold text-orange-600">{formatCurrency(result.taxable)}</span>
              </div>
            )}
          </div>

          {/* Formula note */}
          <div className="flex items-start gap-2 rounded-xl bg-muted/30 p-3">
            <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              Formula: <span className="font-mono font-medium">(₱{parseFloat(basicSalary || "0").toLocaleString()} × {monthsWorked}) ÷ 12 = {formatCurrency(result.gross)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick tips */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Things You Should Know</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {facts.map((fact, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{fact}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What to do with it */}
      <Card className="rounded-2xl border border-border/60 bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">What Should You Do With It?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { pct: "50%", label: "Emergency Fund or Savings Goal", desc: "Pad your emergency fund or accelerate a savings goal." },
            { pct: "20%", label: "Debt Payments", desc: "Pay down credit card or high-interest loan balances." },
            { pct: "20%", label: "Investments", desc: "Top up your SSS Pension Fund, Pag-IBIG MP2, or mutual fund." },
            { pct: "10%", label: "Treat Yourself", desc: "You earned it. Enjoy responsibly." },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <span className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {item.pct}
              </span>
              <div>
                <p className="text-xs font-semibold">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
