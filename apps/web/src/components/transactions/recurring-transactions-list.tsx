"use client";

import { useState } from "react";
import {
  Repeat,
  Plus,
  Pencil,
  Trash2,
  Pause,
  Play,
  Utensils,
  Home,
  Car,
  Film,
  Heart,
  GraduationCap,
  Banknote,
  Laptop,
  TrendingUp,
  Ellipsis,
  CalendarClock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { AddRecurringDialog } from "./add-recurring-dialog";
import {
  useRecurringTransactions,
  useDeleteRecurringTransaction,
  useUpdateRecurringTransaction,
} from "@/hooks/use-recurring-transactions";
import { CURRENCIES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { RecurringTransaction, RecurringFrequency } from "@/lib/types/database";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  food: Utensils,
  housing: Home,
  transportation: Car,
  entertainment: Film,
  healthcare: Heart,
  education: GraduationCap,
  salary: Banknote,
  freelance: Laptop,
  investment: TrendingUp,
  other: Ellipsis,
};

function frequencyLabel(frequency: RecurringFrequency, intervalCount: number): string {
  const unit =
    frequency === "daily"
      ? intervalCount === 1 ? "day" : "days"
      : frequency === "weekly"
        ? intervalCount === 1 ? "week" : "weeks"
        : frequency === "monthly"
          ? intervalCount === 1 ? "month" : "months"
          : intervalCount === 1 ? "year" : "years";

  return intervalCount === 1 ? `Every ${unit}` : `Every ${intervalCount} ${unit}`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isDue(nextRunDate: string): boolean {
  const today = new Date().toISOString().split("T")[0];
  return nextRunDate <= today;
}

interface RecurringCardProps {
  item: RecurringTransaction;
  onEdit: (item: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onToggleActive: (item: RecurringTransaction) => void;
}

function RecurringCard({ item, onEdit, onDelete, onToggleActive }: RecurringCardProps) {
  const isIncome = item.amount > 0;
  const absAmount = Math.abs(item.amount);
  const currencySymbol = CURRENCIES.find((c) => c.code === item.currency)?.symbol ?? "₱";
  const Icon = CATEGORY_ICONS[item.category.toLowerCase()] ?? Ellipsis;
  const due = isDue(item.next_run_date) && item.is_active;

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        item.is_active ? "bg-card border-border" : "bg-muted/30 border-border/50 opacity-60"
      }`}
    >
      {/* Icon */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
          isIncome ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 text-destructive"
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">
            {item.description || item.category}
          </p>
          {due && (
            <span className="shrink-0 rounded-full bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
              Due
            </span>
          )}
          {!item.is_active && (
            <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
              Paused
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {frequencyLabel(item.frequency, item.interval_count)}
          </span>
          {item.run_time && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <span className="text-xs text-muted-foreground">
                {item.run_time.slice(0, 5)}
              </span>
            </>
          )}
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarClock className="h-3 w-3" />
            Next: {formatDate(item.next_run_date)}
          </span>
        </div>
      </div>

      {/* Amount */}
      <div className="shrink-0 text-right">
        <p
          className={`text-sm font-semibold ${
            isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }`}
        >
          {isIncome ? "+" : "-"}
          {currencySymbol}
          {formatCurrency(absAmount)}
        </p>
        <p className="text-[10px] text-muted-foreground capitalize">{item.category}</p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={() => onToggleActive(item)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title={item.is_active ? "Pause" : "Resume"}
        >
          {item.is_active ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-destructive transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export function RecurringTransactionsList() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<RecurringTransaction | undefined>();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const { data: recurring, isLoading } = useRecurringTransactions();
  const deleteRecurring = useDeleteRecurringTransaction();
  const updateRecurring = useUpdateRecurringTransaction();

  const items = recurring ?? [];
  const activeCount = items.filter((r) => r.is_active).length;
  const dueCount = items.filter((r) => r.is_active && isDue(r.next_run_date)).length;

  function handleEdit(item: RecurringTransaction) {
    setEditTarget(item);
    setEditDialogOpen(true);
  }

  function handleDelete(id: string) {
    setDeleteTargetId(id);
  }

  async function confirmDelete() {
    if (!deleteTargetId) return;
    await deleteRecurring.mutateAsync(deleteTargetId);
    setDeleteTargetId(null);
  }

  async function handleToggleActive(item: RecurringTransaction) {
    await updateRecurring.mutateAsync({
      id: item.id,
      is_active: !item.is_active,
    });
  }

  return (
    <>
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="h-9 gap-1.5 sm:h-10 relative">
            <Repeat className="h-4 w-4" />
            Recurring
            {dueCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                {dueCount}
              </span>
            )}
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex w-full flex-col sm:max-w-md p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary" />
                Recurring Transactions
              </SheetTitle>
              <Button
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                className="h-8 gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                New
              </Button>
            </div>
            {items.length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeCount} active
                {dueCount > 0 && (
                  <> · <span className="text-amber-600 dark:text-amber-400 font-medium">{dueCount} due</span></>
                )}
              </p>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && items.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <div className="rounded-full bg-muted p-4">
                  <Repeat className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium">No recurring transactions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set up automatic income or expense entries
                  </p>
                </div>
                <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Add first recurring
                </Button>
              </div>
            )}

            {!isLoading && items.length > 0 && (
              <div className="space-y-2">
                {items.map((item) => (
                  <RecurringCard
                    key={item.id}
                    item={item}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Add dialog */}
      <AddRecurringDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />

      {/* Edit dialog */}
      <AddRecurringDialog
        existing={editTarget}
        open={editDialogOpen}
        onOpenChange={(v) => {
          setEditDialogOpen(v);
          if (!v) setEditTarget(undefined);
        }}
      />

      {/* Delete confirmation */}
      <ConfirmDeleteDialog
        open={deleteTargetId !== null}
        onOpenChange={(v) => { if (!v) setDeleteTargetId(null); }}
        title="Delete recurring transaction?"
        description="This will stop future transactions from being created. Past transactions already added will not be affected."
        onConfirm={confirmDelete}
        isPending={deleteRecurring.isPending}
      />
    </>
  );
}
