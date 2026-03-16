import React, { useState } from "react";
import { View, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useTaxRecords, useTaxSummary, useAddTaxRecord, useDeleteTaxRecord } from "@/hooks/use-tax";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/ui/empty-state";
import { useTheme } from "@/lib/theme";
import { formatCurrency, computeIncomeTax, computeFlatTax, BIR_DEADLINES } from "@exitplan/core";
import type { TaxpayerType, TaxFilingType, TaxStatus } from "@exitplan/core";
import { Plus, FileText, Calculator, Trash2, ArrowLeft, ReceiptText } from "lucide-react-native";

export default function TaxesScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useTaxSummary();
  const { data: allRecords } = useTaxRecords();
  const addTaxRecord = useAddTaxRecord();
  const deleteTaxRecord = useDeleteTaxRecord();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [quarter, setQuarter] = useState("1");
  const [filingType, setFilingType] = useState<string>("quarterly");
  const [taxpayerType, setTaxpayerType] = useState<string>("employed");
  const [grossIncome, setGrossIncome] = useState("");
  const [deductions, setDeductions] = useState("0");
  const [taxDue, setTaxDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("0");
  const [status, setStatus] = useState<string>("draft");

  const [calcAnnualIncome, setCalcAnnualIncome] = useState("");
  const [calcBenefits, setCalcBenefits] = useState("0");
  const [calcMethod, setCalcMethod] = useState("graduated");

  const calcResult = calcAnnualIncome
    ? calcMethod === "flat"
      ? computeFlatTax(parseFloat(calcAnnualIncome))
      : computeIncomeTax(parseFloat(calcAnnualIncome), parseFloat(calcBenefits) || 0)
    : null;

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["tax-records"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!grossIncome || !taxDue) {
      Alert.alert("Required", "Please fill in gross income and tax due.");
      return;
    }
    const gross = parseFloat(grossIncome);
    const ded = parseFloat(deductions) || 0;
    try {
      await addTaxRecord.mutateAsync({
        year: parseInt(year),
        quarter: filingType === "quarterly" ? parseInt(quarter) : null,
        filing_type: filingType as TaxFilingType,
        taxpayer_type: taxpayerType as TaxpayerType,
        gross_income: gross,
        deductions: ded,
        taxable_income: gross - ded,
        tax_due: parseFloat(taxDue),
        amount_paid: parseFloat(amountPaid) || 0,
        status: status as TaxStatus,
      });
      setShowAdd(false);
      setGrossIncome("");
      setTaxDue("");
      setAmountPaid("0");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save");
    }
  }

  const statusVariant: Record<string, "default" | "success" | "warning"> = {
    draft: "warning",
    filed: "default",
    paid: "success",
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}
        >
          <ArrowLeft size={16} color={colors.mutedForeground} />
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Adulting Hub</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: "#F97316" + "1A", alignItems: "center", justifyContent: "center" }}>
            <ReceiptText size={20} color="#F97316" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>BIR Tax Tracker</Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>TRAIN Law income tax</Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 16, gap: 12 }}>
          <Card style={{ padding: 16 }}>
            <Text variant="caption" style={{ color: colors.mutedForeground }}>
              {summary?.year ?? new Date().getFullYear()} Tax Summary
            </Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
              <View>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>Tax Due</Text>
                <Text variant="h4" style={{ color: colors.foreground }}>{formatCurrency(summary?.totalDue ?? 0)}</Text>
              </View>
              <View>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>Paid</Text>
                <Text variant="h4" style={{ color: colors.green600 }}>{formatCurrency(summary?.totalPaid ?? 0)}</Text>
              </View>
              <View>
                <Text variant="caption" style={{ color: colors.mutedForeground }}>Balance</Text>
                <Text variant="h4" style={{ color: (summary?.balance ?? 0) > 0 ? colors.destructive : colors.green600 }}>
                  {formatCurrency(summary?.balance ?? 0)}
                </Text>
              </View>
            </View>
          </Card>

          <Card style={{ padding: 16 }}>
            <Text variant="label" style={{ color: colors.foreground, marginBottom: 8 }}>BIR Filing Deadlines</Text>
            {BIR_DEADLINES.map((d) => (
              <View key={d.label} style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 }}>
                <Text variant="body-sm" style={{ color: colors.mutedForeground }}>{d.label}</Text>
                <Text variant="body-sm" style={{ color: colors.foreground }}>Form {d.form} - {d.due}</Text>
              </View>
            ))}
          </Card>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button onPress={() => setShowAdd(true)} style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={16} color={colors.primaryForeground} />
                <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "600" }}>Add Record</Text>
              </View>
            </Button>
            <Button variant="outline" onPress={() => setShowCalc(true)}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Calculator size={16} color={colors.primary} />
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>Calculate</Text>
              </View>
            </Button>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2].map((i) => (
                <View key={i} style={{ height: 80, backgroundColor: colors.muted, borderRadius: 10 }} />
              ))}
            </View>
          ) : !allRecords || allRecords.length === 0 ? (
            <EmptyState
              title="No tax records"
              description="Track your BIR tax filings, quarterly estimates, and payments."
              icon={<FileText size={28} color={colors.primary} />}
            />
          ) : (
            <View style={{ gap: 12 }}>
              {allRecords.map((rec) => (
                <Card key={rec.id} style={{ padding: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View>
                      <Text variant="h4" style={{ color: colors.foreground }}>
                        {rec.year}{rec.quarter ? ` Q${rec.quarter}` : " Annual"}
                      </Text>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                        <Badge variant={statusVariant[rec.status] ?? "default"}>{rec.status}</Badge>
                        <Text variant="caption" style={{ color: colors.mutedForeground }}>{rec.taxpayer_type}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>
                        Tax: {formatCurrency(rec.tax_due)}
                      </Text>
                      <Text variant="caption" style={{ color: colors.green600 }}>
                        Paid: {formatCurrency(rec.amount_paid)}
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, justifyContent: "flex-end" }}>
                    <TouchableOpacity
                      onPress={() =>
                        Alert.alert("Delete", "Delete this tax record?", [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => deleteTaxRecord.mutate(rec.id) },
                        ])
                      }
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.destructive + "15" }}
                    >
                      <Trash2 size={14} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </Card>
              ))}
            </View>
          )}
        </View>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Tax Record">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Year" value={year} onChangeText={setYear} keyboardType="number-pad" />
          <Select label="Filing Type" value={filingType} onValueChange={setFilingType} options={[{ value: "quarterly", label: "Quarterly" }, { value: "annual", label: "Annual" }]} />
          {filingType === "quarterly" && (
            <Select label="Quarter" value={quarter} onValueChange={setQuarter} options={[
              { value: "1", label: "Q1 (Jan-Mar)" }, { value: "2", label: "Q2 (Apr-Jun)" },
              { value: "3", label: "Q3 (Jul-Sep)" }, { value: "4", label: "Q4 (Oct-Dec)" },
            ]} />
          )}
          <Select label="Taxpayer Type" value={taxpayerType} onValueChange={setTaxpayerType} options={[
            { value: "employed", label: "Employed" }, { value: "self_employed", label: "Self-Employed" }, { value: "mixed", label: "Mixed Income" },
          ]} />
          <Input label="Gross Income (PHP)" placeholder="0.00" value={grossIncome} onChangeText={setGrossIncome} keyboardType="decimal-pad" />
          <Input label="Deductions (PHP)" placeholder="0.00" value={deductions} onChangeText={setDeductions} keyboardType="decimal-pad" />
          <Input label="Tax Due (PHP)" placeholder="0.00" value={taxDue} onChangeText={setTaxDue} keyboardType="decimal-pad" />
          <Input label="Amount Paid (PHP)" placeholder="0.00" value={amountPaid} onChangeText={setAmountPaid} keyboardType="decimal-pad" />
          <Select label="Status" value={status} onValueChange={setStatus} options={[
            { value: "draft", label: "Draft" }, { value: "filed", label: "Filed" }, { value: "paid", label: "Paid" },
          ]} />
          <Button onPress={handleAdd} loading={addTaxRecord.isPending}>Save Record</Button>
        </View>
      </Modal>

      <Modal visible={showCalc} onClose={() => setShowCalc(false)} title="Income Tax Calculator">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Annual Gross Income (PHP)" placeholder="e.g. 500000" value={calcAnnualIncome} onChangeText={setCalcAnnualIncome} keyboardType="decimal-pad" />
          <Select label="Tax Method" value={calcMethod} onValueChange={setCalcMethod} options={[
            { value: "graduated", label: "Graduated (TRAIN Law)" }, { value: "flat", label: "8% Flat (Self-Employed)" },
          ]} />
          {calcMethod === "graduated" && (
            <Input label="Non-Taxable Benefits (PHP)" placeholder="e.g. 90000" value={calcBenefits} onChangeText={setCalcBenefits} keyboardType="decimal-pad" />
          )}
          {calcResult && (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Separator />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Taxable Income</Text>
                <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>{formatCurrency(calcResult.taxable_income)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Annual Tax Due</Text>
                <Text variant="h4" style={{ color: colors.destructive }}>{formatCurrency(calcResult.tax_due)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Effective Rate</Text>
                <Text variant="body-sm" style={{ color: colors.foreground }}>{calcResult.effective_rate}%</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Quarterly Estimate</Text>
                <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(calcResult.quarterly_estimate)}</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}
