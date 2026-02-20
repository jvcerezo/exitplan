"use client";

import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Wallet,
  AlertCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions } from "@/hooks/use-transactions";
import { CATEGORIES } from "@/lib/constants";
import { formatSignedCurrency, cn } from "@/lib/utils";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { AttachmentUpload } from "./attachment-upload";
import { AttachmentViewer } from "./attachment-viewer";
import { EmptyState } from "@/components/ui/empty-state";

function getDatePreset(preset: string): { from: string; to: string } | null {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (preset) {
    case "this-month":
      return {
        from: new Date(y, m, 1).toISOString().split("T")[0],
        to: new Date(y, m + 1, 0).toISOString().split("T")[0],
      };
    case "last-month":
      return {
        from: new Date(y, m - 1, 1).toISOString().split("T")[0],
        to: new Date(y, m, 0).toISOString().split("T")[0],
      };
    case "last-3-months":
      return {
        from: new Date(y, m - 2, 1).toISOString().split("T")[0],
        to: new Date(y, m + 1, 0).toISOString().split("T")[0],
      };
    default:
      return null;
  }
}

function sanitizeCSVField(value: string): string {
  let sanitized = value.replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(sanitized)) {
    sanitized = `'${sanitized}`;
  }
  return `"${sanitized}"`;
}

function exportCSV(
  transactions: { date: string; description: string; category: string; amount: number }[]
) {
  const header = "Date,Description,Category,Amount\n";
  const rows = transactions
    .map(
      (tx) =>
        `${tx.date},${sanitizeCSVField(tx.description)},${sanitizeCSVField(tx.category)},${tx.amount}`
    )
    .join("\n");
  const blob = new Blob([header + rows], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `exitplan-transactions-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const DATE_LABELS: Record<string, string> = {
  "this-month": "This Month",
  "last-month": "Last Month",
  "last-3-months": "Last 3 Months",
};

export function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [dateRange, setDateRange] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const datePreset = getDatePreset(dateRange);

  const { data: transactions, isLoading, error } = useTransactions({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    type,
    dateFrom: datePreset?.from,
    dateTo: datePreset?.to,
  });

  const hasFilters = category !== "all" || dateRange !== "all";
  const activeFilterCount = (category !== "all" ? 1 : 0) + (dateRange !== "all" ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Segmented type control */}
      <div className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5">
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
              type === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t === "all" ? "All" : t === "income" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      <Card>
        {/* Search + filter bar */}
        <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          />
          <div className="flex items-center gap-2 shrink-0">
            {transactions && transactions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => exportCSV(transactions)}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                CSV
              </Button>
            )}
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                filtersOpen || hasFilters
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {hasFilters && !filtersOpen && (
          <div className="flex items-center gap-2 border-b border-border/50 px-4 py-2">
            {dateRange !== "all" && (
              <button
                type="button"
                onClick={() => setDateRange("all")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                {DATE_LABELS[dateRange]}
                <X className="h-3 w-3" />
              </button>
            )}
            {category !== "all" && (
              <button
                type="button"
                onClick={() => setCategory("all")}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize transition-colors hover:bg-primary/15"
              >
                {category}
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDateRange("all");
                setCategory("all");
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Filter panel (collapsible) */}
        {filtersOpen && (
          <div className="border-b border-border/50 px-4 py-3 space-y-3 bg-muted/20">
            {/* Date range */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Date Range
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { value: "all", label: "All Time" },
                  { value: "this-month", label: "This Month" },
                  { value: "last-month", label: "Last Month" },
                  { value: "last-3-months", label: "Last 3 Months" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDateRange(opt.value)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      dateRange === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground border border-border/60 hover:text-foreground hover:border-border"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Category
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCategory("all")}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    category === "all"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground border border-border/60 hover:text-foreground hover:border-border"
                  )}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat.toLowerCase())}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      category === cat.toLowerCase()
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground border border-border/60 hover:text-foreground hover:border-border"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear + done */}
            <div className="flex items-center justify-between pt-1">
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setDateRange("all");
                    setCategory("all");
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear all
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="text-xs font-medium text-primary hover:underline"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-muted-foreground tabular-nums">
            {transactions?.length ?? 0}{" "}
            {(transactions?.length ?? 0) === 1 ? "transaction" : "transactions"}
          </p>
        </div>

        <CardContent className="pt-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg p-3 animate-pulse"
                >
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3.5 w-36 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                  <div className="h-3.5 w-16 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center gap-3 py-10">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
              <div>
                <p className="text-sm font-medium">Could not load transactions</p>
                <p className="text-xs text-muted-foreground">
                  {error instanceof Error
                    ? error.message
                    : "Check your Supabase connection and ensure the transactions table exists."}
                </p>
              </div>
            </div>
          ) : transactions?.length === 0 ? (
            <EmptyState
              icon={search || hasFilters ? Search : Wallet}
              title={
                search || hasFilters
                  ? "No transactions found"
                  : "No transactions yet"
              }
              description={
                search || hasFilters
                  ? "Try adjusting your filters to find what you're looking for."
                  : "Add your first transaction and start tracking your finances."
              }
            />
          ) : (
            <div className="space-y-0.5">
              {transactions?.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted/40"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      tx.amount > 0
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tx.amount > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {tx.category}
                      <span className="mx-1.5 text-border">&middot;</span>
                      {new Date(tx.date + "T00:00:00").toLocaleDateString(
                        "en-PH",
                        { month: "short", day: "numeric" }
                      )}
                    </p>
                  </div>

                  {/* Amount */}
                  <p
                    className={cn(
                      "text-sm font-semibold tabular-nums shrink-0",
                      tx.amount > 0 ? "text-emerald-600" : "text-foreground"
                    )}
                  >
                    {formatSignedCurrency(tx.amount, tx.currency)}
                  </p>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {tx.attachment_path ? (
                      <AttachmentViewer
                        transactionId={tx.id}
                        path={tx.attachment_path}
                      />
                    ) : (
                      <AttachmentUpload transactionId={tx.id} />
                    )}
                    <EditTransactionDialog transaction={tx} />
                    <DeleteTransactionDialog
                      id={tx.id}
                      description={tx.description}
                    />
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
