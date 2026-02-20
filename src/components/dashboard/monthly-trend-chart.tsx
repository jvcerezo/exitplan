"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useMonthlyTrend } from "@/hooks/use-chart-data";
import { formatCurrency } from "@/lib/utils";

interface TooltipPayloadEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry) => (
          <p
            key={entry.dataKey}
            className="text-sm"
            style={{ color: entry.color }}
          >
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value.toString();
}

export function MonthlyTrendChart() {
  const { data, isLoading, error } = useMonthlyTrend();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-end gap-2 justify-center h-[250px] sm:h-[300px] px-4 pb-8">
            {[40, 65, 55, 80, 45, 70].map((h, i) => (
              <div key={i} className="flex gap-1 items-end flex-1">
                <div
                  className="flex-1 bg-muted rounded-t animate-pulse"
                  style={{ height: `${h}%` }}
                />
                <div
                  className="flex-1 bg-muted rounded-t animate-pulse"
                  style={{ height: `${h - 15}%` }}
                />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Could not load chart</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Failed to load trend data."}
              </p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[250px] sm:h-[300px]">
            <p className="text-sm text-muted-foreground">
              No transaction data available
            </p>
          </div>
        ) : (
          <div className="h-[250px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tickFormatter={formatYAxis}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
