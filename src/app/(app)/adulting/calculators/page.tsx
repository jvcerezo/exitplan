"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LoanCalculator } from "@/components/adulting/loan-calculator";
import { FireCalculator } from "@/components/adulting/fire-calculator";
import { CompoundCalculator } from "@/components/adulting/compound-calculator";
import { cn } from "@/lib/utils";

const TABS = [
  {
    id: "loan",
    label: "Loan Amortization",
    desc: "Monthly payment and total interest on any loan",
  },
  {
    id: "compound",
    label: "Compound Interest",
    desc: "Grow your money with regular contributions",
  },
  {
    id: "fire",
    label: "FIRE Calculator",
    desc: "How long until you can retire early?",
  },
];

export default function CalculatorsPage() {
  const [activeTab, setActiveTab] = useState("loan");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link href="/adulting"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Adulting Hub
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
            <Calculator className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Financial Calculators</h1>
            <p className="text-sm text-muted-foreground">Loans · Compound interest · FIRE number</p>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-medium border transition-colors",
              activeTab === tab.id
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active calculator */}
      <Card className="rounded-2xl border border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {TABS.find((t) => t.id === activeTab)?.label}
          </CardTitle>
          <CardDescription className="text-xs">
            {TABS.find((t) => t.id === activeTab)?.desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeTab === "loan" && <LoanCalculator />}
          {activeTab === "compound" && <CompoundCalculator />}
          {activeTab === "fire" && <FireCalculator />}
        </CardContent>
      </Card>

      {/* PH context note */}
      <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold">PH Investment Benchmarks</p>
        <div className="grid gap-1 sm:grid-cols-2">
          {[
            "PSE equity index funds: ~8–12% historical annual returns",
            "Pag-IBIG MP2: 6–7% annual dividend (tax-free)",
            "Retail Treasury Bonds (RTBs): 6–7% fixed coupon",
            "Bank time deposits: 4–6% per annum",
            "UITF money market: 3–5%",
            "SSS pension: Based on contributions + CRE",
          ].map((item) => (
            <p key={item} className="text-[11px] text-muted-foreground">• {item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
