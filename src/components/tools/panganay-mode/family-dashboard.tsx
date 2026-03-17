"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFamilySupport } from "@/hooks/use-family-support";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  return `P${n.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
}

export function FamilyDashboard() {
  const { data, isLoading } = useFamilySupport();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Family Support</p>
            <p className="text-xl font-bold tabular-nums text-pink-600 dark:text-pink-400">{fmt(data.totalThisMonth)}</p>
            <p className="text-[10px] text-muted-foreground">this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Personal Spending</p>
            <p className="text-xl font-bold tabular-nums">{fmt(data.personalSpending)}</p>
            <p className="text-[10px] text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Split visualization */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Spending Split</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-muted">
            {data.familyPercent > 0 && (
              <div
                className="h-full bg-pink-500 transition-all"
                style={{ width: `${data.familyPercent}%` }}
              />
            )}
            <div className="h-full bg-blue-500 flex-1" />
          </div>
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-pink-500" />
              <span>Family ({data.familyPercent}%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-sm bg-blue-500" />
              <span>Personal ({100 - data.familyPercent}%)</span>
            </div>
          </div>
          {data.monthOverMonthChange !== 0 && (
            <p className="text-xs text-muted-foreground">
              {data.monthOverMonthChange > 0 ? "Up" : "Down"}{" "}
              <span className={cn("font-medium", data.monthOverMonthChange > 0 ? "text-red-500" : "text-green-600 dark:text-green-400")}>
                {Math.abs(data.monthOverMonthChange)}%
              </span>{" "}
              vs last month
            </p>
          )}
        </CardContent>
      </Card>

      {/* By recipient */}
      {data.byRecipient.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">By Recipient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.byRecipient.map((r) => (
                <div key={r.recipient} className="flex items-center justify-between text-sm">
                  <span>{r.recipient}</span>
                  <span className="font-medium tabular-nums">{fmt(r.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state with guidance */}
      {data.totalThisMonth === 0 && (
        <Card>
          <CardContent className="pt-6 text-center space-y-2">
            <p className="text-sm font-medium">No family support expenses yet this month</p>
            <p className="text-xs text-muted-foreground">
              Tag your expenses with &quot;Family Support&quot; category or add the &quot;family-support&quot; tag when logging transactions.
              You can also add recipient tags like &quot;family:parents&quot; or &quot;family:sibling&quot;.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
