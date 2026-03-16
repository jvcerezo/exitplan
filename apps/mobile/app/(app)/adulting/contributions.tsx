import React, { useState } from "react";
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  useContributionSummary,
  useAddContribution,
} from "@/hooks/use-contributions";
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
import {
  formatCurrency,
  calculateGovernmentDeductions,
  EMPLOYMENT_TYPES,
} from "@exitplan/core";
import type { ContributionType, EmploymentType } from "@exitplan/core";
import { Plus, Building2, Calculator, ArrowLeft, Landmark } from "lucide-react-native";

const CONTRIBUTION_TYPES = [
  { value: "sss", label: "SSS" },
  { value: "philhealth", label: "PhilHealth" },
  { value: "pagibig", label: "Pag-IBIG" },
];

export default function ContributionsScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: summary, isLoading } = useContributionSummary();
  const addContribution = useAddContribution();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showCalc, setShowCalc] = useState(false);

  const [contribType, setContribType] = useState<string>("sss");
  const [period, setPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [monthlySalary, setMonthlySalary] = useState("");
  const [employeeShare, setEmployeeShare] = useState("");
  const [employmentType, setEmploymentType] = useState<string>("employed");
  const [isPaid, setIsPaid] = useState("true");

  const [calcSalary, setCalcSalary] = useState("");
  const [calcEmployment, setCalcEmployment] = useState<string>("employed");

  const deductions = calcSalary
    ? calculateGovernmentDeductions(parseFloat(calcSalary), calcEmployment as EmploymentType)
    : null;

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["contributions"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!monthlySalary || !employeeShare) {
      Alert.alert("Required", "Please fill in salary and employee share.");
      return;
    }
    try {
      await addContribution.mutateAsync({
        type: contribType as ContributionType,
        period,
        monthly_salary: parseFloat(monthlySalary),
        employee_share: parseFloat(employeeShare),
        total_contribution: parseFloat(employeeShare),
        is_paid: isPaid === "true",
        employment_type: employmentType as EmploymentType,
      });
      setShowAdd(false);
      setMonthlySalary("");
      setEmployeeShare("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to save");
    }
  }

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
          <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: "#3B82F6" + "1A", alignItems: "center", justifyContent: "center" }}>
            <Landmark size={20} color="#3B82F6" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>Gov't Contributions</Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>SSS · PhilHealth · Pag-IBIG</Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Card style={{ flex: 1, padding: 16 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>Total Paid</Text>
              <Text variant="h4" style={{ color: colors.green600, marginTop: 4 }}>
                {formatCurrency(summary?.totalPaid ?? 0)}
              </Text>
            </Card>
            <Card style={{ flex: 1, padding: 16 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>Total Unpaid</Text>
              <Text variant="h4" style={{ color: colors.yellow600, marginTop: 4 }}>
                {formatCurrency(summary?.totalUnpaid ?? 0)}
              </Text>
            </Card>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <Button onPress={() => setShowAdd(true)} style={{ flex: 1 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Plus size={16} color={colors.primaryForeground} />
                <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "600" }}>Log Contribution</Text>
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

        {/* By type */}
        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ height: 80, backgroundColor: colors.muted, borderRadius: 10 }} />
              ))}
            </View>
          ) : !summary?.contributions || summary.contributions.length === 0 ? (
            <EmptyState
              title="No contributions logged"
              description="Track your SSS, PhilHealth, and Pag-IBIG contributions."
              icon={<Building2 size={28} color={colors.primary} />}
            />
          ) : (
            <>
              {(["sss", "philhealth", "pagibig"] as const).map((type) => {
                const typeContribs = summary.byType[type];
                if (!typeContribs || typeContribs.length === 0) return null;
                const label = type === "sss" ? "SSS" : type === "philhealth" ? "PhilHealth" : "Pag-IBIG";
                return (
                  <View key={type} style={{ marginBottom: 16 }}>
                    <Text variant="section-label" style={{ color: colors.mutedForeground, marginBottom: 8 }}>
                      {label} ({typeContribs.length} records)
                    </Text>
                    <View style={{ gap: 8 }}>
                      {typeContribs.slice(0, 6).map((c) => (
                        <Card key={c.id} style={{ padding: 16 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <View>
                              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>{c.period}</Text>
                              <Text variant="caption" style={{ color: colors.mutedForeground }}>
                                Salary: {formatCurrency(c.monthly_salary)}
                              </Text>
                            </View>
                            <View style={{ alignItems: "flex-end" }}>
                              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>
                                {formatCurrency(c.employee_share)}
                              </Text>
                                <Badge variant={c.is_paid ? "success" : "warning"} style={{ marginTop: 4 }}>
                                {c.is_paid ? "Paid" : "Unpaid"}
                              </Badge>
                            </View>
                          </View>
                        </Card>
                      ))}
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Log Contribution">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Select label="Contribution Type" value={contribType} onValueChange={setContribType} options={CONTRIBUTION_TYPES} />
          <Select label="Employment Type" value={employmentType} onValueChange={setEmploymentType} options={EMPLOYMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />
          <Input label="Period (YYYY-MM)" placeholder="2024-03" value={period} onChangeText={setPeriod} />
          <Input label="Monthly Salary (PHP)" placeholder="0.00" value={monthlySalary} onChangeText={setMonthlySalary} keyboardType="decimal-pad" />
          <Input label="Employee Share (PHP)" placeholder="0.00" value={employeeShare} onChangeText={setEmployeeShare} keyboardType="decimal-pad" />
          <Select label="Status" value={isPaid} onValueChange={setIsPaid} options={[{ value: "true", label: "Paid" }, { value: "false", label: "Unpaid" }]} />
          <Button onPress={handleAdd} loading={addContribution.isPending}>Save Contribution</Button>
        </View>
      </Modal>

      <Modal visible={showCalc} onClose={() => setShowCalc(false)} title="Contribution Calculator">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Monthly Salary (PHP)" placeholder="e.g. 25000" value={calcSalary} onChangeText={setCalcSalary} keyboardType="decimal-pad" />
          <Select label="Employment Type" value={calcEmployment} onValueChange={setCalcEmployment} options={EMPLOYMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))} />

          {deductions && (
            <View style={{ gap: 12, marginTop: 8 }}>
              <Separator />
              <Text variant="h4" style={{ color: colors.foreground }}>Breakdown</Text>

              <Card style={{ padding: 16 }}>
                <Text variant="label" style={{ color: colors.foreground }}>SSS</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Employee</Text>
                  <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(deductions.sss.employee)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Employer</Text>
                  <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(deductions.sss.employer)}</Text>
                </View>
              </Card>

              <Card style={{ padding: 16 }}>
                <Text variant="label" style={{ color: colors.foreground }}>PhilHealth</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Employee</Text>
                  <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(deductions.philhealth.employee)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Employer</Text>
                  <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(deductions.philhealth.employer)}</Text>
                </View>
              </Card>

              <Card style={{ padding: 16 }}>
                <Text variant="label" style={{ color: colors.foreground }}>Pag-IBIG</Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Employee</Text>
                  <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(deductions.pagibig.employee)}</Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Employer</Text>
                  <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(deductions.pagibig.employer)}</Text>
                </View>
              </Card>

              <Separator />
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="label" style={{ color: colors.foreground }}>Total Employee Deductions</Text>
                <Text variant="h4" style={{ color: colors.destructive }}>{formatCurrency(deductions.total_employee)}</Text>
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <Text variant="label" style={{ color: colors.foreground }}>Net Take-Home</Text>
                <Text variant="h4" style={{ color: colors.green600 }}>{formatCurrency(deductions.net_take_home)}</Text>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}
