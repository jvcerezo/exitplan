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
    category: d.category.charAt(0).toUpperCase() + d.category.slice(1),
    "This Month": d.currentMonth,
    "Last Month": d.previousMonth,
    changePercent: d.changePercent,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Spending: This vs Last Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[250px] sm:h-[300px]">
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
        <div className="flex flex-wrap gap-2">
          {data.slice(0, 5).map((d) => (
            <div
              key={d.category}
              className="flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs"
            >
              <span className="capitalize font-medium">{d.category}</span>
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
