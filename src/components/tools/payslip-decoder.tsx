"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { calculateGovernmentDeductions, computeIncomeTax } from "@/lib/ph-math";
import type { EmploymentType } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string }[] = [
  { value: "employed", label: "Employed" },
  { value: "self_employed", label: "Self-Employed" },
  { value: "voluntary", label: "Voluntary" },
  { value: "ofw", label: "OFW" },
];

function formatPeso(amount: number) {
  return `P${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function PayslipDecoder() {
  const [salary, setSalary] = useState("");
  const [employment, setEmployment] = useState<EmploymentType>("employed");

  const gross = parseFloat(salary.replace(/,/g, "")) || 0;
  const deductions = gross > 0 ? calculateGovernmentDeductions(gross, employment) : null;
  const annualGross = gross * 12;
  const tax = annualGross > 0 ? computeIncomeTax(annualGross, 90000) : null;
  const monthlyTax = tax ? Math.round((tax.tax_due / 12) * 100) / 100 : 0;
  const netTakeHome = deductions ? deductions.net_take_home - monthlyTax : 0;

  const items = deductions ? [
    { label: "SSS", amount: deductions.sss.employee, color: "bg-blue-500", description: "Retirement, loans, maternity" },
    { label: "PhilHealth", amount: deductions.philhealth.employee, color: "bg-emerald-500", description: "Hospitalization, outpatient" },
    { label: "Pag-IBIG", amount: deductions.pagibig.employee, color: "bg-violet-500", description: "Housing loans, MP2 savings" },
    { label: "Withholding Tax", amount: monthlyTax, color: "bg-orange-500", description: "TRAIN Law income tax" },
  ] : [];

  const totalDeductions = items.reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="space-y-6">
      {/* Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Salary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="gross-salary">Monthly Gross Salary</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">P</span>
              <Input
                id="gross-salary"
                type="text"
                inputMode="decimal"
                placeholder="25,000"
                value={salary}
                onChange={(e) => setSalary(e.target.value.replace(/[^0-9.,]/g, ""))}
                className="pl-7"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Employment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              {EMPLOYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmployment(opt.value)}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-xs font-medium transition-all",
                    employment === opt.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary text-primary"
                      : "hover:bg-muted/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {deductions && gross > 0 && (
        <>
          {/* Visual bar */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-6 w-full rounded-full overflow-hidden flex">
                {items.map((item) => {
                  const pct = (item.amount / gross) * 100;
                  return pct > 0 ? (
                    <div
                      key={item.label}
                      className={cn("h-full transition-all", item.color)}
                      style={{ width: `${pct}%` }}
                      title={`${item.label}: ${formatPeso(item.amount)}`}
                    />
                  ) : null;
                })}
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${(netTakeHome / gross) * 100}%` }}
                  title={`Take Home: ${formatPeso(netTakeHome)}`}
                />
              </div>

              {/* Legend */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-sm shrink-0", item.color)} />
                      <div>
                        <span className="font-medium">{item.label}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">{item.description}</span>
                      </div>
                    </div>
                    <span className="font-medium tabular-nums">{formatPeso(item.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-sm border-t pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm bg-green-500 shrink-0" />
                    <span className="font-bold">Net Take-Home</span>
                  </div>
                  <span className="font-bold tabular-nums text-green-600 dark:text-green-400">
                    {formatPeso(netTakeHome)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardContent className="pt-6 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gross Salary</span>
                <span className="font-medium">{formatPeso(gross)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Deductions</span>
                <span className="font-medium text-red-500">-{formatPeso(totalDeductions)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-bold">Net Take-Home</span>
                <span className="font-bold text-green-600 dark:text-green-400">{formatPeso(netTakeHome)}</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                Your employer also contributes {formatPeso(deductions.total_employer)} on top of your salary for SSS, PhilHealth, and Pag-IBIG.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
