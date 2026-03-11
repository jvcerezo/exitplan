"use client";

import { useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Landmark,
  LayoutDashboard,
  Map,
  PiggyBank,
  Plane,
  Plus,
  Receipt,
  Search,
  Settings,
  Shield,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { TOUR_STEPS } from "@/hooks/use-tour";
import { useTourContext } from "@/providers/tour-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TourStep } from "@/hooks/use-tour";

function DashboardMockup() {
  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="mb-1 text-[10px] font-bold">Dashboard</div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { label: "Balance", val: "PHP 42,267", color: "text-foreground" },
          { label: "Income", val: "PHP 33,500", color: "text-green-500" },
          { label: "Expenses", val: "PHP 7,232", color: "text-rose-500" },
        ].map((card) => (
          <div key={card.label} className="space-y-0.5 rounded-lg border bg-card px-2 py-2">
            <div className="text-[8px] text-muted-foreground">{card.label}</div>
            <div className={cn("text-[10px] font-bold", card.color)}>{card.val}</div>
          </div>
        ))}
      </div>
      <div className="flex-1 rounded-lg border bg-card p-2">
        <div className="flex h-full items-end gap-1 overflow-hidden">
          {[40, 65, 45, 80, 55, 70, 48, 90, 60, 75, 50, 85].map((height, index) => (
            <div
              key={index}
              className="flex-1 rounded-sm bg-primary/30"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary">
          <span className="text-[9px] font-bold text-primary">82</span>
        </div>
        <div>
          <div className="text-[9px] font-semibold">Financial Health</div>
          <div className="text-[8px] text-muted-foreground">Good - improving</div>
        </div>
        <TrendingUp className="ml-auto h-3 w-3 text-green-500" />
      </div>
    </div>
  );
}

function TransactionsMockup() {
  const rows = [
    { name: "Salary", cat: "Income", amt: "+PHP 33,500", color: "text-green-500" },
    { name: "Groceries", cat: "Food", amt: "-PHP 2,100", color: "text-rose-500" },
    { name: "GCash top-up", cat: "Transfer", amt: "-PHP 5,000", color: "text-muted-foreground" },
    { name: "Electricity", cat: "Utilities", amt: "-PHP 1,200", color: "text-rose-500" },
  ];

  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[10px] font-bold">Transactions</div>
        <Receipt className="h-3 w-3 text-muted-foreground/60" />
      </div>
      {rows.map((row) => (
        <div key={row.name} className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2">
          <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
            <CircleDollarSign className="h-3 w-3 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[9px] font-semibold">{row.name}</div>
            <div className="text-[8px] text-muted-foreground">{row.cat}</div>
          </div>
          <div className={cn("text-[9px] font-mono font-medium", row.color)}>{row.amt}</div>
        </div>
      ))}
    </div>
  );
}

