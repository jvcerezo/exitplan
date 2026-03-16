"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useContributions, useUpdateContribution, useDeleteContribution } from "@/hooks/use-contributions";
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { Contribution } from "@/lib/types/database";

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  sss: { label: "SSS", color: "text-blue-500", bg: "bg-blue-500/10" },
  philhealth: { label: "PhilHealth", color: "text-green-500", bg: "bg-green-500/10" },
  pagibig: { label: "Pag-IBIG", color: "text-orange-500", bg: "bg-orange-500/10" },
};

function groupByPeriod(contributions: Contribution[]) {
  const map = new Map<string, Contribution[]>();
  for (const c of contributions) {
    const list = map.get(c.period) ?? [];
    list.push(c);
    map.set(c.period, list);
  }
  return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

function PeriodGroup({
  period,
  items,
}: {
  period: string;
  items: Contribution[];
}) {
  const [open, setOpen] = useState(false);
  const updateContribution = useUpdateContribution();
  const deleteContribution = useDeleteContribution();

  const allPaid = items.every((c) => c.is_paid);
  const employeeTotal = items.reduce((sum, c) => sum + c.employee_share, 0);

  const [yr, mo] = period.split("-");
  const label = new Date(Number(yr), Number(mo) - 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="border border-border/60 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          {allPaid ? (
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
          ) : (
            <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="text-left">
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-[11px] text-muted-foreground">
              {items.length} contributions · your share: {formatCurrency(employeeTotal)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={allPaid ? "default" : "secondary"} className="text-[10px]">
            {allPaid ? "Paid" : "Pending"}
          </Badge>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border/60">
          {items.map((c, i) => {
            const meta = TYPE_LABELS[c.type];
            return (
              <div key={c.id}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between px-4 py-3 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">
                        Your share: {formatCurrency(c.employee_share)}
                      </p>
                      {c.employer_share != null && (
                        <p className="text-[11px] text-muted-foreground">
                          Employer: {formatCurrency(c.employer_share)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() =>
                        updateContribution.mutate({ id: c.id, is_paid: !c.is_paid })
                      }
                    >
                      {c.is_paid ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => deleteContribution.mutate(c.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ContributionHistory() {
  const { data, isLoading } = useContributions();

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border/60">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Loading history…
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/60">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No saved contributions yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Use the calculator above and click "Save" to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  const grouped = groupByPeriod(data);

  return (
    <Card className="rounded-2xl border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Contribution History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {grouped.map(([period, items]) => (
          <PeriodGroup key={period} period={period} items={items} />
        ))}
      </CardContent>
    </Card>
  );
}
