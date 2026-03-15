"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
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
  const chartData = (data ?? []).map((item) => ({
    ...item,
    net: Math.round((item.income - item.expenses) * 100) / 100,
  }));

  const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
  const netFlow = totalIncome - totalExpenses;
  const avgMonthlyNet = chartData.length > 0 ? netFlow / chartData.length : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Monthly Trend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {isLoading ? (
          <div className="flex items-end gap-2 justify-center h-[220px] sm:h-[300px] px-3 pb-6 sm:px-4 sm:pb-8">
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
          <div className="flex items-center justify-center h-[220px] sm:h-[300px]">
            <p className="text-sm text-muted-foreground">
              No transaction data available
            </p>
          </div>
        ) : (
          <>
            <div className="hidden rounded-xl border border-border/60 bg-muted/20 p-3 sm:grid sm:grid-cols-4 sm:gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">6-Month Income</p>
                <p className="mt-1 text-base font-semibold text-emerald-600">{formatCurrency(totalIncome)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">6-Month Expenses</p>
                <p className="mt-1 text-base font-semibold text-foreground">{formatCurrency(totalExpenses)}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Net Flow</p>
                <p className={`mt-1 text-base font-semibold ${netFlow >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(netFlow)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg Monthly Net</p>
                <p className={`mt-1 text-base font-semibold ${avgMonthlyNet >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {formatCurrency(avgMonthlyNet)}
                </p>
              </div>
            </div>

            <div className="h-[230px] sm:h-[320px] rounded-xl border border-border/60 bg-background/30 p-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
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
                  <Legend />
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
                  <Line
                    dataKey="net"
                    name="Net"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