function GoalsMockup() {
  const goals = [
    { name: "Emergency Fund", pct: 40, Icon: Shield, color: "bg-blue-500" },
    { name: "Travel", pct: 62, Icon: Plane, color: "bg-violet-500" },
    { name: "Savings", pct: 28, Icon: PiggyBank, color: "bg-emerald-500" },
  ];

  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[10px] font-bold">Goals</div>
        <Target className="h-3 w-3 text-muted-foreground/60" />
      </div>
      <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
        <CircleDollarSign className="h-3 w-3 text-primary" />
        <span className="text-[9px] font-semibold text-primary">3 active - PHP 32,000 saved</span>
      </div>
      {goals.map((goal) => (
        <div key={goal.name} className="space-y-1.5 rounded-lg border bg-card px-2.5 py-2">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full", goal.color)}>
              <goal.Icon className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="flex-1 truncate text-[9px] font-semibold">{goal.name}</span>
            <span className="text-[9px] text-muted-foreground">{goal.pct}%</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", goal.color)} style={{ width: `${goal.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function BudgetsMockup() {
  const budgets = [
    { name: "Food", spent: "PHP 4,200", limit: "PHP 6,000", pct: 70, color: "bg-amber-500" },
    { name: "Transport", spent: "PHP 1,900", limit: "PHP 3,000", pct: 63, color: "bg-sky-500" },
    { name: "Bills", spent: "PHP 2,800", limit: "PHP 4,000", pct: 70, color: "bg-violet-500" },
  ];

  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[10px] font-bold">Budgets</div>
        <BarChart3 className="h-3 w-3 text-muted-foreground/60" />
      </div>
      {budgets.map((budget) => (
        <div key={budget.name} className="space-y-1.5 rounded-lg border bg-card px-2.5 py-2">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-semibold">{budget.name}</span>
            <span className="text-[8px] text-muted-foreground">{budget.spent} / {budget.limit}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", budget.color)} style={{ width: `${budget.pct}%` }} />
          </div>
        </div>
      ))}
      <div className="rounded-lg border border-dashed border-primary/30 px-3 py-2 text-center text-[9px] text-primary/70">
        Monthly alerts keep you on track
      </div>
    </div>
  );
}

function AccountsMockup() {
  const accounts = [
    { name: "GCash", type: "E-Wallet", bal: "PHP 3,200", color: "bg-blue-500" },
    { name: "BDO", type: "Bank", bal: "PHP 18,450", color: "bg-green-500" },
    { name: "Cash", type: "Cash", bal: "PHP 1,500", color: "bg-amber-500" },
  ];

  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[10px] font-bold">Accounts</div>
        <Landmark className="h-3 w-3 text-muted-foreground/60" />
      </div>
      <div className="flex items-center justify-between rounded-lg bg-primary/10 px-3 py-1.5">
        <span className="text-[9px] text-muted-foreground">Total</span>
        <span className="text-[10px] font-bold text-primary">PHP 23,150</span>
      </div>
      {accounts.map((account) => (
        <div key={account.name} className="flex items-center gap-2 rounded-lg border bg-card px-2.5 py-2">
          <div className={cn("flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full", account.color)}>
            <Landmark className="h-3 w-3 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[9px] font-semibold">{account.name}</div>
            <div className="text-[8px] text-muted-foreground">{account.type}</div>
          </div>
          <div className="text-[9px] font-mono font-medium">{account.bal}</div>
        </div>
      ))}
    </div>
  );
}

function FabMockup() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-4 select-none pointer-events-none">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-primary/30">
        <Plus className="h-7 w-7 text-primary-foreground" />
        <span
          className="absolute h-16 w-16 rounded-full border-2 border-primary/40 animate-ping"
          style={{ animationDuration: "2s" }}
        />
      </div>
      <div className="space-y-1 text-center">
        <p className="text-xs font-semibold">Quick Add</p>
        <p className="text-[10px] text-muted-foreground">One tap to log any transaction</p>
      </div>
      <div className="flex gap-2">
        {["Expense", "Income"].map((type) => (
          <div
            key={type}
            className={cn(
              "rounded-full border px-3 py-1 text-[10px] font-medium",
              type === "Expense"
                ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                : "border-green-500/20 bg-green-500/10 text-green-500"
            )}
          >
            {type}
          </div>
        ))}
      </div>
    </div>
  );
}

function SearchMockup() {
  return (
    <div className="flex h-full flex-col gap-3 p-4 select-none pointer-events-none">
      <div className="rounded-xl border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Search transactions, accounts, goals...</span>
          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[8px] text-muted-foreground">Ctrl K</span>
        </div>
      </div>
      {["Recent transactions", "Accounts - GCash", "Goals - Emergency Fund", "Settings - Theme"].map((item) => (
        <div key={item} className="rounded-lg border bg-card px-3 py-2 text-[9px] text-foreground/90">
          {item}
        </div>
      ))}
    </div>
  );
}

function SettingsMockup() {
  const rows = ["Display name", "Primary currency", "Exchange rates", "Theme"];

  return (
    <div className="flex h-full flex-col gap-2 p-3 select-none pointer-events-none">
      <div className="mb-1 flex items-center justify-between">
        <div className="text-[10px] font-bold">Settings</div>
        <Settings className="h-3 w-3 text-muted-foreground/60" />
      </div>
      {rows.map((row) => (
        <div key={row} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2">
          <span className="text-[9px] font-medium">{row}</span>
          <div className="h-2 w-10 rounded-full bg-muted" />
        </div>
      ))}
      <div className="mt-auto rounded-lg bg-primary/10 px-3 py-2 text-[9px] text-primary">
        Customize ExitPlan your way
      </div>
    </div>
  );
}

