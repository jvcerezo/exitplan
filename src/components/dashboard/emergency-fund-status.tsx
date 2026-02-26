"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Shield } from "lucide-react";
import { useEmergencyFund } from "@/hooks/use-emergency-fund";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function EmergencyFundStatus({ targetMonths = 3 }) {
  const { data, isLoading, error } = useEmergencyFund(targetMonths);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="h-2 w-full bg-muted rounded" />
          <div className="flex gap-4">
            <div className="flex-1 space-y-1">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="h-3 w-20 bg-muted rounded" />
              <div className="h-4 w-24 bg-muted rounded" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium">Could not load emergency fund</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Check your connection"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isFunded = data.monthsCovered >= data.targetMonths;
  const statusColor = isFunded 
    ? "text-green-600" 
    : data.progressPercent >= 50 
    ? "text-yellow-500" 
    : "text-amber-600";
  const progressColor = isFunded 
    ? "bg-green-500" 
    : data.progressPercent >= 50 
    ? "bg-yellow-500" 
    : "bg-amber-500";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base">Emergency Fund</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex justify-between items-baseline">
            <div className="space-y-1">
              <p className={cn("text-sm text-muted-foreground")}>
                {data.monthsCovered.toFixed(1)} of {data.targetMonths} months covered
              </p>
              <p className={cn("text-2xl font-bold", statusColor)}>
                {formatCurrency(data.currentAmount)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground text-right">
              Target: {formatCurrency(data.targetAmount)}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-3">
            <div
              className={cn("h-full transition-all duration-300", progressColor)}
              style={{ width: `${data.progressPercent}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <p className="text-muted-foreground">Monthly Expenses</p>
            <p className="font-semibold">
              {formatCurrency(data.monthlyExpenses)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-muted-foreground">Target Goal</p>
            <p className="font-semibold">
              {data.targetMonths} months expenses
            </p>
          </div>
        </div>

        {!isFunded && (
          <div className={cn("text-xs p-2 rounded", 
            data.progressPercent >= 50 
              ? "bg-yellow-500/10" 
              : "bg-amber-500/10")}>
            <p className={cn("font-medium",
              data.progressPercent >= 50 
                ? "text-yellow-700 dark:text-yellow-300" 
                : "text-amber-700 dark:text-amber-300")}>
              {formatCurrency(data.targetAmount - data.currentAmount)} more to reach target
            </p>
          </div>
        )}

        {isFunded && (
          <div className="text-xs p-2 rounded bg-green-500/10">
            <p className="text-green-700 dark:text-green-300 font-medium">
              ✓ You're fully covered for {data.targetMonths} months!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
