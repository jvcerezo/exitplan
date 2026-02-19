"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecentTransactions } from "@/hooks/use-transactions";
import { ArrowUpRight, ArrowDownRight, AlertCircle } from "lucide-react";
import { formatSignedCurrency } from "@/lib/utils";

export function RecentTransactions() {
  const { data: transactions, isLoading, error } = useRecentTransactions();

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
        ) : transactions?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No transactions yet. Start tracking your finances!
          </p>
        ) : (
          <div className="space-y-4">
            {transactions?.map((tx) => (
              <div key={tx.id} className="flex items-center gap-4">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.amount > 0
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-500"
                  }`}
                >
                  {tx.amount > 0 ? (
                    <ArrowUpRight className="h-5 w-5" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {tx.category}
                  </p>
                </div>
                <div
                  className={`text-sm font-semibold ${
                    tx.amount > 0 ? "text-green-600" : "text-foreground"
                  }`}
                >
                  {formatSignedCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
