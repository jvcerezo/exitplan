"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, TrendingDown, TrendingUp, Target, Wallet } from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { AddGoalDialog } from "@/components/goals/add-goal-dialog";
import { AddAccountDialog } from "@/components/accounts/add-account-dialog";

export function FAB() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Determine context based on current route
  const isGoals = pathname.startsWith("/goals");
  const isAccounts = pathname.startsWith("/accounts");
  const isSettings = pathname.startsWith("/settings");

  // Hide on settings page — nothing to add
  if (isSettings) return null;

  // Single-action pages: tap FAB directly opens dialog
  if (isGoals) {
    return (
      <>
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => setGoalOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
            aria-label="New goal"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
        <AddGoalDialog open={goalOpen} onOpenChange={setGoalOpen} />
      </>
    );
  }

  if (isAccounts) {
    return (
      <>
        <div className="md:hidden fixed bottom-20 right-4 z-50">
          <button
            onClick={() => setAccountOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
            aria-label="Add account"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
        <AddAccountDialog open={accountOpen} onOpenChange={setAccountOpen} />
      </>
    );
  }

  // Dashboard & Transactions: expand menu with Expense / Income
  return (
    <>
      {/* Backdrop */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* FAB container */}
      <div className="md:hidden fixed bottom-20 right-4 z-50 flex flex-col-reverse items-end gap-3">
        {/* Main FAB button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg active:scale-95 transition-all"
          style={{ transform: menuOpen ? "rotate(45deg)" : "rotate(0)" }}
          aria-label={menuOpen ? "Close menu" : "Add transaction"}
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Expanded options */}
        {menuOpen && (
          <>
            <button
              onClick={() => {
                setMenuOpen(false);
                setExpenseOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-background border shadow-lg px-4 py-2.5 text-sm font-medium active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              <TrendingDown className="h-4 w-4" />
              Expense
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                setIncomeOpen(true);
              }}
              className="flex items-center gap-2 rounded-full bg-background border shadow-lg px-4 py-2.5 text-sm font-medium active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
            >
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Income
            </button>
          </>
        )}
      </div>

      {/* Controlled dialogs */}
      <AddTransactionDialog
        type="expense"
        open={expenseOpen}
        onOpenChange={setExpenseOpen}
      />
      <AddTransactionDialog
        type="income"
        open={incomeOpen}
        onOpenChange={setIncomeOpen}
      />
    </>
  );
}
