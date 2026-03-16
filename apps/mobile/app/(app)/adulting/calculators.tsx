import React, { useState } from "react";
import { View, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Text } from "@/components/ui/text";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { formatCurrency, calculateMonthlyPayment, calculateTotalInterest } from "@exitplan/core";
import { ArrowLeft, Calculator } from "lucide-react-native";

type Tab = "compound" | "loan" | "fire";

const TABS = [
  { id: "loan" as const, label: "Loan Amortization", desc: "Monthly payment and total interest on any loan" },
  { id: "compound" as const, label: "Compound Interest", desc: "Grow your money with regular contributions" },
  { id: "fire" as const, label: "FIRE Calculator", desc: "How long until you can retire early?" },
];

function CompoundCalculator() {
  const { colors } = useTheme();
  const [principal, setPrincipal] = useState("");
  const [monthlyAdd, setMonthlyAdd] = useState("");
  const [rate, setRate] = useState("");
  const [years, setYears] = useState("");

  const p = parseFloat(principal) || 0;
  const m = parseFloat(monthlyAdd) || 0;
  const r = (parseFloat(rate) || 0) / 100;
  const y = parseInt(years) || 0;

  let result: { futureValue: number; totalContributed: number; totalInterest: number } | null = null;
  if (y > 0) {
    const monthlyRate = r / 12;
    const totalMonths = y * 12;
    let fv: number;
    if (monthlyRate === 0) {
      fv = p + m * totalMonths;
    } else {
      fv = p * Math.pow(1 + monthlyRate, totalMonths) + m * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
    }
    const totalContributed = p + m * totalMonths;
    result = {
      futureValue: Math.round(fv * 100) / 100,
      totalContributed: Math.round(totalContributed * 100) / 100,
      totalInterest: Math.round((fv - totalContributed) * 100) / 100,
    };
  }

  return (
    <View style={{ gap: 16 }}>
      <Input label="Initial Investment (PHP)" placeholder="0" value={principal} onChangeText={setPrincipal} keyboardType="decimal-pad" />
      <Input label="Monthly Addition (PHP)" placeholder="0" value={monthlyAdd} onChangeText={setMonthlyAdd} keyboardType="decimal-pad" />
      <Input label="Annual Interest Rate (%)" placeholder="e.g. 7" value={rate} onChangeText={setRate} keyboardType="decimal-pad" />
      <Input label="Number of Years" placeholder="e.g. 10" value={years} onChangeText={setYears} keyboardType="number-pad" />
      {result && (
        <Card style={{ marginTop: 8 }}>
          <Text variant="h4" style={{ color: colors.foreground, marginBottom: 12 }}>Results</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Future Value</Text>
              <Text variant="h3" style={{ color: colors.primary }}>{formatCurrency(result.futureValue)}</Text>
            </View>
            <Separator />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Total Contributed</Text>
              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>{formatCurrency(result.totalContributed)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Interest Earned</Text>
              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.green600 }}>{formatCurrency(result.totalInterest)}</Text>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

function LoanCalculator() {
  const { colors } = useTheme();
  const [loanAmount, setLoanAmount] = useState("");
  const [annualRate, setAnnualRate] = useState("");
  const [loanMonths, setLoanMonths] = useState("");

  const principal = parseFloat(loanAmount) || 0;
  const rate = (parseFloat(annualRate) || 0) / 100;
  const months = parseInt(loanMonths) || 0;

  let result: { monthlyPayment: number; totalInterest: number; totalPaid: number } | null = null;
  if (principal > 0 && months > 0) {
    const mp = calculateMonthlyPayment(principal, rate, months);
    const ti = calculateTotalInterest(principal, rate, months);
    result = {
      monthlyPayment: Math.round(mp * 100) / 100,
      totalInterest: ti,
      totalPaid: Math.round(mp * months * 100) / 100,
    };
  }

  return (
    <View style={{ gap: 16 }}>
      <Input label="Loan Amount (PHP)" placeholder="0" value={loanAmount} onChangeText={setLoanAmount} keyboardType="decimal-pad" />
      <Input label="Annual Interest Rate (%)" placeholder="e.g. 12" value={annualRate} onChangeText={setAnnualRate} keyboardType="decimal-pad" />
      <Input label="Loan Term (months)" placeholder="e.g. 36" value={loanMonths} onChangeText={setLoanMonths} keyboardType="number-pad" />
      {result && (
        <Card style={{ marginTop: 8 }}>
          <Text variant="h4" style={{ color: colors.foreground, marginBottom: 12 }}>Results</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Monthly Payment</Text>
              <Text variant="h3" style={{ color: colors.primary }}>{formatCurrency(result.monthlyPayment)}</Text>
            </View>
            <Separator />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Total Interest</Text>
              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.destructive }}>{formatCurrency(result.totalInterest)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Total Paid</Text>
              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>{formatCurrency(result.totalPaid)}</Text>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

function FIRECalculator() {
  const { colors } = useTheme();
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [currentSavings, setCurrentSavings] = useState("");
  const [monthlySavings, setMonthlySavings] = useState("");
  const [returnRate, setReturnRate] = useState("7");
  const [withdrawalRate, setWithdrawalRate] = useState("4");

  const expenses = parseFloat(monthlyExpenses) || 0;
  const current = parseFloat(currentSavings) || 0;
  const monthly = parseFloat(monthlySavings) || 0;
  const annualReturn = (parseFloat(returnRate) || 0) / 100;
  const withdrawal = (parseFloat(withdrawalRate) || 0) / 100;

  let result: { fireNumber: number; yearsToFire: number; monthlyPassiveIncome: number } | null = null;
  if (expenses > 0 && withdrawal > 0) {
    const annualExpenses = expenses * 12;
    const fireNumber = annualExpenses / withdrawal;
    const monthlyRate = annualReturn / 12;
    let yearsToFire = 0;
    if (current >= fireNumber) {
      yearsToFire = 0;
    } else if (monthly <= 0 && annualReturn <= 0) {
      yearsToFire = Infinity;
    } else {
      let balance = current;
      let mnths = 0;
      const maxMonths = 1200;
      while (balance < fireNumber && mnths < maxMonths) {
        balance = balance * (1 + monthlyRate) + monthly;
        mnths++;
      }
      yearsToFire = mnths >= maxMonths ? Infinity : Math.round((mnths / 12) * 10) / 10;
    }
    result = {
      fireNumber: Math.round(fireNumber),
      yearsToFire,
      monthlyPassiveIncome: Math.round((fireNumber * withdrawal) / 12),
    };
  }

  return (
    <View style={{ gap: 16 }}>
      <Input label="Monthly Expenses (PHP)" placeholder="e.g. 30000" value={monthlyExpenses} onChangeText={setMonthlyExpenses} keyboardType="decimal-pad" />
      <Input label="Current Savings (PHP)" placeholder="0" value={currentSavings} onChangeText={setCurrentSavings} keyboardType="decimal-pad" />
      <Input label="Monthly Savings (PHP)" placeholder="e.g. 10000" value={monthlySavings} onChangeText={setMonthlySavings} keyboardType="decimal-pad" />
      <Input label="Expected Annual Return (%)" placeholder="7" value={returnRate} onChangeText={setReturnRate} keyboardType="decimal-pad" />
      <Input label="Safe Withdrawal Rate (%)" placeholder="4" value={withdrawalRate} onChangeText={setWithdrawalRate} keyboardType="decimal-pad" />
      {result && (
        <Card style={{ marginTop: 8 }}>
          <Text variant="h4" style={{ color: colors.foreground, marginBottom: 12 }}>FIRE Projection</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>FIRE Number</Text>
              <Text variant="h3" style={{ color: colors.primary }}>{formatCurrency(result.fireNumber)}</Text>
            </View>
            <Separator />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Years to FIRE</Text>
              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.foreground }}>
                {result.yearsToFire === Infinity ? "Not achievable" : result.yearsToFire === 0 ? "Already there!" : `${result.yearsToFire} years`}
              </Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Monthly Passive Income</Text>
              <Text variant="body-sm" style={{ fontWeight: "600", color: colors.green600 }}>{formatCurrency(result.monthlyPassiveIncome)}</Text>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

export default function CalculatorsScreen() {
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>("compound");

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 }}
          >
            <ArrowLeft size={16} color={colors.mutedForeground} />
            <Text style={{ fontSize: 14, color: colors.mutedForeground }}>Adulting Hub</Text>
          </TouchableOpacity>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ height: 36, width: 36, borderRadius: 12, backgroundColor: "#A855F7" + "1A", alignItems: "center", justifyContent: "center" }}>
              <Calculator size={20} color="#A855F7" />
            </View>
            <View>
              <Text variant="h2" style={{ color: colors.foreground, letterSpacing: -0.3 }}>Financial Calculators</Text>
              <Text variant="body-sm" style={{ color: colors.mutedForeground }}>Loans • Compound interest • FIRE number</Text>
            </View>
          </View>
        </View>

        {/* Tab switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: tab === t.id ? colors.primary : colors.border,
                backgroundColor: tab === t.id ? colors.primary : "transparent",
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: tab === t.id ? colors.primaryForeground : colors.mutedForeground,
                }}
              >
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <Card style={{ borderRadius: 16 }}>
            <CardHeader style={{ paddingBottom: 12 }}>
              <CardTitle style={{ fontSize: 14, fontWeight: "600" }}>
                {TABS.find((t) => t.id === tab)?.label}
              </CardTitle>
              <CardDescription style={{ fontSize: 12 }}>
                {TABS.find((t) => t.id === tab)?.desc}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {tab === "compound" && <CompoundCalculator />}
              {tab === "loan" && <LoanCalculator />}
              {tab === "fire" && <FIRECalculator />}
            </CardContent>
          </Card>
        </View>

        {/* PH benchmark note */}
        <View style={{ marginHorizontal: 16, marginTop: 16 }}>
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.muted, padding: 16 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", marginBottom: 8, color: colors.foreground }}>PH Investment Benchmarks</Text>
            {/*
              "PSE equity index funds: ~8–12% historical annual returns",
              "Pag-IBIG MP2: 6–7% annual dividend (tax-free)",
              "Retail Treasury Bonds (RTBs): 6–7% fixed coupon",
              "Bank time deposits: 4–6% per annum",
              "UITF money market: 3–5%",
              "SSS pension: Based on contributions + CRE",
            */}
            {["PSE equity index funds: ~8–12% historical annual returns", "Pag-IBIG MP2: 6–7% annual dividend (tax-free)", "Retail Treasury Bonds (RTBs): 6–7% fixed coupon", "Bank time deposits: 4–6% per annum", "UITF money market: 3–5%", "SSS pension: Based on contributions + CRE"].map((item, i) => (
              <Text key={i} style={{ fontSize: 11, color: colors.mutedForeground, marginBottom: 4 }}>• {item}</Text>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
