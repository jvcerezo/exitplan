"use client";

import { useState } from "react";
import { Search, ArrowUpRight, ArrowDownRight, SlidersHorizontal, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTransactions } from "@/hooks/use-transactions";
import { CATEGORIES } from "@/lib/constants";
import { formatSignedCurrency } from "@/lib/utils";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";

export function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<"all" | "income" | "expense">("all");

  const { data: transactions, isLoading, error } = useTransactions({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    type,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>All Transactions</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <SlidersHorizontal className="h-4 w-4" />
            <span>
              {transactions?.length ?? 0}{" "}
              {transactions?.length === 1 ? "transaction" : "transactions"}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search descriptions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat.toLowerCase()}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={type}
            onValueChange={(v) => setType(v as "all" | "income" | "expense")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-lg border border-border/40 p-4 animate-pulse"
              >
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 py-10">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-medium">Could not load transactions</p>
              <p className="text-xs text-muted-foreground">
                {error instanceof Error ? error.message : "Check your Supabase connection and ensure the transactions table exists."}
              </p>
            </div>
          </div>
        ) : transactions?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-medium">No transactions found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {search || category !== "all" || type !== "all"
                ? "Try adjusting your filters."
                : "Add your first transaction to get started."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_auto_auto] gap-4 px-4 pb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Description</span>
              <span>Category</span>
              <span>Date</span>
              <span className="text-right">Amount</span>
              <span className="w-16" />
            </div>

            <div className="space-y-2">
              {transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center gap-4 rounded-lg border border-border/40 p-4 transition-colors hover:bg-muted/30"
                >
                  {/* Icon */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
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

                  {/* Description + category (mobile combines, desktop splits) */}
                  <div className="flex-1 min-w-0 sm:grid sm:grid-cols-[1fr_1fr_1fr] sm:gap-4 sm:items-center">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize sm:hidden">
                        {tx.category} &middot;{" "}
                        {new Date(tx.date + "T00:00:00").toLocaleDateString(
                          "en-PH",
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <p className="hidden sm:block text-sm text-muted-foreground capitalize">
                      {tx.category}
                    </p>
                    <p className="hidden sm:block text-sm text-muted-foreground">
                      {new Date(tx.date + "T00:00:00").toLocaleDateString(
                        "en-PH",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </p>
                  </div>

                  {/* Amount */}
                  <div
                    className={`shrink-0 text-sm font-semibold ${
                      tx.amount > 0 ? "text-green-600" : "text-foreground"
                    }`}
                  >
                    {formatSignedCurrency(tx.amount)}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <EditTransactionDialog transaction={tx} />
                    <DeleteTransactionDialog
                      id={tx.id}
                      description={tx.description}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
