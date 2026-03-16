"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useSavingsRate } from "@/hooks/use-savings-rate";
import { formatCurrency } from "@/lib/utils";

export function SavingsRateIndicator() {
  const { data, isLoading, error } = useSavingsRate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4 animate-pulse">
          <div className="h-8 w-32 bg-muted rounded" />
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
            <p className="text-sm font-medium">Could not load savings rate</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error ? error.message : "Check your connection"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const isImproving = 
    data.lastMonthSavingsPercent !== undefined && 
    data.savingsRatePercent > data.lastMonthSavingsPercent;

  const isMaintained = 
    data.lastMonthSavingsPercent !== undefined && 
    data.savingsRatePercent === data.lastMonthSavingsPercent;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Monthly Savings</CardTitle>
          {data.lastMonthSavingsPercent !== undefined && (
            <div className="flex items-center gap-1 text-xs">
              {isImproving ? (
                <>
                  <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600 font-medium">
                    +{data.savingsRatePercent - data.lastMonthSavingsPercent}%
                  </span>
                </>
              ) : isMaintained ? (
                <span className="text-muted-foreground font-medium">
                  No change
                </span>
              ) : (
                <>
                  <TrendingDown className="h-3.5 w-3.5 text-amber-500" />
                  <span className="text-amber-500 font-medium">
                    {data.savingsRatePercent - data.lastMonthSavingsPercent}%
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Big savings rate */}
        <div>
          <div className="text-4xl font-bold text-green-600">
            {data.savingsRatePercent}%
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            of income saved this month
          </p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3 pt-3 border-t">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Income</p>
            <p className="text-base font-semibold">
              {formatCurrency(data.monthlyIncome)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Expenses</p>
            <p className="text-base font-semibold">
              {formatCurrency(data.monthlyExpenses)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Saved</p>
            <p className="text-base font-semibold text-green-600">
              {formatCurrency(data.monthlySavings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
