"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { computeIncomeTax, computeFlatTax } from "@/lib/ph-math";
import { TRAIN_TAX_BRACKETS, BIR_DEADLINES } from "@/lib/constants";
import { useAddTaxRecord } from "@/hooks/use-tax";
import { Save, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

type TaxpayerType = "employed" | "self_employed" | "mixed";
type FilingMethod = "graduated" | "flat8";

const CURRENT_YEAR = new Date().getFullYear();

function getActiveBracket(taxableIncome: number) {
  // Use >= so that the exact bracket boundary highlights correctly (e.g. ₱250,000 → 0% bracket)
  for (let i = TRAIN_TAX_BRACKETS.length - 1; i >= 0; i--) {
    if (taxableIncome >= TRAIN_TAX_BRACKETS[i].min) return i;
  }
  return 0;
}

export function TaxCalculator() {
  const [monthlyIncome, setMonthlyIncome] = useState("25000");
  const [otherAnnualIncome, setOtherAnnualIncome] = useState("0");
  const [benefits13th, setBenefits13th] = useState("25000"); // 13th month
  const [taxpayerType, setTaxpayerType] = useState<TaxpayerType>("employed");
  const [filingMethod, setFilingMethod] = useState<FilingMethod>("graduated");
  const [year, setYear] = useState(String(CURRENT_YEAR));

  const addTaxRecord = useAddTaxRecord();

  const grossAnnual = useMemo(() => {
    const monthly = parseFloat(monthlyIncome) || 0;
    const other = parseFloat(otherAnnualIncome) || 0;
    return monthly * 12 + other;
  }, [monthlyIncome, otherAnnualIncome]);

  // Non-taxable: 13th month + bonuses up to ₱90,000
  const nonTaxable = useMemo(() => {
    const b = parseFloat(benefits13th) || 0;
    return Math.min(b, 90000);
  }, [benefits13th]);

  const graduated = useMemo(
    () => computeIncomeTax(grossAnnual, nonTaxable),
    [grossAnnual, nonTaxable]
  );

  const flat8 = useMemo(() => computeFlatTax(grossAnnual), [grossAnnual]);

  const result = filingMethod === "flat8" ? flat8 : graduated;
  const activeBracket = getActiveBracket(result.taxable_income);
  const canUseFlat8 = taxpayerType === "self_employed" || taxpayerType === "mixed";

  async function handleSave() {
    if (grossAnnual <= 0) {
      toast.error("Enter income figures first.");
      return;
    }
    await addTaxRecord.mutateAsync({
      year: parseInt(year),
      quarter: null,
      gross_income: grossAnnual,
      deductions: nonTaxable,
      taxable_income: result.taxable_income,
      tax_due: result.tax_due,
      amount_paid: 0,
      filing_type: "annual",
      taxpayer_type: taxpayerType,
      status: "draft",
    });
  }

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Income Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Basic Salary (₱)</Label>
              <Input
                type="number"
                min="0"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                placeholder="25000"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Other Annual Income (₱)</Label>
              <Input
                type="number"
                min="0"
                value={otherAnnualIncome}
                onChange={(e) => setOtherAnnualIncome(e.target.value)}
                placeholder="0"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">13th Month + Bonuses (₱)</Label>
              <Input
                type="number"
                min="0"
                value={benefits13th}
                onChange={(e) => setBenefits13th(e.target.value)}
                placeholder="25000"
                className="h-9"
              />
              <p className="text-[10px] text-muted-foreground">Exempt up to ₱90,000</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Taxpayer Type</Label>
              <Select
                value={taxpayerType}
                onValueChange={(v) => {
                  setTaxpayerType(v as TaxpayerType);
                  if (v === "employed") setFilingMethod("graduated");
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employed" className="text-xs">Employed</SelectItem>
                  <SelectItem value="self_employed" className="text-xs">Self-Employed / Freelancer</SelectItem>
                  <SelectItem value="mixed" className="text-xs">Mixed Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {canUseFlat8 && (
            <div className="space-y-1.5">
              <Label className="text-xs">Filing Method</Label>
              <div className="flex gap-2">
                {(["graduated", "flat8"] as FilingMethod[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setFilingMethod(m)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      filingMethod === m
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/60 text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {m === "graduated" ? "Graduated Rates" : "8% Flat Rate"}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tax Summary */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Gross Annual Income", value: formatCurrency(grossAnnual), sub: "Before deductions" },
          { label: "Non-Taxable Benefits", value: formatCurrency(nonTaxable), sub: "13th month ≤ ₱90k" },
          { label: "Taxable Income", value: formatCurrency(result.taxable_income), sub: "After exemptions" },
          {
            label: "Annual Tax Due",
            value: formatCurrency(result.tax_due),
            sub: `Effective rate: ${result.effective_rate}%`,
            highlight: true,
          },
        ].map((item) => (
          <Card
            key={item.label}
            className={`rounded-2xl border ${item.highlight ? "border-orange-500/20 bg-orange-500/5" : "border-border/60"}`}
          >
            <CardContent className="p-4">
              <p className="text-[11px] text-muted-foreground">{item.label}</p>
              <p className={`text-xl font-bold mt-0.5 ${item.highlight ? "text-orange-500" : ""}`}>
                {item.value}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quarterly estimates */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Quarterly Filing Estimates</CardTitle>
            <Badge variant="secondary" className="text-[10px]">TRAIN Law 2023+</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {BIR_DEADLINES.map((d, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/30">
              <div>
                <p className="text-xs font-semibold">{d.label}</p>
                <p className="text-[10px] text-muted-foreground">Form {d.form} · Due {d.due}</p>
              </div>
              <p className="text-sm font-bold">
                {d.label === "Annual"
                  ? formatCurrency(result.tax_due)
                  : formatCurrency(result.quarterly_estimate)}
              </p>
            </div>
          ))}
          <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground pt-1">
            <Info className="h-3 w-3 mt-0.5 shrink-0" />
            Quarterly estimates are approximate (annual ÷ 4). Actual amounts depend on actual income per quarter.
          </p>
        </CardContent>
      </Card>

      {/* Tax bracket visualizer */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">TRAIN Law Tax Brackets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TRAIN_TAX_BRACKETS.map((bracket, i) => {
            const isActive = i === activeBracket && result.taxable_income > 0;
            return (
              <div
                key={i}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                  isActive ? "bg-primary/10 border border-primary/30" : "bg-muted/30"
                }`}
              >
                <span className={`font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                  {bracket.max === Infinity
                    ? `Over ${formatCurrency(bracket.min)}`
                    : `${formatCurrency(bracket.min)} – ${formatCurrency(bracket.max)}`}
                </span>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <Badge className="text-[9px] py-0 h-4">Your bracket</Badge>
                  )}
                  <span className={`font-bold ${isActive ? "text-primary" : ""}`}>
                    {(bracket.rate * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Flat 8% comparison if applicable */}
      {canUseFlat8 && (
        <Card className="rounded-2xl border border-border/60 bg-muted/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-semibold">Graduated vs. 8% Flat Rate Comparison</p>
                <div className="flex gap-6 mt-2">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Graduated</p>
                    <p className="text-sm font-bold">{formatCurrency(graduated.tax_due)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">8% Flat</p>
                    <p className="text-sm font-bold">{formatCurrency(flat8.tax_due)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Difference</p>
                    <p className={`text-sm font-bold ${graduated.tax_due > flat8.tax_due ? "text-primary" : "text-destructive"}`}>
                      {graduated.tax_due > flat8.tax_due
                        ? `Save ${formatCurrency(graduated.tax_due - flat8.tax_due)} with 8%`
                        : `Graduated saves ${formatCurrency(flat8.tax_due - graduated.tax_due)}`}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  8% option available to self-employed with gross receipts under ₱3M. No business deductions allowed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save */}
      <div className="flex items-center gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Tax Year</Label>
          <Input
            type="number"
            min="2020"
            max="2030"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="h-9 w-28"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={addTaxRecord.isPending || grossAnnual <= 0}
          className="mt-5"
          size="sm"
        >
          <Save className="h-4 w-4 mr-2" />
          {addTaxRecord.isPending ? "Saving…" : "Save as Draft"}
        </Button>
      </div>
    </div>
  );
}
