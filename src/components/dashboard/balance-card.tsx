"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Wallet,
  Target,
  Landmark,
} from "lucide-react";
import { useTransactionsSummary } from "@/hooks/use-transactions";
import { useDebtSummary } from "@/hooks/use-debts";
import { useGoalsSummary } from "@/hooks/use-goals";
import { cn, formatCurrency } from "@/lib/utils";

export function BalanceCard() {
  const { data: summary, isLoading, error } = useTransactionsSummary();
  const { data: debtSummary } = useDebtSummary();
  const { data: goalsSummary } = useGoalsSummary();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Card className="animate-pulse border-l-4 border-l-primary">
          <CardContent className="py-6">
            <div className="h-8 w-48 bg-muted rounded" />
            <div className="mt-3 h-4 w-64 bg-muted rounded" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-3 gap-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-4">
                <div className="h-4 w-16 bg-muted rounded mb-2" />
                <div className="h-6 w-24 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="py-3">
            <div className="h-3 w-full bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <div>
            <p className="text-sm font-medium">Could not load balance</p>
            <p className="text-xs text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "Check your Supabase connection and ensure the transactions table exists."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalDebt = debtSummary?.totalDebt ?? 0;
  const netWorth = (summary?.balance ?? 0) - totalDebt;
  const income = summary?.income ?? 0;
  const expenses = summary?.expenses ?? 0;
  const saved = Math.max(0, income - expenses);
  const savingsPercent = income > 0 ? Math.round((saved / income) * 100) : 0;

  const accountsTotal = summary?.breakdown?.inAccounts ?? 0;

  const goalsTotalSaved = goalsSummary?.totalSaved ?? 0;
  const goalsActive = goalsSummary?.active ?? 0;

  const debtsCount = debtSummary?.count ?? 0;

  return (
    <div className="space-y-3">
      {/* Section 1: Hero Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="py-5 px-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1">
            Net Worth
          </p>
          <p
            className={cn(
              "text-3xl font-bold sm:text-4xl",
              netWorth >= 0
                ? "text-primary"
                : "text-red-500"
            )}
          >
            {formatCurrency(netWorth)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-green-600" />
              Income {formatCurrency(income)}
            </span>
            <span className="flex items-center gap-1">
              <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              Expenses {formatCurrency(expenses)}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="h-3.5 w-3.5 text-primary" />
              Saved {formatCurrency(saved)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Section 2: Quick Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/accounts">
          <Card className="h-full hover:bg-muted/30 transition-colors">
            <CardContent className="py-3 px-3 sm:py-4 sm:px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Accounts
                </span>
              </div>
              <p className="text-sm font-bold tabular-nums sm:text-lg">
                {formatCurrency(accountsTotal)}
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/goals">
          <Card className="h-full hover:bg-muted/30 transition-colors">
            <CardContent className="py-3 px-3 sm:py-4 sm:px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Goals
                </span>
              </div>
              <p className="text-sm font-bold tabular-nums sm:text-lg">
                {formatCurrency(goalsTotalSaved)}
              </p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                {goalsActive} active
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tools/debts">
          <Card className="h-full hover:bg-muted/30 transition-colors">
            <CardContent className="py-3 px-3 sm:py-4 sm:px-4">
              <div className="flex items-center gap-1.5 mb-1">
                <Landmark className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                  Debts
                </span>
              </div>
              <p className="text-sm font-bold tabular-nums sm:text-lg">
                {formatCurrency(totalDebt)}
              </p>
              <p className="text-[10px] text-muted-foreground sm:text-xs">
                {debtsCount} active
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Section 3: This Month Bar */}
      {income > 0 && (
        <Card>
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">
                You saved <span className="font-semibold text-foreground">{savingsPercent}%</span> of
                your income this month
              </p>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="flex h-full">
                <div
                  className="h-full bg-green-500 transition-all"
                  style={{
                    width: `${Math.min(100, savingsPercent)}%`,
                  }}
                />
                <div
                  className="h-full bg-primary/30 transition-all"
                  style={{
                    width: `${Math.min(100, 100 - savingsPercent)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
