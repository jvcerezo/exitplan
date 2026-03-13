"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { BudgetCard } from "@/components/budgets/budget-card";
import { useBudgetSummary, useCopyBudgetsFromMonth } from "@/hooks/use-budgets";
import { formatCurrency, cn } from "@/lib/utils";
import type { BudgetPeriod } from "@/lib/types/database";

const PERIOD_TABS: { value: BudgetPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
];

function getStartOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // Sunday
  return d.toISOString().split("T")[0];
}

function getFirstOfMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

function getFirstOfQuarter(date: Date): string {
  const month = Math.floor(date.getMonth() / 3) * 3;
  return `${date.getFullYear()}-${String(month + 1).padStart(2, "0")}-01`;
}

function getCurrentPeriodStart(period: BudgetPeriod): string {
  const now = new Date();
  if (period === "weekly") return getStartOfWeek(now);
  if (period === "quarterly") return getFirstOfQuarter(now);
  return getFirstOfMonth(now);
}

function formatPeriodLabel(startStr: string, period: BudgetPeriod): string {
  const [year, month, day] = startStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (period === "weekly") {
    const end = new Date(date);
    end.setDate(end.getDate() + 6);
    return `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }
  if (period === "quarterly") {
    const end = new Date(date.getFullYear(), date.getMonth() + 3, 0);
    return `Q${Math.ceil(date.getMonth() / 3) + 1} ${date.getFullYear()} (${date.toLocaleDateString("en-US", { month: "short" })}–${end.toLocaleDateString("en-US", { month: "short" })})`;
  }
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function shiftPeriod(startStr: string, period: BudgetPeriod, delta: number): string {
  const [year, month, day] = startStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (period === "weekly") {
    date.setDate(date.getDate() + delta * 7);
    return date.toISOString().split("T")[0];
  }
  if (period === "quarterly") {
    date.setMonth(date.getMonth() + delta * 3);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-01`;
  }
  date.setMonth(date.getMonth() + delta);
  return getFirstOfMonth(date);
}

function getPrevPeriodStart(startStr: string, period: BudgetPeriod): string {
  return shiftPeriod(startStr, period, -1);
}

export default function BudgetsPage() {
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [periodStart, setPeriodStart] = useState(() => getCurrentPeriodStart("monthly"));
  const { data, isLoading } = useBudgetSummary(periodStart, period);
  const copyBudgets = useCopyBudgetsFromMonth();

  // When period tab changes, reset to current period start
  function handlePeriodChange(p: BudgetPeriod) {
    setPeriod(p);
    setPeriodStart(getCurrentPeriodStart(p));
  }

  const existingCategories = data?.budgets.map((b) => b.category) || [];
  const previousPeriodStart = getPrevPeriodStart(periodStart, period);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-muted-foreground">
            Set spending limits by period and track expenses against them
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          {data && data.budgets.length === 0 && (
            <Button
              variant="outline"
              onClick={() =>
                copyBudgets.mutate({
                  sourceMonth: previousPeriodStart,
                  targetMonth: periodStart,
                  period,
                })
              }
              disabled={copyBudgets.isPending}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copyBudgets.isPending ? "Copying..." : `Copy Last ${period === "weekly" ? "Week" : period === "quarterly" ? "Quarter" : "Month"}`}
            </Button>
          )}
          <AddBudgetDialog month={periodStart} existingCategories={existingCategories} period={period} />
        </div>
      </div>

      {/* Period tabs */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handlePeriodChange(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
              period === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Period navigator */}
      <div className="flex items-center justify-center gap-4">
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous period"
          onClick={() => setPeriodStart((s) => shiftPeriod(s, period, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[220px] text-center text-lg font-semibold">
          {formatPeriodLabel(periodStart, period)}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next period"
          onClick={() => setPeriodStart((s) => shiftPeriod(s, period, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary bar */}
      {data && data.budgets.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Budget: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalBudget)}
            </span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <div>
            <span className="text-muted-foreground">Total Spent: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalSpent)}
            </span>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-4" />
          <div>
            <span className="text-muted-foreground">Remaining: </span>
            <span className="font-semibold">
              {formatCurrency(data.totalBudget - data.totalSpent)}
            </span>
          </div>
          {data.totalRollover > 0 && (
            <>
              <Separator orientation="vertical" className="hidden sm:block h-4" />
              <div>
                <span className="text-muted-foreground">Rolled Over: </span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  +{formatCurrency(data.totalRollover)}
                </span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Budget cards grid */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading budgets...</p>
      ) : data && data.budgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {data.budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              spent={data.spentByCategory[budget.category] || 0}
              rollover={data.rolloverByCategory?.[budget.category] ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 space-y-3">
          <p className="text-muted-foreground">
            No budgets set for {formatPeriodLabel(periodStart, period)}.
          </p>
          <p className="text-sm text-muted-foreground">
            Create budgets for your expense categories to track spending limits.
            Your transactions will automatically count against the matching budget.
          </p>
        </div>
      )}
    </div>
  );
}
