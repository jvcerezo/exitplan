import React, { useState } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useTransactions, useAddTransaction, useDeleteTransaction } from "@/hooks/use-transactions";
import { useAccounts } from "@/hooks/use-accounts";
import { Text } from "@/components/ui/text";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme } from "@/lib/theme";
import { formatSignedCurrency } from "@/lib/format";
import { CATEGORIES } from "@exitplan/core";
import type { Transaction } from "@exitplan/core";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
  SlidersHorizontal,
  X,
} from "lucide-react-native";

const PAGE_SIZE = 20;

const DATE_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "last-3-months", label: "Last 3 Months" },
];

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

export default function TransactionsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [dateRange, setDateRange] = useState("all");
  const [category, setCategory] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const datePreset = getDatePreset(dateRange);

  const { data: transactions, isLoading, error } = useTransactions({
    search: search || undefined,
    category: category !== "all" ? category : undefined,
    type,
    dateFrom: datePreset?.from,
    dateTo: datePreset?.to,
    limit: PAGE_SIZE + 1,
    offset: (currentPage - 1) * PAGE_SIZE,
  });

  const { data: accounts } = useAccounts();
  const addTransaction = useAddTransaction();
  const deleteTransaction = useDeleteTransaction();

  // Add form state
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [txCategory, setTxCategory] = useState("Food");
  const [txDate, setTxDate] = useState(new Date().toISOString().split("T")[0]);
  const [accountId, setAccountId] = useState("");
  const [isExpense, setIsExpense] = useState(true);

  const visibleTransactions = (transactions ?? []).slice(0, PAGE_SIZE);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = (transactions?.length ?? 0) > PAGE_SIZE;
  const hasFilters = category !== "all" || dateRange !== "all";

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert("Error", "Please enter a valid amount.");
      return;
    }
    if (!accountId) {
      Alert.alert("Error", "Please select an account.");
      return;
    }
    try {
      await addTransaction.mutateAsync({
        amount: isExpense ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
        description: description.trim() || txCategory,
        category: txCategory.toLowerCase(),
        date: txDate,
        currency: "PHP",
        account_id: accountId,
      });
      setShowAdd(false);
      setAmount("");
      setDescription("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add transaction");
    }
  }

  function handleDelete(tx: Transaction) {
    Alert.alert("Delete Transaction", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteTransaction.mutate(tx.id),
      },
    ]);
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>
          Transactions
        </Text>
        <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 2 }}>
          Manage and review all your financial activity
        </Text>
      </View>

      {/* Import / Export CSV buttons */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12, flexDirection: "row", gap: 8 }}>
        <Button
          variant="outline"
          size="sm"
          onPress={() => Alert.alert("Import CSV", "CSV import is available on the web app.")}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Upload size={14} color={colors.foreground} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              Import CSV
            </Text>
          </View>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() => Alert.alert("Export CSV", "Export coming soon")}
          style={{ flex: 1 }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Download size={14} color={colors.foreground} />
            <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
              Export CSV
            </Text>
          </View>
        </Button>
      </View>

      <View style={{ paddingHorizontal: 16 }}>
        {/* Type filter segmented control */}
        <SegmentedControl
          options={[
            { value: "all" as const, label: "All" },
            { value: "income" as const, label: "Income" },
            { value: "expense" as const, label: "Expenses" },
          ]}
          value={type}
          onChange={(val) => {
            setType(val);
            setCurrentPage(1);
          }}
        />

        {/* Search + filter bar */}
        <Card style={{ marginTop: 12 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              borderBottomWidth: 1,
              borderBottomColor: colors.border + "80",
              paddingHorizontal: 12,
              paddingVertical: 12,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                height: 40,
                borderRadius: 8,
                backgroundColor: colors.muted + "66",
                paddingHorizontal: 10,
              }}
            >
              <Search size={16} color={colors.mutedForeground} />
              <TextInput
                placeholder="Search transactions..."
                placeholderTextColor={colors.mutedForeground + "80"}
                value={search}
                onChangeText={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.foreground,
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => setFiltersOpen(!filtersOpen)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 4,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
                backgroundColor:
                  filtersOpen || hasFilters
                    ? colors.primary + "1A"
                    : "transparent",
              }}
            >
              <SlidersHorizontal
                size={14}
                color={
                  filtersOpen || hasFilters
                    ? colors.primary
                    : colors.mutedForeground
                }
              />
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color:
                    filtersOpen || hasFilters
                      ? colors.primary
                      : colors.mutedForeground,
                }}
              >
                Filters
              </Text>
            </TouchableOpacity>
          </View>

          {/* Active filter chips */}
          {hasFilters && !filtersOpen && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderBottomWidth: 1,
                borderBottomColor: colors.border + "80",
              }}
            >
              {dateRange !== "all" && (
                <TouchableOpacity
                  onPress={() => {
                    setDateRange("all");
                    setCurrentPage(1);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    borderRadius: 999,
                    backgroundColor: colors.primary + "1A",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "500", color: colors.primary }}>
                    {DATE_OPTIONS.find((d) => d.value === dateRange)?.label}
                  </Text>
                  <X size={12} color={colors.primary} />
                </TouchableOpacity>
              )}
              {category !== "all" && (
                <TouchableOpacity
                  onPress={() => {
                    setCategory("all");
                    setCurrentPage(1);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    borderRadius: 999,
                    backgroundColor: colors.primary + "1A",
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: colors.primary,
                      textTransform: "capitalize",
                    }}
                  >
                    {category}
                  </Text>
                  <X size={12} color={colors.primary} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => {
                  setDateRange("all");
                  setCategory("all");
                  setCurrentPage(1);
                }}
              >
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Collapsible filter panel */}
          {filtersOpen && (
            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: colors.border + "80",
                paddingHorizontal: 16,
                paddingVertical: 12,
                backgroundColor: colors.muted + "33",
                gap: 12,
              }}
            >
              {/* Date range */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: colors.mutedForeground,
                  }}
                >
                  Date Range
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {DATE_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => {
                        setDateRange(opt.value);
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor:
                          dateRange === opt.value
                            ? colors.primary
                            : colors.background,
                        borderWidth: dateRange === opt.value ? 0 : 1,
                        borderColor: colors.border + "99",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color:
                            dateRange === opt.value
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                        }}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category */}
              <View style={{ gap: 6 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "500",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    color: colors.mutedForeground,
                  }}
                >
                  Category
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", gap: 6 }}>
                    <TouchableOpacity
                      onPress={() => {
                        setCategory("all");
                        setCurrentPage(1);
                      }}
                      style={{
                        borderRadius: 999,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        backgroundColor:
                          category === "all" ? colors.primary : colors.background,
                        borderWidth: category === "all" ? 0 : 1,
                        borderColor: colors.border + "99",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "500",
                          color:
                            category === "all"
                              ? colors.primaryForeground
                              : colors.mutedForeground,
                        }}
                      >
                        All
                      </Text>
                    </TouchableOpacity>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => {
                          setCategory(cat.toLowerCase());
                          setCurrentPage(1);
                        }}
                        style={{
                          borderRadius: 999,
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          backgroundColor:
                            category === cat.toLowerCase()
                              ? colors.primary
                              : colors.background,
                          borderWidth: category === cat.toLowerCase() ? 0 : 1,
                          borderColor: colors.border + "99",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "500",
                            color:
                              category === cat.toLowerCase()
                                ? colors.primaryForeground
                                : colors.mutedForeground,
                          }}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Done + Clear */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 4,
                }}
              >
                {hasFilters ? (
                  <TouchableOpacity
                    onPress={() => {
                      setDateRange("all");
                      setCategory("all");
                      setCurrentPage(1);
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                      Clear all
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}
                <TouchableOpacity onPress={() => setFiltersOpen(false)}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "500",
                      color: colors.primary,
                    }}
                  >
                    Done
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Results count */}
          <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 }}>
            <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
              {visibleTransactions.length} transaction
              {visibleTransactions.length !== 1 ? "s" : ""} on this page
            </Text>
          </View>

          {/* Transaction list */}
          <CardContent style={{ paddingHorizontal: 12, paddingTop: 8 }}>
            {isLoading ? (
              <View style={{ gap: 8 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      paddingVertical: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        backgroundColor: colors.muted,
                      }}
                    />
                    <View style={{ flex: 1, gap: 6 }}>
                      <View
                        style={{
                          width: 144,
                          height: 14,
                          borderRadius: 4,
                          backgroundColor: colors.muted,
                        }}
                      />
                      <View
                        style={{
                          width: 80,
                          height: 12,
                          borderRadius: 4,
                          backgroundColor: colors.muted,
                        }}
                      />
                    </View>
                    <View
                      style={{
                        width: 64,
                        height: 14,
                        borderRadius: 4,
                        backgroundColor: colors.muted,
                      }}
                    />
                  </View>
                ))}
              </View>
            ) : error ? (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingVertical: 40,
                }}
              >
                <AlertCircle size={20} color={colors.destructive} />
                <View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "500",
                      color: colors.foreground,
                    }}
                  >
                    Could not load transactions
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                    {error instanceof Error ? error.message : "Check your connection."}
                  </Text>
                </View>
              </View>
            ) : visibleTransactions.length === 0 ? (
              <EmptyState
                icon={
                  search || hasFilters ? (
                    <Search size={28} color={colors.primary} />
                  ) : (
                    <Wallet size={28} color={colors.primary} />
                  )
                }
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
              <View style={{ gap: 4 }}>
                {visibleTransactions.map((tx: any) => (
                  <TouchableOpacity
                    key={tx.id}
                    onLongPress={() => handleDelete(tx)}
                    activeOpacity={0.7}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderRadius: 12,
                      paddingHorizontal: 10,
                      paddingVertical: 10,
                    }}
                  >
                    {/* Icon */}
                    <View
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor:
                          tx.category === "transfer"
                            ? "#3B82F6" + "1A"
                            : tx.amount > 0
                            ? "#10B981" + "1A"
                            : colors.muted,
                      }}
                    >
                      {tx.category === "transfer" ? (
                        <ArrowLeftRight size={16} color="#2563EB" />
                      ) : tx.amount > 0 ? (
                        <ArrowUpRight size={16} color="#16A34A" />
                      ) : (
                        <ArrowDownRight size={16} color={colors.mutedForeground} />
                      )}
                    </View>

                    {/* Info */}
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "500",
                          color: colors.foreground,
                        }}
                        numberOfLines={1}
                      >
                        {tx.description || tx.category}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.mutedForeground,
                          textTransform: "capitalize",
                        }}
                      >
                        {tx.category}
                        {" \u00B7 "}
                        {new Date(tx.date + "T00:00:00").toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })}
                      </Text>
                    </View>

                    {/* Amount */}
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color:
                          tx.category === "transfer"
                            ? "#2563EB"
                            : tx.amount > 0
                            ? "#16A34A"
                            : colors.foreground,
                      }}
                    >
                      {formatSignedCurrency(tx.amount, tx.currency)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Pagination */}
            {!isLoading && !error && (hasPrevPage || hasNextPage) && (
              <View
                style={{
                  marginTop: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderTopWidth: 1,
                  borderTopColor: colors.border + "99",
                  paddingTop: 16,
                }}
              >
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  Page {currentPage}
                </Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasPrevPage}
                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <ChevronLeft size={14} color={colors.foreground} />
                      <Text style={{ fontSize: 12, color: colors.foreground }}>Previous</Text>
                    </View>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!hasNextPage}
                    onPress={() => setCurrentPage((p) => p + 1)}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Text style={{ fontSize: 12, color: colors.foreground }}>Next</Text>
                      <ChevronRight size={14} color={colors.foreground} />
                    </View>
                  </Button>
                </View>
              </View>
            )}
          </CardContent>
        </Card>
      </View>

      {/* Add Transaction Modal */}
      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Transaction">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          {/* Type toggle */}
          <SegmentedControl
            options={[
              { value: "expense" as const, label: "Expense" },
              { value: "income" as const, label: "Income" },
            ]}
            value={isExpense ? "expense" : "income"}
            onChange={(val) => setIsExpense(val === "expense")}
          />

          <Input
            label="Amount (PHP)"
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
          <Input
            label="Description"
            placeholder="What was this for?"
            value={description}
            onChangeText={setDescription}
          />
          <Select
            label="Category"
            value={txCategory}
            onValueChange={setTxCategory}
            options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Date"
            placeholder="YYYY-MM-DD"
            value={txDate}
            onChangeText={setTxDate}
          />
          <Select
            label="Account"
            value={accountId}
            onValueChange={setAccountId}
            placeholder="Select account..."
            options={(accounts ?? []).map((a) => ({ value: a.id, label: a.name }))}
          />
          <Button onPress={handleAdd} loading={addTransaction.isPending}>
            {isExpense ? "Add Expense" : "Add Income"}
          </Button>
        </View>
      </Modal>
    </ScrollView>
  );
}
