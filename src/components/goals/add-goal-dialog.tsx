"use client";

import { useState } from "react";
import {
  Plus,
  Shield,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Clock,
  Plane,
  GraduationCap,
  Home,
  Car,
  Ellipsis,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAddGoal } from "@/hooks/use-goals";
import { GOAL_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const GOAL_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "emergency fund": Shield,
  "debt payoff": CreditCard,
  savings: PiggyBank,
  investment: TrendingUp,
  retirement: Clock,
  travel: Plane,
  education: GraduationCap,
  home: Home,
  vehicle: Car,
  other: Ellipsis,
};

interface AddGoalDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

function formatAmount(raw: string): string {
  if (!raw) return "";
  const [intPart, decPart] = raw.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
}

function parseAmountInput(value: string): string {
  const stripped = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  if (!stripped) return "";

  const [intPartRaw, ...rest] = stripped.split(".");
  const decimalPart = rest.join("");
  const normalizedInt = intPartRaw.replace(/^0+(?=\d)/, "");

  if (rest.length > 0) {
    return `${normalizedInt || "0"}.${decimalPart}`;
  }

  return normalizedInt;
}

export function AddGoalDialog({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  trigger,
}: AddGoalDialogProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const addGoal = useAddGoal();

  function resetForm() {
    setCategory("");
    setCustomCategory("");
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const finalCategory =
      category === "other" && customCategory.trim()
        ? customCategory.trim().toLowerCase()
        : category;

    await addGoal.mutateAsync({
      name,
      target_amount: parseFloat(targetAmount),
      current_amount: parseFloat(currentAmount || "0"),
      deadline: deadline || null,
      category: finalCategory,
    });

    setOpen(false);
    resetForm();
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-md overflow-x-hidden p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-base sm:text-lg">Create a New Goal</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category pills */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground mb-1">Category</p>
          <div className="flex flex-wrap gap-2">
            {GOAL_CATEGORIES.map((cat) => {
              const Icon = GOAL_ICONS[cat.toLowerCase()] ?? Ellipsis;
              const isSelected = category === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat.toLowerCase())}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-colors border min-w-[90px] justify-center",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-muted/60 text-muted-foreground border-transparent hover:bg-muted"
                  )}
                  style={{ touchAction: 'manipulation' }}
                >
                  <Icon className="h-4 w-4" />
                  {cat}
                </button>
              );
            })}
          </div>
          {category === "other" && (
            <input
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Type your category..."
              autoFocus
              className="w-full bg-transparent text-sm font-medium outline-none border-b border-border pb-2 placeholder:text-muted-foreground/40 focus:border-primary transition-colors mt-1"
            />
          )}
        </div>

        {/* Goal name */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Goal Name</p>
          <input
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Emergency Fund"
            required
            className="w-full bg-transparent text-sm font-medium outline-none border-b border-border pb-2 placeholder:text-muted-foreground/40 focus:border-primary transition-colors"
          />
        </div>

        {/* Target amount */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Target Amount</p>
          <div className="flex items-baseline gap-2 py-1">
            <span className="text-2xl font-bold text-muted-foreground/50">₱</span>
            <input
              name="target_amount"
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={formatAmount(targetAmount)}
              onChange={(e) => setTargetAmount(parseAmountInput(e.target.value))}
              required
              className="w-0 min-w-0 flex-1 bg-transparent text-2xl font-bold outline-none placeholder:text-muted-foreground/30"
            />
          </div>
        </div>

        {/* Saved so far + Deadline row */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Saved So Far</p>
            <div className="flex items-center gap-1.5 rounded-lg border border-border px-2 py-1.5">
              <span className="text-sm text-muted-foreground/50">₱</span>
              <input
                name="current_amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formatAmount(currentAmount)}
                onChange={(e) => setCurrentAmount(parseAmountInput(e.target.value))}
                className="w-0 min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/40"
              />
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Deadline</p>
            <input
              name="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full rounded-lg border border-border px-2 py-1.5 text-sm font-medium bg-transparent outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={addGoal.isPending || !category || !name || !targetAmount || (category === "other" && !customCategory.trim())}
        >
          {addGoal.isPending ? "Creating..." : "Create Goal"}
        </Button>
      </form>
    </DialogContent>
  );

  const onOpenChangeHandler = (v: boolean) => {
    setOpen(v);
    if (!v) resetForm();
  };

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChangeHandler}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChangeHandler}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        )}
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}
