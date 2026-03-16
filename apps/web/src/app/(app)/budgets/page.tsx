"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Copy, Wallet, TrendingDown, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BudgetCard } from "@/components/budgets/budget-card";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useBudgetSummary, useCopyBudgetsFromMonth } from "@/hooks/use-budgets";
import { formatCurrency, cn } from "@/lib/utils";
import type { Budget, BudgetPeriod } from "@/lib/types/database";

const PERIOD_TABS: { value: BudgetPeriod; label: string }[] = [
  { value: "monthly", label: "Monthly" },
  { value: "weekly", label: "Weekly" },
  { value: "quarterly", label: "Quarterly" },
];

function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day); // Sunday
  return formatDateLocal(d);
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
    return formatDateLocal(date);
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
  const [showAdvancedPeriods, setShowAdvancedPeriods] = useState(false);
  const [period, setPeriod] = useState<BudgetPeriod>("monthly");
  const [periodStart, setPeriodStart] = useState(() => getCurrentPeriodStart("monthly"));
  const { data, isLoading } = useBudgetSummary(periodStart, period);
  const copyBudgets = useCopyBudgetsFromMonth();

  // When period tab changes, reset to current period start
  function handlePeriodChange(p: BudgetPeriod) {
    setPeriod(p);
    setPeriodStart(getCurrentPeriodStart(p));
  }

  function handleToggleAdvancedPeriods() {
    setShowAdvancedPeriods((current) => {
      const next = !current;
      if (!next && period !== "monthly") {
        setPeriod("monthly");
        setPeriodStart(getCurrentPeriodStart("monthly"));
      }
      return next;
    });
  }

  const visibleBudgets = useMemo(() => {
    if (!data) return [] as Budget[];
    const byCategory = new Map<string, Budget>();

    for (const budget of data.budgets) {
      if (!byCategory.has(budget.category)) {
        byCategory.set(budget.category, budget);
      }
    }

    return Array.from(byCategory.values());
  }, [data]);

  const existingCategories = visibleBudgets.map((b) => b.category);

  const displayTotals = useMemo(() => {
    const totalBudget = Math.round(
      visibleBudgets.reduce((sum, budget) => sum + budget.amount, 0) * 100
    ) / 100;

    const totalRollover = Math.round(
      visibleBudgets.reduce(
        (sum, budget) => sum + (data?.rolloverByCategory?.[budget.category] ?? 0),
        0
      ) * 100
    ) / 100;

    const totalSpent = Math.round(
      visibleBudgets.reduce(
        (sum, budget) => sum + (data?.spentByCategory?.[budget.category] ?? 0),
        0
      ) * 100
    ) / 100;

    return { totalBudget, totalRollover, totalSpent };
  }, [data, visibleBudgets]);

  // Compute unbudgeted spending and transactions
  const unbudgeted = useMemo(() => {
    if (!data) return { total: 0, txs: [] };
    const budgetedSet = new Set(visibleBudgets.map((b) => b.category));
    const allTx = data.transactions || [];
    const txs = allTx.filter((tx) => !budgetedSet.has(tx.category));
    const total = txs.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { total, txs };
  }, [data, visibleBudgets]);
  const [showUnbudgeted, setShowUnbudgeted] = useState(false);
  const previousPeriodStart = getPrevPeriodStart(periodStart, period);
  const remaining = displayTotals.totalBudget - displayTotals.totalSpent;
  const isOverBudget = remaining < 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Keep it simple with monthly budgets, and use advanced periods only when needed
          </p>
        </div>
        <div className="hidden sm:flex gap-2">
          {data && visibleBudgets.length === 0 && (
            <Button
              type="button"
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
      <SegmentedControl
        options={showAdvancedPeriods ? PERIOD_TABS : [PERIOD_TABS[0]]}
        value={period}
        onChange={handlePeriodChange}
        className="rounded-xl bg-muted/25"
        buttonClassName="text-sm"
      />
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {showAdvancedPeriods
            ? "Advanced mode: weekly and quarterly views are enabled."
            : "Simple mode: monthly view only."}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleToggleAdvancedPeriods}
        >
          {showAdvancedPeriods ? "Hide weekly/quarterly" : "Show weekly/quarterly"}
        </Button>
      </div>

      {/* Period navigator */}
      <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-muted/20 p-2 sm:justify-center sm:gap-4">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg border border-border/60 bg-background/70"
          aria-label="Previous period"
          onClick={() => setPeriodStart((s) => shiftPeriod(s, period, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-0 flex-1 text-center text-sm font-semibold leading-tight sm:min-w-[220px] sm:text-lg">
          {formatPeriodLabel(periodStart, period)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 rounded-lg border border-border/60 bg-background/70"
          aria-label="Next period"
          onClick={() => setPeriodStart((s) => shiftPeriod(s, period, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Summary bar */}
      {data && visibleBudgets.length > 0 && (
        <>
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-3 sm:overflow-visible sm:gap-3 text-sm">
          <div className="min-w-[160px] rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5 sm:min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" /> Total Budget
            </p>
            <p className="font-semibold tabular-nums">{formatCurrency(displayTotals.totalBudget)}</p>
          </div>
          <div className="min-w-[160px] rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5 sm:min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <TrendingDown className="h-3.5 w-3.5" /> Total Spent
            </p>
            <p className="font-semibold tabular-nums">{formatCurrency(displayTotals.totalSpent)}</p>
          </div>
          <div className="min-w-[170px] rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5 sm:min-w-0">
            <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
              <Scale className="h-3.5 w-3.5" /> Remaining
            </p>
            <p className={cn("font-semibold tabular-nums", isOverBudget ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
              {formatCurrency(remaining)}
            </p>
          </div>
          {displayTotals.totalRollover > 0 && (
            <>
              <Separator orientation="vertical" className="hidden sm:block h-4" />
              <div className="min-w-[170px] rounded-xl border border-border/60 bg-muted/25 px-3 py-2.5 col-span-2 sm:col-span-1 sm:min-w-0">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Rolled Over</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">+{formatCurrency(displayTotals.totalRollover)}</p>
              </div>
            </>
          )}
        </div>
        {/* Unbudgeted spending summary */}
        {unbudgeted.total > 0 && (
          <div className="mt-2">
            <button
              className="rounded-xl border border-amber-400/60 bg-amber-100/60 px-3 py-2.5 text-left w-full flex items-center justify-between gap-2 hover:bg-amber-200/60 transition-colors"
              onClick={() => setShowUnbudgeted(true)}
            >
              <span className="font-semibold text-amber-700">Unbudgeted Spending</span>
              <span className="font-semibold text-amber-700 tabular-nums">{formatCurrency(unbudgeted.total)}</span>
            </button>
          </div>
        )}
        <Dialog open={showUnbudgeted} onOpenChange={setShowUnbudgeted}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Unbudgeted Spending</DialogTitle>
            </DialogHeader>
            {unbudgeted.txs.length === 0 ? (
              <p className="text-muted-foreground">No unbudgeted transactions for this period.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {unbudgeted.txs.map((tx, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded border px-3 py-2 bg-background">
                    <span className="truncate text-sm font-medium">{tx.description || tx.category}</span>
                    <span className="shrink-0 text-sm font-semibold text-amber-700 tabular-nums">{formatCurrency(Math.abs(tx.amount))}</span>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
        </>
      )}

      {/* Budget cards grid */}
      {isLoading ? (
        <p className="text-center text-muted-foreground">Loading budgets...</p>
      ) : data && visibleBudgets.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
          {visibleBudgets.map((budget) => (
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
