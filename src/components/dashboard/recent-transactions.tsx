"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentTransactions } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { ArrowUpRight, ArrowDownRight, ArrowRight, AlertCircle, Wallet, ArrowLeftRight } from "lucide-react";
import { formatSignedCurrency, formatCurrency, getTransactionLabel, getTransactionCategory } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

export function RecentTransactions() {
  const { data: transactions, isLoading, error } = useRecentTransactions();
  const { data: accounts } = useAccounts();
  const accountMap = new Map((accounts ?? []).map((a) => [a.id, a.name]));

  // Merge transfer pairs into single display rows
  const displayTransactions = (() => {
    if (!transactions) return [];
    const seenTransferIds = new Set<string>();
    const merged: typeof transactions = [];

    for (const tx of transactions) {
      if (tx.category === "transfer" && tx.transfer_id) {
        if (seenTransferIds.has(tx.transfer_id)) continue;
        seenTransferIds.add(tx.transfer_id);

        const pair = transactions.filter((t) => t.transfer_id === tx.transfer_id);
        const outgoing = pair.find((t) => t.amount < 0);
        const incoming = pair.find((t) => t.amount > 0);
        const fromName = outgoing?.account_id ? accountMap.get(outgoing.account_id) ?? "Account" : "Account";
        const toName = incoming?.account_id ? accountMap.get(incoming.account_id) ?? "Account" : "Account";
        const transferAmount = Math.abs(outgoing?.amount ?? incoming?.amount ?? 0);

        merged.push({
          ...(outgoing ?? tx),
          description: `Transfer from ${fromName} to ${toName}`,
          amount: transferAmount,
          category: "transfer",
        });
      } else {
        merged.push(tx);
      }
    }
    return merged;
  })();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-20 bg-muted rounded" />
                </div>
                <div className="h-4 w-16 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 py-6">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Could not load transactions</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Check your Supabase connection and ensure the transactions table exists."}
              </p>
            </div>
          </div>
        ) : displayTransactions.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No transactions yet"
            description="Add your first transaction and start tracking your finances."
          />
        ) : (
          <div className="space-y-4">
            {displayTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.category === "transfer"
                      ? "bg-blue-100 text-blue-600"
                      : tx.amount > 0
                      ? "bg-green-100 text-green-600"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {tx.category === "transfer" ? (
                    <ArrowLeftRight className="h-5 w-5" />
                  ) : tx.amount > 0 ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {getTransactionLabel(tx)}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {tx.category === "transfer" ? "Transfer" : getTransactionCategory(tx)}
                  </p>
                </div>
                <div
                  className={`shrink-0 text-sm font-semibold ${
                    tx.category === "transfer"
                      ? "text-blue-600"
                      : tx.amount > 0
                      ? "text-green-600"
                      : "text-foreground"
                  }`}
                >
                  {tx.category === "transfer"
                    ? formatCurrency(tx.amount)
                    : formatSignedCurrency(tx.amount)}
                </div>
              </div>
            ))}
            <Link
              href="/transactions"
              className="flex items-center justify-center gap-1 pt-2 text-sm text-primary hover:underline"
            >
              View all transactions
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
