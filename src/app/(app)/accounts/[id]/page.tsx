"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  ArrowRightLeft,
  Loader2,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccounts } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import { formatCurrency, formatSignedCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_LABELS: Record<string, string> = {
  cash: "Cash",
  bank: "Bank",
  "e-wallet": "E-Wallet",
  "credit-card": "Credit Card",
};

export default function AccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions, isLoading: txLoading } = useTransactions({
    accountId: id,
  });

  const account = accounts?.find((a) => a.id === id);
  const isLoading = accountsLoading || txLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-4">
        <Link href="/accounts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Accounts
          </Button>
        </Link>
        <EmptyState
          icon={Wallet}
          title="Account not found"
          description="This account may have been deleted."
        />
      </div>
    );
  }

  const income =
    transactions
      ?.filter((t) => t.amount > 0 && t.category !== "transfer")
      .reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const expenses =
    transactions
      ?.filter((t) => t.amount < 0 && t.category !== "transfer")
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) ?? 0;

  // Group transactions by date
  const grouped: Record<string, typeof transactions> = {};
  for (const tx of transactions ?? []) {
    if (!grouped[tx.date]) grouped[tx.date] = [];
    grouped[tx.date]!.push(tx);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <Link href="/accounts">
            <Button variant="ghost" size="sm" className="-ml-3 mb-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Accounts
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{account.name}</h1>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {TYPE_LABELS[account.type] ?? account.type}
            </Badge>
            {account.currency !== "PHP" && (
              <Badge variant="outline" className="text-xs">
                {account.currency}
              </Badge>
            )}
          </div>
        </div>
        <AddTransactionDialog defaultAccountId={account.id} />
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Balance</p>
            <p className="text-lg sm:text-xl font-bold">
              {formatCurrency(account.balance, account.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg sm:text-xl font-bold text-emerald-600">
              {formatCurrency(income, account.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {formatCurrency(expenses, account.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction list grouped by date */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!transactions || transactions.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                No transactions for this account yet.
              </p>
              <AddTransactionDialog
                defaultAccountId={account.id}
                trigger={
                  <Button variant="outline" size="sm">
                    Add your first transaction
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(grouped).map(([date, txs]) => (
                <div key={date}>
                  <p className="text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                    {new Date(date + "T00:00:00").toLocaleDateString("en-PH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <div className="space-y-1">
                    {txs!.map((tx) => {
                      const isTransfer = tx.category === "transfer";
                      const isIncome = tx.amount > 0;
                      return (
                        <div
                          key={tx.id}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50 transition-colors group"
                        >
                          <div
                            className={cn(
                              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                              isTransfer
                                ? "bg-blue-500/10 text-blue-600"
                                : isIncome
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            {isTransfer ? (
                              <ArrowRightLeft className="h-3.5 w-3.5" />
                            ) : isIncome ? (
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium truncate capitalize">
                              {tx.description}
                            </p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {tx.category}
                            </p>
                          </div>
                          <div className="text-right shrink-0">
                            <p
                              className={cn(
                                "text-sm font-semibold tabular-nums",
                                isIncome
                                  ? "text-emerald-600"
                                  : "text-foreground"
                              )}
                            >
                              {formatSignedCurrency(tx.amount, tx.currency)}
                            </p>
                          </div>
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <EditTransactionDialog transaction={tx} />
                            <DeleteTransactionDialog
                              id={tx.id}
                              description={tx.description}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
