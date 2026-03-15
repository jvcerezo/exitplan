"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSpendingComparison } from "@/hooks/use-chart-data";
import { formatCurrency } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpendingComparison() {
  const { data, isLoading } = useSpendingComparison();

  const formatCategory = (value: string) =>
    value
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const truncateCategory = (value: string, max = 14) =>
    value.length > max ? `${value.slice(0, max - 1)}…` : value;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-[250px] sm:h-[300px] bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Spending Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Not enough data to compare
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    category: formatCategory(d.category),
    "This Month": d.currentMonth,
    "Last Month": d.previousMonth,
    changePercent: d.changePercent,
  }));

  const topDesktopRows = chartData
    .filter((row) => row["This Month"] > 0 || row["Last Month"] > 0)
    .slice(0, 7);

  const thisMonthTotal = data.reduce((sum, item) => sum + item.currentMonth, 0);
  const lastMonthTotal = data.reduce((sum, item) => sum + item.previousMonth, 0);
  const overallChange =
    lastMonthTotal > 0
      ? Math.round(((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
      : thisMonthTotal > 0
        ? 100
        : 0;

  const mobileRows = data
    .filter((d) => d.currentMonth > 0 || d.previousMonth > 0)
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Spending: This vs Last Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="hidden rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid sm:grid-cols-3 sm:gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">This Month</p>
            <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(thisMonthTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Last Month</p>
            <p className="mt-1 text-lg font-semibold text-muted-foreground">{formatCurrency(lastMonthTotal)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Overall Change</p>
            <p
              className={cn(
                "mt-1 flex items-center gap-1 text-lg font-semibold",
                overallChange > 0
                  ? "text-amber-600"
                  : overallChange < 0
                    ? "text-emerald-600"
                    : "text-muted-foreground"
              )}
            >
              {overallChange > 0 ? <ArrowUp className="h-4 w-4" /> : null}
              {overallChange < 0 ? <ArrowDown className="h-4 w-4" /> : null}
              {Math.abs(overallChange)}%
            </p>
          </div>
        </div>

        <div className="sm:hidden overflow-hidden rounded-xl border border-border/60 bg-background/30">
          <div className="grid grid-cols-[1.1fr_0.9fr_0.9fr_0.7fr] items-center gap-2 border-b border-border/60 px-3 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Category</span>
            <span className="text-right">This</span>
            <span className="text-right">Last</span>
            <span className="text-right">Δ</span>
          </div>

          <div className="divide-y divide-border/50">
            {mobileRows.map((d) => {
              const isIncrease = d.changePercent > 0;
              const isDecrease = d.changePercent < 0;

              return (
                <div
                  key={d.category}
                  className="grid grid-cols-[1.1fr_0.9fr_0.9fr_0.7fr] items-center gap-2 px-3 py-2"
                >
                  <span className="truncate text-[11px] font-medium">
                    {formatCategory(d.category)}
                  </span>
                  <span className="truncate text-right text-[11px] font-semibold text-primary">
                    {formatCurrency(d.currentMonth)}
                  </span>
                  <span className="truncate text-right text-[11px] text-muted-foreground">
                    {formatCurrency(d.previousMonth)}
                  </span>
                  <span
                    className={cn(
                      "flex items-center justify-end gap-0.5 text-[11px] font-semibold",
                      isIncrease
                        ? "text-amber-500"
                        : isDecrease
                          ? "text-green-600"
                          : "text-muted-foreground"
                    )}
                  >
                    {isIncrease ? <ArrowUp className="h-3 w-3" /> : null}
                    {isDecrease ? <ArrowDown className="h-3 w-3" /> : null}
                    {Math.abs(d.changePercent)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden sm:grid sm:grid-cols-[1.2fr_0.8fr] sm:gap-4">
          <div className="h-[320px] rounded-xl border border-border/60 bg-background/30 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topDesktopRows} layout="vertical" margin={{ top: 8, right: 10, left: 10, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1_000 ? `₱${(v / 1_000).toFixed(0)}K` : `₱${v}`
                  }
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={98}
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: string) => truncateCategory(value)}
                />
                <Tooltip
                  formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                  }}
                />
                <Bar dataKey="This Month" fill="#16a34a" radius={[3, 3, 3, 3]} />
                <Bar dataKey="Last Month" fill="#94a3b8" radius={[3, 3, 3, 3]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 rounded-xl border border-border/60 bg-background/30 p-3">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Category Breakdown</p>
            {topDesktopRows.map((row) => {
              const isIncrease = row.changePercent > 0;
              const isDecrease = row.changePercent < 0;
              return (
                <div key={row.category} className="rounded-md border border-border/50 px-2.5 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs font-medium">{row.category}</p>
                    <span
                      className={cn(
                        "flex items-center gap-0.5 text-xs font-semibold",
                        isIncrease
                          ? "text-amber-600"
                          : isDecrease
                            ? "text-emerald-600"
                            : "text-muted-foreground"
                      )}
                    >
                      {isIncrease ? <ArrowUp className="h-3 w-3" /> : null}
                      {isDecrease ? <ArrowDown className="h-3 w-3" /> : null}
                      {Math.abs(row.changePercent)}%
                    </span>
                  </div>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <p className="text-muted-foreground">This</p>
                      <p className="font-semibold text-foreground">{formatCurrency(row["This Month"])}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Last</p>
                      <p className="font-semibold text-muted-foreground">{formatCurrency(row["Last Month"])}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
