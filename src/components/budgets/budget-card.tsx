"use client";

import { useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useUpdateBudget } from "@/hooks/use-budgets";
import { useUndoDelete } from "@/hooks/use-undo-delete";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { Budget } from "@/lib/types/database";

const BUDGET_QUERY_KEYS = [["budgets"]];

interface BudgetCardProps {
  budget: Budget;
  spent: number;
}

export function BudgetCard({ budget, spent }: BudgetCardProps) {
  const undoDelete = useUndoDelete("budgets", BUDGET_QUERY_KEYS);
  const updateBudget = useUpdateBudget();
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(budget.amount));

  const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);
  const remaining = Math.round((budget.amount - spent) * 100) / 100;

  function getProgressColor(pct: number) {
    if (pct > 100) return "bg-red-500";
    if (pct >= 75) return "bg-yellow-500";
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
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium capitalize">
            {budget.category}
          </CardTitle>
          <div className="flex gap-0.5">
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`Edit ${budget.category} budget`}
              onClick={() => {
                setEditValue(String(budget.amount));
                setEditing(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${budget.category} budget`}
              onClick={() => undoDelete(budget.id, budget.category)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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
              variant="ghost"
              size="icon-xs"
              aria-label="Save"
              onClick={handleSaveEdit}
              disabled={updateBudget.isPending}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
            <Button
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
          <div className="flex items-baseline justify-between text-sm">
            <span className="text-muted-foreground">
              {formatCurrency(spent)} spent
            </span>
            <span className="font-medium">
              of {formatCurrency(budget.amount)}
            </span>
          </div>
        )}

        {/* Progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
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
                ? "text-red-500"
                : percentage >= 75
                  ? "text-yellow-500"
                  : "text-muted-foreground"
            )}
          >
            {percentage.toFixed(0)}% used
          </p>
          <p
            className={cn(
              "text-xs font-medium",
              remaining < 0 ? "text-red-500" : "text-muted-foreground"
            )}
          >
            {remaining < 0
              ? `${formatCurrency(Math.abs(remaining))} over`
              : `${formatCurrency(remaining)} left`}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
