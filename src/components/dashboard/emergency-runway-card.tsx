"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmergencyFund } from "@/hooks/use-emergency-fund";
import { cn } from "@/lib/utils";

export function EmergencyRunwayCard() {
  const { data, isLoading } = useEmergencyFund(6);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-16 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const months = data.monthsCovered;
  const maxDisplay = 12;
  const percentage = Math.min(100, (months / maxDisplay) * 100);

  function getColor(m: number) {
    if (m >= 6) return { text: "text-green-600 dark:text-green-400", bar: "bg-green-500", label: "Strong" };
    if (m >= 3) return { text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500", label: "Good" };
    if (m >= 1) return { text: "text-yellow-500 dark:text-yellow-400", bar: "bg-yellow-500", label: "Low" };
    return { text: "text-red-500 dark:text-red-400", bar: "bg-red-500", label: "Critical" };
  }

  const color = getColor(months);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Emergency Runway</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-3xl font-bold tabular-nums", color.text)}>
            {months}
          </span>
          <span className="text-sm text-muted-foreground">months of coverage</span>
        </div>
        <div className="space-y-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-500", color.bar)}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0</span>
            <span>3 mo</span>
            <span>6 mo</span>
            <span>12 mo</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className={cn("font-medium", color.text)}>{color.label}</span> — based on your current monthly expenses of{" "}
          <span className="font-medium text-foreground">
            P{data.monthlyExpenses.toLocaleString("en-PH", { maximumFractionDigits: 0 })}
          </span>
        </p>
      </CardContent>
    </Card>
  );
}
