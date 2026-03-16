"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useTaxRecords, useUpdateTaxRecord, useDeleteTaxRecord } from "@/hooks/use-tax";
import { CheckCircle2, FileText, Trash2 } from "lucide-react";
import type { TaxRecord } from "@/lib/types/database";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  draft: { label: "Draft", variant: "secondary" },
  filed: { label: "Filed", variant: "default" },
  paid: { label: "Paid", variant: "default" },
};

function TaxRecordRow({ record }: { record: TaxRecord }) {
  const update = useUpdateTaxRecord();
  const remove = useDeleteTaxRecord();
  const badge = STATUS_BADGE[record.status];

  const label = record.quarter
    ? `Q${record.quarter} ${record.year}`
    : `FY ${record.year}`;

  const balance = record.tax_due - record.amount_paid;

  return (
    <div className="flex items-center justify-between py-3 px-4 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
          <FileText className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[11px] text-muted-foreground">
            Gross: {formatCurrency(record.gross_income)} · Tax due: {formatCurrency(record.tax_due)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right hidden sm:block">
          <p className={`text-xs font-bold ${balance > 0 ? "text-destructive" : "text-primary"}`}>
            {balance > 0 ? `Owed: ${formatCurrency(balance)}` : "Settled"}
          </p>
        </div>
        <Badge variant={badge.variant} className="text-[10px]">
          {badge.label}
        </Badge>
        {record.status !== "paid" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={() =>
              update.mutate({
                id: record.id,
                status: record.status === "draft" ? "filed" : "paid",
                // When marking paid, only auto-fill amount_paid if it hasn't been set yet
                ...(record.status === "filed" && record.amount_paid === 0
                  ? { amount_paid: record.tax_due }
                  : {}),
              })
            }
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={() => remove.mutate(record.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function TaxHistory() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useTaxRecords(currentYear);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-border/60">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Loading records…
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/60">
        <CardContent className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No tax records for {currentYear} yet.</p>
          <p className="text-xs text-muted-foreground mt-1">
            Use the calculator above and click "Save as Draft" to start tracking.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Tax Records — {currentYear}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {data.map((record, i) => (
          <div key={record.id}>
            {i > 0 && <Separator />}
            <TaxRecordRow record={record} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
