"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { projectRetirement } from "@/lib/retirement-math";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return `P${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

export function RetirementProjection() {
  const [age, setAge] = useState("25");
  const [retireAge, setRetireAge] = useState("60");
  const [salary, setSalary] = useState("25000");
  const [savings, setSavings] = useState("0");
  const [desired, setDesired] = useState("30000");
  const [contribYears, setContribYears] = useState("3");

  const p = (v: string) => parseFloat(v.replace(/,/g, "")) || 0;

  const result = projectRetirement({
    currentAge: p(age),
    retirementAge: p(retireAge),
    monthlySalary: p(salary),
    currentSavings: p(savings),
    desiredMonthlyIncome: p(desired),
    contributionYears: p(contribYears),
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Current Age" value={age} onChange={setAge} />
            <Field label="Retirement Age" value={retireAge} onChange={setRetireAge} />
            <Field label="Monthly Salary" value={salary} onChange={setSalary} prefix="P" />
            <Field label="Current Savings" value={savings} onChange={setSavings} prefix="P" />
            <Field label="Desired Monthly Income" value={desired} onChange={setDesired} prefix="P" />
            <Field label="Years of SSS Contributions" value={contribYears} onChange={setContribYears} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Retirement Projection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Estimated SSS Pension" value={fmt(result.sssPension.monthlyPension)} sub="/month" color="text-blue-600 dark:text-blue-400" />
            <Stat label="Monthly Gap" value={fmt(result.monthlyGap)} sub="/month" color="text-red-500" />
            <Stat label="Total Savings Needed" value={fmt(result.totalSavingsNeeded)} sub="(4% rule)" />
            <Stat label="Years to Retirement" value={`${result.yearsToRetirement}`} sub="years" />
          </div>

          <div className="rounded-xl border p-4 space-y-2">
            <p className="text-sm font-bold">
              You need to save{" "}
              <span className={cn(result.requiredMonthlySavings > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400")}>
                {fmt(result.requiredMonthlySavings)}/month
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Assuming 7% annual returns (similar to Pag-IBIG MP2). Your SSS pension covers {fmt(result.sssPension.monthlyPension)} of your desired {fmt(result.desiredMonthlyIncome)}/month.
              {result.savingsShortfall > 0 && ` You still need ${fmt(result.savingsShortfall)} in savings.`}
            </p>
          </div>

          {result.sssPension.creditedYears < 10 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              You need at least 10 years (120 months) of SSS contributions to qualify for a pension. Keep contributing!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, onChange, prefix }: { label: string; value: string; onChange: (v: string) => void; prefix?: string }) {
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
          className={prefix ? "pl-7" : ""}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-lg font-bold tabular-nums", color)}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
