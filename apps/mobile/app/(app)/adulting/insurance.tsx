import React, { useState } from "react";
import { View, ScrollView, RefreshControl, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useInsurancePolicies, useInsuranceSummary, useAddInsurancePolicy, useDeleteInsurancePolicy } from "@/hooks/use-insurance";
import { Text } from "@/components/ui/text";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/empty-state";
import { useTheme } from "@/lib/theme";
import { formatCurrency } from "@exitplan/core";
import type { InsuranceType, PremiumFrequency } from "@exitplan/core";
import { Plus, Shield, Trash2, ArrowLeft } from "lucide-react-native";

const INSURANCE_TYPES = [
  { value: "life", label: "Life Insurance" },
  { value: "health", label: "Health Insurance" },
  { value: "hmo", label: "HMO" },
  { value: "car", label: "Car Insurance" },
  { value: "property", label: "Property Insurance" },
  { value: "ctpl", label: "CTPL" },
  { value: "other", label: "Other" },
];

const PREMIUM_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "semi_annual", label: "Semi-Annual" },
  { value: "annual", label: "Annual" },
];

export default function InsuranceScreen() {
  const { colors } = useTheme();
  const queryClient = useQueryClient();
  const { data: policies, isLoading } = useInsurancePolicies();
  const { data: summary } = useInsuranceSummary();
  const addPolicy = useAddInsurancePolicy();
  const deletePolicy = useDeleteInsurancePolicy();

  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState("");
  const [type, setType] = useState<string>("hmo");
  const [provider, setProvider] = useState("");
  const [premiumAmount, setPremiumAmount] = useState("");
  const [premiumFreq, setPremiumFreq] = useState<string>("monthly");
  const [coverageAmount, setCoverageAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["insurance"] });
    setRefreshing(false);
  }

  async function handleAdd() {
    if (!name.trim() || !premiumAmount) {
      Alert.alert("Required", "Please fill in name and premium amount.");
      return;
    }
    try {
      await addPolicy.mutateAsync({
        name: name.trim(),
        type: type as InsuranceType,
        provider: provider.trim() || null,
        premium_amount: parseFloat(premiumAmount),
        premium_frequency: premiumFreq as PremiumFrequency,
        coverage_amount: coverageAmount ? parseFloat(coverageAmount) : null,
        renewal_date: renewalDate || null,
      });
      setShowAdd(false);
      setName("");
      setProvider("");
      setPremiumAmount("");
      setCoverageAmount("");
      setRenewalDate("");
    } catch (e: unknown) {
      Alert.alert("Error", e instanceof Error ? e.message : "Failed to add policy");
    }
  }

  const activePolicies = policies?.filter((p) => p.is_active) ?? [];
  const inactivePolicies = policies?.filter((p) => !p.is_active) ?? [];

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
          <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: "#14B8A6" + "1A", alignItems: "center", justifyContent: "center" }}>
            <Shield size={20} color="#14B8A6" />
          </View>
          <View>
            <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>Insurance Tracker</Text>
            <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Monitor all your policies and renewal dates</Text>
          </View>
        </View>
      </View>

      <View style={{ marginHorizontal: 16, gap: 12 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <Card style={{ flex: 1, padding: 16 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>Annual Premiums</Text>
              <Text variant="h4" style={{ color: colors.primary }}>{formatCurrency(summary?.totalAnnualPremium ?? 0)}</Text>
            </Card>
            <Card style={{ flex: 1, padding: 16 }}>
              <Text variant="caption" style={{ color: colors.mutedForeground }}>Total Coverage</Text>
              <Text variant="h4" style={{ color: colors.foreground }}>{formatCurrency(summary?.totalCoverage ?? 0)}</Text>
            </Card>
          </View>

          {(summary?.renewingSoon?.length ?? 0) > 0 && (
            <Card style={{ backgroundColor: colors.yellow400 + "20", borderColor: colors.yellow500 + "40" }}>
              <Text variant="label" style={{ color: colors.yellow600 }}>
                Renewing Soon ({summary!.renewingSoon.length})
              </Text>
              {summary!.renewingSoon.map((p) => (
                <Text key={p.id} variant="body-sm" style={{ color: colors.yellow600, marginTop: 4 }}>
                  {p.name} - {p.renewal_date}
                </Text>
              ))}
            </Card>
          )}

          <Button onPress={() => setShowAdd(true)}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Plus size={16} color={colors.primaryForeground} />
              <Text style={{ color: colors.primaryForeground, fontSize: 13, fontWeight: "600" }}>Add Policy</Text>
            </View>
          </Button>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          {isLoading ? (
            <View style={{ gap: 12 }}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ height: 80, backgroundColor: colors.muted, borderRadius: 10 }} />
              ))}
            </View>
          ) : !policies || policies.length === 0 ? (
            <EmptyState
              title="No insurance policies"
              description="Track your life, health, HMO, and other insurance policies."
              icon={<Shield size={28} color={colors.primary} />}
            />
          ) : (
            <>
              {activePolicies.length > 0 && (
                <View style={{ marginBottom: 16 }}>
                  <Text variant="section-label" style={{ color: colors.mutedForeground, marginBottom: 8 }}>
                    Active ({activePolicies.length})
                  </Text>
                  <View style={{ gap: 12 }}>
                    {activePolicies.map((policy) => (
                      <Card key={policy.id} style={{ padding: 16 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <View style={{ flex: 1 }}>
                            <Text variant="h4" style={{ color: colors.foreground }}>{policy.name}</Text>
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                              <Badge variant="secondary">
                                {INSURANCE_TYPES.find((t) => t.value === policy.type)?.label ?? policy.type}
                              </Badge>
                              {policy.provider && (
                                <Text variant="caption" style={{ color: colors.mutedForeground }}>{policy.provider}</Text>
                              )}
                            </View>
                          </View>
                          <View style={{ alignItems: "flex-end" }}>
                            <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>
                              {formatCurrency(policy.premium_amount)}
                            </Text>
                            <Text variant="caption" style={{ color: colors.mutedForeground }}>
                              /{policy.premium_frequency.replace("_", "-")}
                            </Text>
                          </View>
                        </View>
                        {(policy.coverage_amount || policy.renewal_date) && (
                          <View style={{ flexDirection: "row", gap: 16, marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                            {policy.coverage_amount && (
                              <View>
                                <Text variant="caption" style={{ color: colors.mutedForeground }}>Coverage</Text>
                                <Text variant="body-sm" style={{ color: colors.foreground }}>{formatCurrency(policy.coverage_amount)}</Text>
                              </View>
                            )}
                            {policy.renewal_date && (
                              <View>
                                <Text variant="caption" style={{ color: colors.mutedForeground }}>Renewal</Text>
                                <Text variant="body-sm" style={{ color: colors.foreground }}>{policy.renewal_date}</Text>
                              </View>
                            )}
                          </View>
                        )}
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.border }}>
                          <TouchableOpacity
                            onPress={() =>
                              Alert.alert("Delete", `Delete "${policy.name}"?`, [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => deletePolicy.mutate(policy.id) },
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
                </View>
              )}
              {inactivePolicies.length > 0 && (
                <View>
                  <Text variant="section-label" style={{ color: colors.mutedForeground, marginBottom: 8 }}>
                    Inactive ({inactivePolicies.length})
                  </Text>
                  <View style={{ gap: 12 }}>
                    {inactivePolicies.map((p) => (
                      <Card key={p.id} style={{ opacity: 0.6, padding: 16 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                          <Text variant="body-sm" style={{ color: colors.foreground }}>{p.name}</Text>
                          <Badge variant="secondary">Inactive</Badge>
                        </View>
                      </Card>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>

      <Modal visible={showAdd} onClose={() => setShowAdd(false)} title="Add Insurance Policy">
        <View style={{ gap: 16, paddingBottom: 16 }}>
          <Input label="Policy Name" placeholder="e.g. Maxicare Gold" value={name} onChangeText={setName} />
          <Select label="Type" value={type} onValueChange={setType} options={INSURANCE_TYPES} />
          <Input label="Provider (optional)" placeholder="e.g. Maxicare" value={provider} onChangeText={setProvider} />
          <Input label="Premium Amount (PHP)" placeholder="0.00" value={premiumAmount} onChangeText={setPremiumAmount} keyboardType="decimal-pad" />
          <Select label="Premium Frequency" value={premiumFreq} onValueChange={setPremiumFreq} options={PREMIUM_FREQUENCIES} />
          <Input label="Coverage Amount (PHP, optional)" placeholder="0.00" value={coverageAmount} onChangeText={setCoverageAmount} keyboardType="decimal-pad" />
          <Input label="Renewal Date (optional)" placeholder="YYYY-MM-DD" value={renewalDate} onChangeText={setRenewalDate} />
          <Button onPress={handleAdd} loading={addPolicy.isPending}>Add Policy</Button>
        </View>
      </Modal>
    </ScrollView>
  );
}
