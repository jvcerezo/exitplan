"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { calculateGovernmentDeductions } from "@/lib/ph-math";
import { EMPLOYMENT_TYPES } from "@/lib/constants";
import { useAddContribution, useContributions } from "@/hooks/use-contributions";
import type { EmploymentType } from "@/lib/types/database";
import { Save, Info } from "lucide-react";
import { toast } from "sonner";

interface Props {
  defaultSalary?: number;
}

const CURRENT_MONTH = new Date().toISOString().slice(0, 7); // YYYY-MM

export function ContributionCalculator({ defaultSalary = 25000 }: Props) {
  const [salary, setSalary] = useState(String(defaultSalary));
  const [employmentType, setEmploymentType] = useState<EmploymentType>("employed");
  const [period, setPeriod] = useState(CURRENT_MONTH);
  const [saving, setSaving] = useState(false);

  const addContribution = useAddContribution();
  const { data: allContributions } = useContributions();
  const periodAlreadySaved = allContributions?.some((c) => c.period === period) ?? false;

  const monthlySalary = parseFloat(salary) || 0;
  const deductions = useMemo(
    () => calculateGovernmentDeductions(monthlySalary, employmentType),
    [monthlySalary, employmentType]
  );

  async function handleSaveAll() {
    if (monthlySalary <= 0) {
      toast.error("Enter a valid monthly salary first.");
      return;
    }
    setSaving(true);
    try {
      await Promise.all([
        addContribution.mutateAsync({
          type: "sss",
          period,
          monthly_salary: monthlySalary,
          employee_share: deductions.sss.employee,
          employer_share: deductions.sss.employer || null,
          total_contribution: deductions.sss.employee + deductions.sss.employer + deductions.sss.ec,
          is_paid: false,
          employment_type: employmentType,
        }),
        addContribution.mutateAsync({
          type: "philhealth",
          period,
          monthly_salary: monthlySalary,
          employee_share: deductions.philhealth.employee,
          employer_share: deductions.philhealth.employer || null,
          total_contribution: deductions.philhealth.total,
          is_paid: false,
          employment_type: employmentType,
        }),
        addContribution.mutateAsync({
          type: "pagibig",
          period,
          monthly_salary: monthlySalary,
          employee_share: deductions.pagibig.employee,
          employer_share: deductions.pagibig.employer || null,
          total_contribution: deductions.pagibig.total,
          is_paid: false,
          employment_type: employmentType,
        }),
      ]);
      toast.success(periodAlreadySaved ? `Contributions updated for ${period}` : `Contributions saved for ${period}`);
    } finally {
      setSaving(false);
    }
  }

  const rows = [
    {
      label: "SSS",
      msc: deductions.sss.msc,
      employee: deductions.sss.employee,
      employer: deductions.sss.employer + deductions.sss.ec,
      total: deductions.sss.employee + deductions.sss.employer + deductions.sss.ec,
      note: `MSC: ${formatCurrency(deductions.sss.msc)}`,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "PhilHealth",
      msc: null,
      employee: deductions.philhealth.employee,
      employer: deductions.philhealth.employer,
      total: deductions.philhealth.total,
      note: `Based on salary ≤ ₱100k`,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Pag-IBIG",
      msc: null,
      employee: deductions.pagibig.employee,
      employer: deductions.pagibig.employer,
      total: deductions.pagibig.total,
      note: `Max ₱100 each`,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Inputs */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Monthly Salary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Basic Monthly Salary (₱)</Label>
              <Input
                type="number"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 25000"
                className="h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Employment Type</Label>
              <Select
                value={employmentType}
                onValueChange={(v) => setEmploymentType(v as EmploymentType)}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Period (YYYY-MM)</Label>
              <Input
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Breakdown table */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Monthly Breakdown</CardTitle>
            <Badge variant="secondary" className="text-[10px]">2024 rates</Badge>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {/* Table header */}
          <div className="grid grid-cols-4 px-6 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            <span>Fund</span>
            <span className="text-right">Your Share</span>
            <span className="text-right">Employer</span>
            <span className="text-right">Total</span>
          </div>

          {rows.map((row, i) => (
            <div key={row.label}>
              {i > 0 && <Separator className="mx-6" />}
              <div className="grid grid-cols-4 items-center px-6 py-3">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.bg} ${row.color}`}>
                    {row.label}
                  </span>
                </div>
                <span className="text-right text-sm font-semibold">
                  {formatCurrency(row.employee)}
                </span>
                <span className="text-right text-sm text-muted-foreground">
                  {employmentType === "employed" ? formatCurrency(row.employer) : "—"}
                </span>
                <span className="text-right text-sm font-bold">
                  {formatCurrency(employmentType === "employed" ? row.total : row.employee)}
                </span>
              </div>
              {row.note && (
                <p className="px-6 pb-2 -mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
                  <Info className="h-3 w-3" />
                  {row.note}
                </p>
              )}
            </div>
          ))}

          <Separator className="mx-6" />

          {/* Totals */}
          <div className="grid grid-cols-4 items-center px-6 py-4 bg-muted/30 rounded-b-2xl">
            <span className="text-xs font-semibold">Total</span>
            <span className="text-right text-sm font-bold text-destructive">
              − {formatCurrency(deductions.total_employee)}
            </span>
            <span className="text-right text-sm text-muted-foreground">
              {employmentType === "employed" ? formatCurrency(deductions.total_employer) : "—"}
            </span>
            <span className="text-right text-sm font-bold">
              {formatCurrency(
                employmentType === "employed"
                  ? deductions.total_employee + deductions.total_employer
                  : deductions.total_employee
              )}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Net take-home summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="rounded-2xl border border-border/60 bg-card/95">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Gross Monthly</p>
            <p className="text-xl font-bold mt-0.5">{formatCurrency(monthlySalary)}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Your Deductions</p>
            <p className="text-xl font-bold mt-0.5 text-destructive">
              − {formatCurrency(deductions.total_employee)}
            </p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <p className="text-[11px] text-muted-foreground">Net Take-Home</p>
            <p className="text-xl font-bold mt-0.5 text-primary">
              {formatCurrency(deductions.net_take_home)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Save button */}
      <Button
        onClick={handleSaveAll}
        disabled={saving || monthlySalary <= 0}
        className="w-full sm:w-auto"
        size="sm"
      >
        <Save className="h-4 w-4 mr-2" />
        {saving ? (periodAlreadySaved ? "Updating..." : "Saving...") : (periodAlreadySaved ? `Update ${period}` : `Save ${period} Contributions`)}
      </Button>

      {/* Info note */}
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Rates based on SSS 2024 schedule (13% total, MSC ₱3k–₱30k), PhilHealth 5% premium (₱10k–₱100k salary), and Pag-IBIG 2% (max ₱100 each). Consult your HR or the respective agency for exact figures.
      </p>
    </div>
  );
}
