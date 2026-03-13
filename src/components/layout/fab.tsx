"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, TrendingDown, TrendingUp, Target, Wallet, Calculator } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { useBudgetSummary } from "@/hooks/use-budgets";

export function FAB() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);

  // Determine context based on current route
  const isGoals = pathname.startsWith("/goals");
  const isAccounts = pathname.startsWith("/accounts");
  const isSettings = pathname.startsWith("/settings");
  const isBudgets = pathname.startsWith("/budgets");
  const isDashboard = pathname === "/" || pathname.startsWith("/dashboard");

  // Budget data for budgets page
  const today = new Date();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const { data: budgetData } = useBudgetSummary(isBudgets ? currentMonth : "", "monthly");
  const existingBudgetCategories = budgetData?.budgets.map((b) => b.category) ?? [];

  // Hide on settings page — nothing to add
  if (isSettings) return null;

  // Always show a single FAB that opens a minimal action sheet/modal
  return (
    <>
      {/* Backdrop for modal */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div data-tour="fab" className="md:hidden fixed right-[calc(env(safe-area-inset-right)+0.875rem)] bottom-[calc(env(safe-area-inset-bottom)+4.6rem)] z-50 flex flex-col-reverse items-end gap-3 pointer-events-none">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg border-2 border-background/80 active:scale-95 transition-all"
          style={{ transform: menuOpen ? "rotate(45deg)" : "rotate(0)" }}
          aria-label={menuOpen ? "Close menu" : "Open actions"}
        >
          <Plus className="h-6 w-6" />
        </button>
        {menuOpen && (
          <div className="pointer-events-auto absolute bottom-16 right-0 w-52 bg-popover border border-border rounded-xl shadow-xl p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 z-50">
            {isGoals && (
              <button
                onClick={() => { setMenuOpen(false); setGoalOpen(true); }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted/40 active:scale-95 transition-all"
              >
                <Target className="h-4 w-4 text-primary" />
                Add Goal
              </button>
            )}
            {isBudgets && (
              <button
                onClick={() => { setMenuOpen(false); setBudgetOpen(true); }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted/40 active:scale-95 transition-all"
              >
                <Calculator className="h-4 w-4 text-primary" />
                Add Budget
              </button>
            )}
            {(isDashboard || pathname.startsWith("/transactions")) && (
              <>
                <button
                  onClick={() => { setMenuOpen(false); setExpenseOpen(true); }}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted/40 active:scale-95 transition-all"
                >
                  <TrendingDown className="h-4 w-4" />
                  Add Expense
                </button>
                <button
                  onClick={() => { setMenuOpen(false); setIncomeOpen(true); }}
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted/40 active:scale-95 transition-all"
                >
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Add Income
                </button>
              </>
            )}
            {isAccounts && (
              <button
                onClick={() => { setMenuOpen(false); setAccountOpen(true); }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium hover:bg-muted/40 active:scale-95 transition-all"
              >
                <Wallet className="h-4 w-4 text-primary" />
                Add Account
              </button>
            )}
          </div>
        )}
      </div>
      {/* Dialogs for each action */}
      <AddGoalDialog open={goalOpen} onOpenChange={setGoalOpen} />
      <AddBudgetDialog
        month={currentMonth}
        existingCategories={existingBudgetCategories}
        period="monthly"
        open={budgetOpen}
        onOpenChange={setBudgetOpen}
      />
      <AddAccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
      <AddTransactionDialog type="expense" open={expenseOpen} onOpenChange={setExpenseOpen} />
      <AddTransactionDialog type="income" open={incomeOpen} onOpenChange={setIncomeOpen} />
    </>
  );
}
