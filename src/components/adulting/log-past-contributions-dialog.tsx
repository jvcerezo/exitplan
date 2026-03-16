"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useBulkAddContributions } from "@/hooks/use-contributions";
import { calculateGovernmentDeductions } from "@/lib/ph-math";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);

function monthsBetween(start: string, end: string): string[] {
  if (!start || !end || start > end) return [];
  const months: string[] = [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  let year = sy;
  let month = sm;
  while (year < ey || (year === ey && month <= em)) {
    months.push(`${year}-${String(month).padStart(2, "0")}`);
    month++;
    if (month > 12) { month = 1; year++; }
  }
  return months;
}

type InputMode = "salary" | "manual";

export function LogPastContributionsDialog({ open, onOpenChange }: Props) {
  const [startPeriod, setStartPeriod] = useState("");
  const [endPeriod, setEndPeriod] = useState(CURRENT_MONTH);
  const [mode, setMode] = useState<InputMode>("salary");

  // salary mode
  const [salary, setSalary] = useState("");

  // manual mode
  const [manualSss, setManualSss] = useState("");
  const [manualPhilhealth, setManualPhilhealth] = useState("");
  const [manualPagibig, setManualPagibig] = useState("");

  const bulkAdd = useBulkAddContributions();

  const periods = useMemo(() => monthsBetween(startPeriod, endPeriod), [startPeriod, endPeriod]);

  const salaryVal = parseFloat(salary) || 0;
  const computed = useMemo(
    () => (mode === "salary" && salaryVal > 0 ? calculateGovernmentDeductions(salaryVal, "employed") : null),
    [mode, salaryVal]
  );

  const isValid = useMemo(() => {
    if (periods.length === 0) return false;
    if (mode === "salary") return salaryVal > 0;
    const s = parseFloat(manualSss) || 0;
    const ph = parseFloat(manualPhilhealth) || 0;
    const pi = parseFloat(manualPagibig) || 0;
    return s > 0 || ph > 0 || pi > 0;
  }, [periods, mode, salaryVal, manualSss, manualPhilhealth, manualPagibig]);

  function reset() {
    setStartPeriod("");
    setEndPeriod(CURRENT_MONTH);
    setMode("salary");
    setSalary("");
    setManualSss("");
    setManualPhilhealth("");
    setManualPagibig("");
  }

  async function handleSave() {
    if (!isValid) return;

    const records = [];

    for (const period of periods) {
      if (mode === "salary" && computed) {
        records.push(
          { type: "sss" as const, period, monthly_salary: salaryVal, employee_share: computed.sss.employee, employer_share: computed.sss.employer || null, total_contribution: computed.sss.employee + computed.sss.employer + computed.sss.ec, is_paid: true, employment_type: "employed" as const },
          { type: "philhealth" as const, period, monthly_salary: salaryVal, employee_share: computed.philhealth.employee, employer_share: computed.philhealth.employer || null, total_contribution: computed.philhealth.total, is_paid: true, employment_type: "employed" as const },
          { type: "pagibig" as const, period, monthly_salary: salaryVal, employee_share: computed.pagibig.employee, employer_share: computed.pagibig.employer || null, total_contribution: computed.pagibig.total, is_paid: true, employment_type: "employed" as const },
        );
      } else {
        const s = parseFloat(manualSss) || 0;
        const ph = parseFloat(manualPhilhealth) || 0;
        const pi = parseFloat(manualPagibig) || 0;
        if (s > 0) records.push({ type: "sss" as const, period, monthly_salary: 0, employee_share: s, employer_share: null, total_contribution: s, is_paid: true, employment_type: "employed" as const });
        if (ph > 0) records.push({ type: "philhealth" as const, period, monthly_salary: 0, employee_share: ph, employer_share: null, total_contribution: ph, is_paid: true, employment_type: "employed" as const });
        if (pi > 0) records.push({ type: "pagibig" as const, period, monthly_salary: 0, employee_share: pi, employer_share: null, total_contribution: pi, is_paid: true, employment_type: "employed" as const });
      }
    }

    await bulkAdd.mutateAsync(records, {
      onSuccess: () => {
        toast.success(`Imported ${periods.length} month${periods.length > 1 ? "s" : ""} of contributions`);
        reset();
        onOpenChange(false);
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Import Past Contributions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From</Label>
              <Input
                type="month"
                value={startPeriod}
                max={endPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">To</Label>
              <Input
                type="month"
                value={endPeriod}
                min={startPeriod}
                max={CURRENT_MONTH}
                onChange={(e) => setEndPeriod(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {periods.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {periods.length} month{periods.length > 1 ? "s" : ""} will be imported
              {periods.length > 1 ? ` (${periods[0]} → ${periods[periods.length - 1]})` : ""}
            </p>
          )}

          <Separator />

          {/* Mode toggle */}
          <div className="flex rounded-lg border border-border overflow-hidden text-xs font-medium">
            <button
              type="button"
              onClick={() => setMode("salary")}
              className={`flex-1 py-2 transition-colors ${mode === "salary" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
            >
              From Salary
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`flex-1 py-2 transition-colors ${mode === "manual" ? "bg-primary text-primary-foreground" : "hover:bg-muted/50"}`}
            >
              Enter Manually
            </button>
          </div>

          {mode === "salary" ? (
            <div className="space-y-1.5">
              <Label className="text-xs">Monthly Salary (₱)</Label>
              <Input
                type="number"
                min="0"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. 25000"
                className="h-9"
              />
              {computed && (
                <div className="rounded-lg bg-muted/40 px-3 py-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span className="text-blue-500 font-medium">SSS</span><span>₱{computed.sss.employee.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-green-500 font-medium">PhilHealth</span><span>₱{computed.philhealth.employee.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-orange-500 font-medium">Pag-IBIG</span><span>₱{computed.pagibig.employee.toFixed(2)}</span></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Enter the amount you paid each month. Leave blank to skip that fund.</p>
              <div className="space-y-1.5">
                <Label className="text-xs text-blue-500 font-semibold">SSS — Employee Share (₱)</Label>
                <Input type="number" min="0" value={manualSss} onChange={(e) => setManualSss(e.target.value)} placeholder="e.g. 900" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-green-500 font-semibold">PhilHealth — Employee Share (₱)</Label>
                <Input type="number" min="0" value={manualPhilhealth} onChange={(e) => setManualPhilhealth(e.target.value)} placeholder="e.g. 625" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-orange-500 font-semibold">Pag-IBIG — Employee Share (₱)</Label>
                <Input type="number" min="0" value={manualPagibig} onChange={(e) => setManualPagibig(e.target.value)} placeholder="e.g. 100" className="h-9" />
              </div>
            </div>
          )}

          <p className="text-[11px] text-muted-foreground">
            All imported months will be marked as <span className="font-medium text-foreground">Paid</span>. Existing records for the same month will be updated.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => { reset(); onOpenChange(false); }}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!isValid || bulkAdd.isPending}>
            {bulkAdd.isPending ? "Importing…" : `Import${periods.length > 1 ? ` ${periods.length} Months` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
