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

export function AddGoalDialog() {
  const [open, setOpen] = useState(false);
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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a New Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category pills */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Category
            </p>
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
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border",
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
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
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Goal Name
            </p>
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
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Target Amount
            </p>
            <div className="flex items-baseline gap-2 py-2">
              <span className="text-3xl font-bold text-muted-foreground/50">
                ₱
              </span>
              <input
                name="target_amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="1"
                max="9999999999.99"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
                className="flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Saved so far + Deadline row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Saved So Far
              </p>
              <div className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2">
                <span className="text-sm text-muted-foreground/50">₱</span>
                <input
                  name="current_amount"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Deadline
              </p>
              <input
                name="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium bg-transparent outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={addGoal.isPending || !category || !name || !targetAmount || (category === "other" && !customCategory.trim())}
          >
            {addGoal.isPending ? "Creating..." : "Create Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
