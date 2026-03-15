"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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

  const mobileRows = data
    .filter((d) => d.currentMonth > 0 || d.previousMonth > 0)
    .slice(0, 8);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Spending: This vs Last Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        <div className="hidden h-[250px] sm:h-[300px] sm:block">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000 ? `₱${(v / 1_000).toFixed(0)}K` : `₱${v}`
                }
              />
              <Tooltip
                formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                }}
              />
              <Legend />
              <Bar
                dataKey="This Month"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="Last Month"
                fill="#94a3b8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Change badges */}
        <div className="hidden flex-wrap gap-2 sm:flex">
          {data.slice(0, 5).map((d) => (
            <div
              key={d.category}
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
            >
              <span className="font-medium">{formatCategory(d.category)}</span>
              <span
                className={cn(
                  "flex items-center gap-0.5 font-semibold",
                  d.changePercent > 0
                    ? "text-foreground"
                    : d.changePercent < 0
                      ? "text-green-600"
                      : "text-muted-foreground"
                )}
              >
                {d.changePercent > 0 ? (
                  <ArrowUp className="h-3 w-3" />
                ) : d.changePercent < 0 ? (
                  <ArrowDown className="h-3 w-3" />
                ) : null}
                {Math.abs(d.changePercent)}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
