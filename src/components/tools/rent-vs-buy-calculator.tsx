"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateAmortization, compareRentVsBuy } from "@/lib/housing-math";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return `P${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

export function RentVsBuyCalculator() {
  const [propertyPrice, setPropertyPrice] = useState("2000000");
  const [downPercent, setDownPercent] = useState("10");
  const [rent, setRent] = useState("12000");
  const [rentIncrease, setRentIncrease] = useState("5");
  const [assocDues, setAssocDues] = useState("3000");

  const p = (v: string) => parseFloat(v.replace(/,/g, "")) || 0;

  const price = p(propertyPrice);
  const dp = p(downPercent);
  const loanAmount = price - price * (dp / 100);
  const loan = calculateAmortization(loanAmount, 0.0575, 20);

  const comparison = compareRentVsBuy({
    propertyPrice: price,
    downPaymentPercent: dp,
    loanRate: 0.0575,
    loanTermYears: 20,
    monthlyRent: p(rent),
    annualRentIncrease: p(rentIncrease) / 100,
    annualPropertyAppreciation: 0.03,
    monthlyAssociationDues: p(assocDues),
    annualPropertyTaxRate: 0.01,
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Scenario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Price" value={propertyPrice} onChange={setPropertyPrice} prefix="P" />
            <Field label="Down Payment %" value={downPercent} onChange={setDownPercent} suffix="%" />
            <Field label="Monthly Rent" value={rent} onChange={setRent} prefix="P" />
            <Field label="Annual Rent Increase" value={rentIncrease} onChange={setRentIncrease} suffix="%" />
            <Field label="Monthly Assoc. Dues" value={assocDues} onChange={setAssocDues} prefix="P" />
          </div>
        </CardContent>
      </Card>

      {/* Pag-IBIG Loan Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pag-IBIG Housing Loan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan Amount</span>
            <span className="font-medium">{fmt(loanAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Interest Rate</span>
            <span className="font-medium">5.75% (Pag-IBIG)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Loan Term</span>
            <span className="font-medium">20 years</span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="font-bold">Monthly Amortization</span>
            <span className="font-bold text-primary">{fmt(loan.monthlyPayment)}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Total paid over 20 years: {fmt(loan.totalPaid)} (interest: {fmt(loan.totalInterest)})
          </p>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rent vs Buy Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b">
                  <th className="text-left py-2 pr-4">Years</th>
                  <th className="text-right py-2 px-2">Total Rent</th>
                  <th className="text-right py-2 px-2">Total Buy Cost</th>
                  <th className="text-right py-2 pl-2">Property Value</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.years} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{row.years} yr</td>
                    <td className="py-2 px-2 text-right tabular-nums">{fmt(row.totalRent)}</td>
                    <td className="py-2 px-2 text-right tabular-nums">{fmt(row.totalBuyCost)}</td>
                    <td className={cn("py-2 pl-2 text-right tabular-nums font-medium", row.buyEquity > row.totalBuyCost ? "text-green-600 dark:text-green-400" : "")}>
                      {fmt(row.buyEquity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Assumes 3% annual property appreciation and 1% annual property tax. Pag-IBIG rate at 5.75% for 20-year term.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, prefix, suffix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string; suffix?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{prefix}</span>}
        <Input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.,]/g, ""))}
          className={cn(prefix ? "pl-7" : "", suffix ? "pr-8" : "")}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
}