function DoneMockup() {
  const items = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Receipt, label: "Transactions" },
    { icon: Target, label: "Goals" },
    { icon: BarChart3, label: "Budgets" },
    { icon: Landmark, label: "Accounts" },
  ];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 select-none pointer-events-none">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <p className="text-center text-xs font-semibold">You know the essentials</p>
      <div className="grid w-full grid-cols-5 gap-1">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-card">
              <Icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <span className="text-center text-[8px] leading-tight text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const SCREENSHOT_COMPONENTS: Record<NonNullable<TourStep["screenshot"]>, React.ComponentType> = {
  dashboard: DashboardMockup,
  transactions: TransactionsMockup,
  goals: GoalsMockup,
  budgets: BudgetsMockup,
  accounts: AccountsMockup,
  fab: FabMockup,
  search: SearchMockup,
  settings: SettingsMockup,
  done: DoneMockup,
};

const SCREENSHOT_URLS: Record<NonNullable<TourStep["screenshot"]>, string> = {
  dashboard: "exitplan.app/dashboard",
  transactions: "exitplan.app/transactions",
  goals: "exitplan.app/goals",
  budgets: "exitplan.app/budgets",
  accounts: "exitplan.app/accounts",
  fab: "exitplan.app/dashboard",
  search: "exitplan.app/search",
  settings: "exitplan.app/settings",
  done: "exitplan.app",
};

function TourCard({
  step,
  currentStep,
  totalSteps,
  isRequiredRun,
  prev,
  next,
  stop,
  tooltipRef,
}: {
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  isRequiredRun: boolean;
  prev: () => void;
  next: () => void;
  stop: () => void;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
}) {
  const screenshotKey = step.screenshot ?? "dashboard";
  const ScreenshotComponent = SCREENSHOT_COMPONENTS[screenshotKey];

  return (
    <div
      ref={tooltipRef}
      className="w-full max-w-[640px] sm:max-w-[1120px] overflow-hidden rounded-xl border bg-card text-card-foreground shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="flex h-52 flex-col border-b bg-muted/40 sm:h-auto sm:w-5/12 sm:border-b-0 sm:border-r">
          <div className="flex items-center gap-1.5 px-3 pb-1.5 pt-3">
            <div className="h-2 w-2 rounded-full bg-red-400/60" />
            <div className="h-2 w-2 rounded-full bg-yellow-400/60" />
            <div className="h-2 w-2 rounded-full bg-green-400/60" />
            <div className="flex h-3.5 flex-1 items-center justify-center truncate rounded bg-muted px-1 text-[7px] text-muted-foreground">
              {SCREENSHOT_URLS[screenshotKey]}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <ScreenshotComponent />
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-5 sm:gap-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:h-8 sm:w-8">
                <Map className="h-3.5 w-3.5 text-primary sm:h-4 sm:w-4" />
              </span>
              <h3 className="text-sm font-semibold leading-tight sm:text-lg">{step.title}</h3>
            </div>
            <button
              onClick={stop}
              className="shrink-0 rounded-sm text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Close tour"
              disabled={isRequiredRun}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-7">{step.description}</p>

          <div className="flex items-center justify-center gap-1.5">
            {TOUR_STEPS.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "block rounded-full transition-all duration-200",
                  index === currentStep ? "h-2 w-5 bg-primary" : "h-2 w-2 bg-muted-foreground/30"
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-2 sm:pt-1">
            {isRequiredRun ? (
              <span className="text-xs text-muted-foreground/70 sm:text-sm">Complete tour to continue</span>
            ) : (
              <button
                onClick={stop}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline underline-offset-2 sm:text-sm"
              >
                Skip tour
              </button>
            )}

            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button size="sm" variant="outline" onClick={prev} className="h-8 px-3 sm:h-9 sm:px-4">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button size="sm" onClick={next} className="h-8 px-4 sm:h-9 sm:px-5 sm:text-sm">
                {currentStep === totalSteps - 1 ? (
                  "Done"
                ) : (
                  <>
                    Next
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <p className="-mt-2 text-center text-[11px] text-muted-foreground/60 sm:text-xs">
            {currentStep + 1} / {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
}

export function TourOverlay() {
  const { isActive, isRequiredRun, currentStep, totalSteps, step, next, prev, stop } =
    useTourContext();
  const tooltipRef = useRef<HTMLDivElement>(null);

  if (typeof window === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isActive && step && (
        <>
          <motion.div
            key="tour-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/60"
          />

          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key={`tour-${currentStep}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="pointer-events-auto max-h-[calc(100vh-32px)] overflow-y-auto"
            >
              <TourCard
                step={step}
                currentStep={currentStep}
                totalSteps={totalSteps}
                isRequiredRun={isRequiredRun}
                prev={prev}
                next={next}
                stop={stop}
                tooltipRef={tooltipRef}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
