"use client";

import { useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
  SlidersHorizontal,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTransactions, useTransactionsCount } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { CATEGORIES } from "@/lib/constants";
import { formatSignedCurrency, formatCurrency, cn, getTransactionLabel, getTransactionCategory } from "@/lib/utils";
import { EditTransactionDialog } from "./edit-transaction-dialog";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { SplitTransactionDialog } from "./split-transaction-dialog";
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

const PAGE_SIZE = 10;

export function TransactionsTable() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [dateRange, setDateRange] = useState("all");
  const [tagFilter, setTagFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const datePreset = getDatePreset(dateRange);

  const { data: transactions, isLoading, error } = useTransactions({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    type,
    dateFrom: datePreset?.from,
    dateTo: datePreset?.to,
    tag: tagFilter || undefined,
    limit: PAGE_SIZE + 1,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  const { data: totalMatchingTransactions } = useTransactionsCount({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    type,
    dateFrom: datePreset?.from,
    dateTo: datePreset?.to,
    tag: tagFilter || undefined,
  });

  const { data: accounts } = useAccounts();
  const accountMap = new Map((accounts ?? []).map((a) => [a.id, a.name]));

  // Merge transfer pairs into a single display row
  const visibleTransactions = (() => {
    const raw = (transactions ?? []).slice(0, PAGE_SIZE);
    const seenTransferIds = new Set<string>();
    const merged: typeof raw = [];

    for (const tx of raw) {
      if (tx.category === "transfer" && tx.transfer_id) {
        if (seenTransferIds.has(tx.transfer_id)) continue; // skip the second half
        seenTransferIds.add(tx.transfer_id);

        // Find the pair: outgoing (negative) and incoming (positive)
        const pair = raw.filter((t) => t.transfer_id === tx.transfer_id);
        const outgoing = pair.find((t) => t.amount < 0);
        const incoming = pair.find((t) => t.amount > 0);

        const fromName = outgoing?.account_id ? accountMap.get(outgoing.account_id) ?? "Account" : "Account";
        const toName = incoming?.account_id ? accountMap.get(incoming.account_id) ?? "Account" : "Account";
        const transferAmount = Math.abs(outgoing?.amount ?? incoming?.amount ?? 0);

        // Create a merged transfer row using the outgoing tx as base
        merged.push({
          ...(outgoing ?? tx),
          description: `Transfer from ${fromName} to ${toName}`,
          amount: transferAmount, // positive, unsigned
          category: "transfer",
          // Tag with a marker so the render knows this is a merged transfer
          _mergedTransfer: true,
        } as typeof tx & { _mergedTransfer?: boolean });
      } else {
        merged.push(tx);
      }
    }
    return merged;
  })();

  // Count how many transfer rows were merged (each merge removes 1 from the count)
  const mergedTransferCount = (() => {
    const raw = transactions ?? [];
    const transferIds = new Set<string>();
    for (const tx of raw) {
      if (tx.category === "transfer" && tx.transfer_id) {
        transferIds.add(tx.transfer_id);
      }
    }
    return transferIds.size; // each ID had 2 rows, now has 1
  })();
  const adjustedTotal = Math.max(0, (totalMatchingTransactions ?? 0) - mergedTransferCount);

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = (transactions?.length ?? 0) > PAGE_SIZE;

  const hasFilters = category !== "all" || dateRange !== "all" || tagFilter !== "";
  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (dateRange !== "all" ? 1 : 0) +
    (tagFilter !== "" ? 1 : 0);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Segmented type control — full width on mobile */}
      <div className="flex rounded-xl border border-border bg-muted/30 p-1">
        {(["all", "income", "expense"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setType(t);
              setCurrentPage(1);
            }}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
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
        <div className="flex flex-wrap items-center gap-2 border-b border-border/50 px-3 py-3 sm:px-4">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg bg-muted/40 px-2.5">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {visibleTransactions.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => exportCSV(visibleTransactions)}
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                <span className="hidden sm:inline">CSV</span>
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
          <div className="flex items-center gap-2 overflow-x-auto border-b border-border/50 px-3 py-2 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:px-4">
            {dateRange !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setDateRange("all");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                {DATE_LABELS[dateRange]}
                <X className="h-3 w-3" />
              </button>
            )}
            {category !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setCategory("all");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary capitalize transition-colors hover:bg-primary/15"
              >
                {category}
                <X className="h-3 w-3" />
              </button>
            )}
            {tagFilter && (
              <button
                type="button"
                onClick={() => {
                  setTagFilter("");
                  setCurrentPage(1);
                }}
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                #{tagFilter}
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setDateRange("all");
                setCategory("all");
                setTagFilter("");
                setCurrentPage(1);
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
                    onClick={() => {
                      setDateRange(opt.value);
                      setCurrentPage(1);
                    }}
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
                  onClick={() => {
                    setCategory("all");
                    setCurrentPage(1);
                  }}
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
                    onClick={() => {
                      setCategory(cat.toLowerCase());
                      setCurrentPage(1);
                    }}
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

            {/* Tag filter */}
            {(() => {
              const allTags = Array.from(
                new Set(transactions?.flatMap((tx) => tx.tags ?? []) ?? [])
              ).sort();
              if (allTags.length === 0) return null;
              return (
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                    Tag
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setTagFilter(tagFilter === tag ? "" : tag);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                          tagFilter === tag
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground border border-border/60 hover:text-foreground hover:border-border"
                        )}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Clear + done */}
            <div className="flex items-center justify-between pt-1">
              {hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setDateRange("all");
                    setCategory("all");
                    setTagFilter("");
                    setCurrentPage(1);
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
        <div className="px-3 pt-3 pb-1 sm:px-4">
          <p className="text-xs text-muted-foreground tabular-nums">
            {adjustedTotal.toLocaleString("en-PH")} total match{adjustedTotal === 1 ? "" : "es"} • {visibleTransactions.length} on this page
          </p>
        </div>

        <CardContent className="px-3 pt-2 sm:px-6">
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
          ) : visibleTransactions.length === 0 ? (
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
            <div className="space-y-1">
              {visibleTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="group flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition-colors hover:bg-muted/40 sm:items-center sm:px-3"
                >
                  {/* Icon */}
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      tx.category === "transfer"
                        ? "bg-blue-500/10 text-blue-600"
                        : tx.amount > 0
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {tx.category === "transfer" ? (
                      <ArrowLeftRight className="h-4 w-4" />
                    ) : tx.amount > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words">
                      {getTransactionLabel(tx)}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs text-muted-foreground capitalize">
                        {getTransactionCategory(tx)}
                        <span className="mx-1.5 text-border">&middot;</span>
                        {new Date(tx.date + "T00:00:00").toLocaleDateString(
                          "en-PH",
                          { month: "short", day: "numeric" }
                        )}
                      </p>
                      {tx.tags?.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            setTagFilter(tag);
                            setCurrentPage(1);
                          }}
                          className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {/* Amount */}
                    <p
                      className={cn(
                        "text-sm font-semibold tabular-nums",
                        tx.category === "transfer"
                          ? "text-blue-600"
                          : tx.amount > 0
                          ? "text-emerald-600"
                          : "text-foreground"
                      )}
                    >
                      {tx.category === "transfer" && (tx as any)._mergedTransfer
                        ? formatCurrency(tx.amount)
                        : formatSignedCurrency(tx.amount, tx.currency)}
                    </p>

                    {/* Actions — always visible on touch, hover-reveal on desktop */}
                    <div className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      {tx.attachment_path ? (
                        <AttachmentViewer
                          transactionId={tx.id}
                          path={tx.attachment_path}
                        />
                      ) : (
                        <AttachmentUpload transactionId={tx.id} />
                      )}
                      <SplitTransactionDialog transaction={tx} />
                      <EditTransactionDialog transaction={tx} />
                      <DeleteTransactionDialog
                        id={tx.id}
                        description={tx.description}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && !error && (hasPreviousPage || hasNextPage) && (
            <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-4">
              <p className="text-xs text-muted-foreground">Page {currentPage}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={!hasPreviousPage}
                >
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
