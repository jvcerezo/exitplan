"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNetWorthOverTime } from "@/hooks/use-chart-data";
import { formatCurrency } from "@/lib/utils";

export function NetWorthChart() {
  const { data, isLoading } = useNetWorthOverTime();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
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
          <CardTitle className="text-base">Net Worth Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Not enough data yet
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Net Worth Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  v >= 1_000_000
                    ? `₱${(v / 1_000_000).toFixed(1)}M`
                    : v >= 1_000
                      ? `₱${(v / 1_000).toFixed(0)}K`
                      : `₱${v}`
                }
              />
              <Tooltip
                formatter={(value: number | undefined) => [formatCurrency(value ?? 0), "Balance"]}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--card)",
                }}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke="#16a34a"
                strokeWidth={2}
                fill="url(#netWorthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
