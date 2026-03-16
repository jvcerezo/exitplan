"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Input } from "@/components/ui/input";
import { useUpdateBudget, useToggleBudgetRollover } from "@/hooks/use-budgets";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Budget, BudgetPeriod } from "@/lib/types/database";

const PERIOD_LABEL: Record<BudgetPeriod, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function toMonthlyAmount(amount: number, period: BudgetPeriod): number {
  if (period === "monthly") return amount;
  if (period === "quarterly") return amount / 3;
  return (amount * 52) / 12;
}

function fromMonthlyAmount(monthlyAmount: number, period: BudgetPeriod): number {
  if (period === "monthly") return monthlyAmount;
  if (period === "quarterly") return monthlyAmount * 3;
  return (monthlyAmount * 12) / 52;
}

const BUDGET_QUERY_KEYS = [
  ["budgets"],
  ["budgets", "summary"],
  ["safe-to-spend"],
  ["health-score"],
  ["transactions", "summary"],
];

interface BudgetCardProps {
  budget: Budget;
  spent: number;
  rollover?: number;
}

export function BudgetCard({ budget, spent, rollover = 0 }: BudgetCardProps) {
  const undoDelete = useUndoDelete("budgets", BUDGET_QUERY_KEYS);
  const updateBudget = useUpdateBudget();
  const toggleRollover = useToggleBudgetRollover();
  const [showEquivalents, setShowEquivalents] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(budget.amount));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    try {
      await undoDelete(budget.id, budget.category);
      setConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  }

  // Effective budget = base amount + carried-over unspent from last month
  const effectiveBudget = budget.amount + rollover;
  const percentage = effectiveBudget > 0 ? (spent / effectiveBudget) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);
  const remaining = Math.round((effectiveBudget - spent) * 100) / 100;
  const monthlyEquivalent = toMonthlyAmount(budget.amount, budget.period);
  const equivalentAmounts = (Object.keys(PERIOD_LABEL) as BudgetPeriod[])
    .filter((targetPeriod) => targetPeriod !== budget.period)
    .map((targetPeriod) => ({
      period: targetPeriod,
      amount: roundMoney(fromMonthlyAmount(monthlyEquivalent, targetPeriod)),
    }));

  function getProgressColor(pct: number) {
    if (pct > 100) return "bg-destructive";
    if (pct >= 75) return "bg-amber-500";
    return "bg-primary";
  }

  function handleSaveEdit() {
    const newAmount = parseFloat(editValue);
    if (!newAmount || newAmount <= 0) {
      setEditing(false);
      setEditValue(String(budget.amount));
      return;
    }
    updateBudget.mutate(
      { id: budget.id, amount: newAmount },
      {
        onSuccess: () => setEditing(false),
        onError: () => {
          setEditing(false);
          setEditValue(String(budget.amount));
        },
      }
    );
  }

  return (
    <Card className="rounded-xl border-border/60 bg-card/90 shadow-sm">
      <CardHeader className="pb-2.5">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <CardTitle className="text-base sm:text-sm font-semibold capitalize flex items-center gap-2">
              {budget.category}
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                {PERIOD_LABEL[budget.period]}
              </span>
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Base {PERIOD_LABEL[budget.period]}: {formatCurrency(budget.amount)}
            </p>
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:text-foreground"
              onClick={() => setShowEquivalents((current) => !current)}
            >
              {showEquivalents ? "Hide" : "View"} equivalents
            </button>
            {showEquivalents && (
              <p className="text-[10px] text-muted-foreground">
                {equivalentAmounts.map((item) => `${PERIOD_LABEL[item.period]} ${formatCurrency(item.amount)}`).join(" · ")}
              </p>
            )}
            {rollover > 0 && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                +{formatCurrency(rollover)} rolled over
              </p>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className={cn(
                "h-8 w-8 rounded-md",
                "transition-colors",
                budget.rollover
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={budget.rollover ? "Disable rollover" : "Enable rollover"}
              title={budget.rollover ? "Rollover on — unspent carries to next month" : "Enable rollover"}
              onClick={() =>
                toggleRollover.mutate({ id: budget.id, rollover: !budget.rollover })
              }
              disabled={toggleRollover.isPending}
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              aria-label={`Edit ${budget.category} budget`}
              onClick={() => {
                setEditValue(String(budget.amount));
                setEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="h-8 w-8 rounded-md text-muted-foreground hover:bg-muted/70 hover:text-destructive"
              aria-label={`Delete ${budget.category} budget`}
              onClick={() => setConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Budget amount — editable */}
        {editing ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-muted-foreground">₱</span>
            <Input
              type="number"
              step="0.01"
              min="1"
              max="9999999999.99"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="h-7 text-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") {
                  setEditing(false);
                  setEditValue(String(budget.amount));
                }
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Save"
              onClick={handleSaveEdit}
              disabled={updateBudget.isPending}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Cancel"
              onClick={() => {
                setEditing(false);
                setEditValue(String(budget.amount));
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-baseline justify-between gap-2 text-sm">
            <span className="text-xs sm:text-sm text-muted-foreground">
              {formatCurrency(spent)} spent
            </span>
            <span className="text-xs sm:text-sm font-medium text-right">
              of {formatCurrency(effectiveBudget)}
              {rollover > 0 && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({formatCurrency(budget.amount)} base)
                </span>
              )}
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/70">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              getProgressColor(percentage)
            )}
            style={{ width: `${clampedPercentage}%` }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-baseline justify-between">
          <p
            className={cn(
              "text-xs font-medium",
              percentage > 100
                ? "text-destructive"
                : percentage >= 75
                  ? "text-amber-500"
                  : "text-muted-foreground"
            )}
          >
            {percentage.toFixed(0)}% used
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              remaining < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400"
            )}
          >
            {remaining < 0
              ? `${formatCurrency(Math.abs(remaining))} over`
              : `${formatCurrency(remaining)} left`}
          </p>
        </div>
      </CardContent>
      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete budget?"
        description={`This permanently deletes the ${budget.category} budget.`}
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </Card>
  );
}
