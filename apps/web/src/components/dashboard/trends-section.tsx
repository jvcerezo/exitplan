"use client";

import { useState } from "react";
import { SpendingChart } from "@/components/dashboard/spending-chart";
import { MonthlyTrendChart } from "@/components/dashboard/monthly-trend-chart";
import { NetWorthChart } from "@/components/dashboard/net-worth-chart";
import { SpendingComparison } from "@/components/dashboard/spending-comparison";
import { SegmentedControl } from "@/components/ui/segmented-control";

type TrendView = "spending" | "monthly" | "networth" | "compare";

const TREND_PILLS: Array<{ id: TrendView; label: string }> = [
  { id: "spending", label: "Spending" },
  { id: "monthly", label: "Monthly" },
  { id: "networth", label: "Net Worth" },
  { id: "compare", label: "Compare" },
];

export function TrendsSection({ nested = false }: { nested?: boolean }) {
  const [activeView, setActiveView] = useState<TrendView>("spending");

  return (
    <div className="space-y-3">
      <div className="lg:hidden">
        <div className={nested ? "rounded-xl border border-border/50 bg-background/60 p-1.5" : undefined}>
          <SegmentedControl
            options={TREND_PILLS.map((pill) => ({ value: pill.id, label: pill.label }))}
            value={activeView}
            onChange={setActiveView}
          />
        </div>
      </div>

      <div className="lg:hidden">
        {activeView === "spending" && <SpendingChart />}
        {activeView === "monthly" && <MonthlyTrendChart />}
        {activeView === "networth" && <NetWorthChart />}
        {activeView === "compare" && <SpendingComparison />}
      </div>

      <div className="hidden lg:block space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <SpendingChart />
          <MonthlyTrendChart />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <NetWorthChart />
          <SpendingComparison />
        </div>
      </div>
    </div>
  );
}
