"use client";

import { useState } from "react";
import {
  Plus,
  Utensils,
  Home,
  Car,
  Film,
  Heart,
  GraduationCap,
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
import { useAddBudget, useBudgetRecommendations } from "@/hooks/use-budgets";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { formatCurrency, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { BudgetPeriod } from "@/lib/types/database";

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  food: Utensils,
  housing: Home,
  transportation: Car,
  entertainment: Film,
  healthcare: Heart,
  education: GraduationCap,
  other: Ellipsis,
};

const PERIOD_OPTIONS: { value: BudgetPeriod; label: string; desc: string }[] = [
  { value: "weekly", label: "Weekly", desc: "Resets every 7 days" },
  { value: "monthly", label: "Monthly", desc: "Resets each month" },
  { value: "quarterly", label: "Quarterly", desc: "Resets every 3 months" },
];

interface AddBudgetDialogProps {
  month: string;
  existingCategories: string[];
  period?: BudgetPeriod;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
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

export function AddBudgetDialog({ month, existingCategories, period: defaultPeriod = "monthly", open: controlledOpen, onOpenChange: controlledOnOpenChange }: AddBudgetDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;
  const [showAdvancedPeriods, setShowAdvancedPeriods] = useState(defaultPeriod !== "monthly");
  const [showConvertedOptions, setShowConvertedOptions] = useState(false);

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<BudgetPeriod>(defaultPeriod);
  const addBudget = useAddBudget();
  const { data: recommendations } = useBudgetRecommendations();

  const suggestion = recommendations?.find(
    (r) => r.category === category
  );

  const numericAmount = amount ? Number.parseFloat(amount) : NaN;
  const hasValidAmount = Number.isFinite(numericAmount) && numericAmount > 0;
  const monthlyEquivalent = hasValidAmount
    ? toMonthlyAmount(numericAmount, period)
    : null;

  const convertedOptions = hasValidAmount && monthlyEquivalent !== null
    ? PERIOD_OPTIONS
        .filter((opt) => opt.value !== period)
        .map((opt) => {
          const converted = roundMoney(fromMonthlyAmount(monthlyEquivalent, opt.value));
          return {
            period: opt.value,
            label: opt.label,
            amount: converted,
          };
        })
    : [];

  const normalizedExistingCategories = existingCategories.map((item) => item.toLowerCase());

  // Only allow categories not already budgeted for this period
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (cat) => !normalizedExistingCategories.includes(cat.toLowerCase()) || cat.toLowerCase() === category
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const normalizedCategory = category.toLowerCase();

    // Prevent duplicate budget for same category/period
    if (normalizedExistingCategories.includes(normalizedCategory)) {
      toast.error("A budget for this category already exists in this period");
      return;
    }

    await addBudget.mutateAsync({
      category: normalizedCategory,
      amount: parseFloat(amount),
      month,
      period,
    });

    setOpen(false);
    setCategory("");
    setAmount("");
    setPeriod(defaultPeriod);
    setShowAdvancedPeriods(defaultPeriod !== "monthly");
    setShowConvertedOptions(false);
  }

  if (availableCategories.length === 0 && !isControlled) {
    return (
      <Button type="button" disabled>
        <Plus className="h-4 w-4 mr-2" />
        All Categories Budgeted
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button type="button">
            <Plus className="h-4 w-4 mr-2" />
            Add Budget
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-md overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Add Budget</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Set a spending limit for a category. Monthly is the default.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setShowAdvancedPeriods((current) => {
                  const next = !current;
                  if (!next) {
                    setPeriod("monthly");
                  }
                  return next;
                });
              }}
            >
              {showAdvancedPeriods ? "Hide weekly/quarterly options" : "Use weekly/quarterly instead"}
            </button>
            {showAdvancedPeriods && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Period</p>
                <div className="grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setPeriod(opt.value)}
                      className={cn(
                        "flex flex-col items-center gap-0.5 rounded-lg px-2 py-2 text-xs font-medium transition-colors border",
                        period === opt.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
                      )}
                    >
                      <span className="font-semibold">{opt.label}</span>
                      <span className={cn("text-[10px]", period === opt.value ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Category pills */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => {
                const Icon = CATEGORY_ICONS[cat.toLowerCase()] ?? Ellipsis;
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
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              {period === "weekly" ? "Weekly" : period === "quarterly" ? "Quarterly" : "Monthly"} Limit
            </p>
            <div className="flex items-baseline gap-2 py-2">
              <span className="text-3xl font-bold text-muted-foreground/50">
                ₱
              </span>
              <input
                name="amount"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={formatAmount(amount)}
                onChange={(e) => setAmount(parseAmountInput(e.target.value))}
                required
                className="w-0 min-w-0 flex-1 bg-transparent text-3xl font-bold outline-none placeholder:text-muted-foreground/30"
              />
            </div>
            {suggestion && (
              <button
                type="button"
                onClick={() => setAmount(String(suggestion.suggested))}
                className="text-xs text-primary hover:underline"
              >
                Suggested: {formatCurrency(suggestion.suggested)} (avg{" "}
                {formatCurrency(suggestion.average)}/mo)
              </button>
            )}
            {convertedOptions.length > 0 && (
              <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5">
                <button
                  type="button"
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                  onClick={() => setShowConvertedOptions((current) => !current)}
                >
                  {showConvertedOptions ? "Hide" : "Show"} equivalent limits
                </button>
                {showConvertedOptions && (
                  <div className="flex flex-wrap gap-2">
                    {convertedOptions.map((option) => (
                      <button
                        key={option.period}
                        type="button"
                        onClick={() => {
                          setPeriod(option.period);
                          setAmount(String(option.amount));
                          setShowAdvancedPeriods(true);
                        }}
                        className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted"
                      >
                        {option.label}: {formatCurrency(option.amount)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              addBudget.isPending ||
              !category ||
              !amount ||
              normalizedExistingCategories.includes(category.toLowerCase())
            }
          >
            {addBudget.isPending ? "Adding..." : "Add Budget"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
