"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useSpendingByCategory } from "@/hooks/use-chart-data";
import { formatCurrency } from "@/lib/utils";

const COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#14b8a6", // teal
  "#f59e0b", // amber
];

interface TooltipPayloadEntry {
  name: string;
  value: number;
}

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background px-3 py-2 shadow-sm">
        <p className="text-sm font-medium">{payload[0].name}</p>
        <p className="text-sm text-muted-foreground">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
}

export function SpendingChart() {
  const { data, isLoading, error } = useSpendingByCategory();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-[220px] sm:h-[300px]">
            <div className="h-40 w-40 rounded-full bg-muted animate-pulse" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Could not load chart</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error
                  ? error.message
                  : "Failed to load spending data."}
              </p>
            </div>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex items-center justify-center h-[220px] sm:h-[300px]">
            <p className="text-sm text-muted-foreground">
              No spending data this month
            </p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            <div className="h-[220px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={82}
                    paddingAngle={2}
                    dataKey="amount"
                    nameKey="category"
                  >
                    {data.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 sm:grid-cols-3">
              {data.map((item, index) => (
                <div key={item.category} className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-xs text-muted-foreground capitalize truncate">
                    {item.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
