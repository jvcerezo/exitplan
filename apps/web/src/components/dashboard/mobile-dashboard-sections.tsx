"use client";

import { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { TrendsSection } from "@/components/dashboard/trends-section";
import { HealthScoreCard } from "@/components/dashboard/health-score-card";
import { BudgetAlerts } from "@/components/dashboard/budget-alerts";
import { GoalsSnapshot } from "@/components/dashboard/goals-snapshot";
import { SafeToSpendCard } from "@/components/dashboard/safe-to-spend-card";
import { SavingsRateIndicator } from "@/components/dashboard/savings-rate-indicator";
import { EmergencyFundStatus } from "@/components/dashboard/emergency-fund-status";
import { SpendingInsights } from "@/components/dashboard/spending-insights";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SegmentedControl } from "@/components/ui/segmented-control";

type DashboardSection =
  | "trends"
  | "planning"
  | "health"
  | "activity";

const SECTION_PILLS: Array<{ id: DashboardSection; label: string }> = [
  { id: "trends", label: "Trends" },
  { id: "planning", label: "Planning" },
  { id: "health", label: "Health" },
  { id: "activity", label: "Insights" },
];

export function MobileDashboardSections() {
  const [activeSection, setActiveSection] = useState<DashboardSection>("trends");

  return (
    <section className="space-y-4 md:hidden">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground px-1">
        Dashboard Sections
      </p>

      <SegmentedControl
        options={SECTION_PILLS.map((pill) => ({ value: pill.id, label: pill.label }))}
        value={activeSection}
        onChange={setActiveSection}
        compact
      />

      {activeSection === "trends" && (
        <div className="-mt-1 px-1">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <CornerDownRight className="h-3.5 w-3.5 text-primary/70" />
            <span>Trends selected — choose a trend view below</span>
          </div>
          <div className="ml-1.5 mt-1 h-2 w-px bg-border/80" />
        </div>
      )}

      <div className="space-y-4">
        {activeSection === "trends" && (
          <div className="space-y-2 rounded-2xl border border-primary/20 bg-primary/[0.04] p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-primary/80">
              Trend Views
            </p>
            <TrendsSection nested />
          </div>
        )}

        {activeSection === "planning" && (
          <div className="space-y-3">
            <div className="grid gap-4">
              <BudgetAlerts />
              <GoalsSnapshot />
            </div>
          </div>
        )}

        {activeSection === "health" && (
          <div className="space-y-4">
            <HealthScoreCard />
            <SafeToSpendCard />
            <div className="grid gap-4">
              <SavingsRateIndicator />
              <EmergencyFundStatus targetMonths={3} />
            </div>
          </div>
        )}

        {activeSection === "activity" && (
          <div className="space-y-4">
            <SpendingInsights />
            <RecentTransactions />
          </div>
        )}
      </div>
    </section>
  );
}
