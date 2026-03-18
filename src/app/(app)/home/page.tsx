"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Wallet, TrendingUp, TrendingDown, BookOpen, Wrench, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { NextStepsCarousel } from "@/components/dashboard/next-steps-carousel";
import { UpcomingPayments } from "@/components/dashboard/upcoming-payments";
import { useProfile } from "@/hooks/use-profile";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { useTransactionsSummary } from "@/hooks/use-transactions";

function useHomePreference(key: string, defaultValue = true): boolean {
  const [enabled, setEnabled] = useState(defaultValue);
  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored !== null) setEnabled(stored === "1");
  }, [key]);
  return enabled;
}
import { formatCurrency, cn } from "@/lib/utils";

export default function HomePage() {
  const { data: profile } = useProfile();
  const { currentStage, currentStageIndex, overallPercentage, totalCompleted, totalItems, isLoading: guideLoading } = useGuideProgress();
  const { data: summary, isLoading: txLoading } = useTransactionsSummary();

  const showUpcoming = useHomePreference("exitplan_home_upcoming");
  const showNextSteps = useHomePreference("exitplan_home_nextsteps");
  const showFinances = useHomePreference("exitplan_home_finances");
  const showStage = useHomePreference("exitplan_home_stage");

  const firstName = profile?.full_name?.split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {greeting}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Here&apos;s your snapshot for today.
        </p>
      </div>

      {/* Current stage + Journey progress — inline card */}
      {showStage && !guideLoading && currentStage && (
        <Link href={`/guide/${currentStage.slug}`} className="block">
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden group">
            <div className="flex items-center gap-4 p-4">
              {/* Stage icon */}
              <div className={cn(
                "shrink-0 h-12 w-12 rounded-xl flex items-center justify-center",
                STAGE_COLORS[currentStageIndex]?.bg ?? "bg-primary/10"
              )}>
                <BookOpen className={cn("h-5 w-5", STAGE_COLORS[currentStageIndex]?.text ?? "text-primary")} />
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Current Stage</p>
                <p className="text-sm font-semibold mt-0.5">{currentStage.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 max-w-[140px] overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full transition-all", STAGE_COLORS[currentStageIndex]?.bar ?? "bg-primary")}
                      style={{ width: `${overallPercentage}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{totalCompleted}/{totalItems}</span>
                </div>
              </div>
              {/* Arrow */}
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground shrink-0 transition-colors" />
            </div>
          </div>
        </Link>
      )}

      {/* Financial summary row */}
      {showFinances && !txLoading && summary && (
        <div className="grid grid-cols-3 gap-2.5">
          <FinStat icon={Wallet} label="Balance" value={formatCurrency(summary.balance)} />
          <FinStat icon={TrendingUp} label="Income" value={formatCurrency(summary.income)} color="text-green-600 dark:text-green-400" iconColor="text-green-500" />
          <FinStat icon={TrendingDown} label="Expenses" value={formatCurrency(Math.abs(summary.expenses))} iconColor="text-muted-foreground" />
        </div>
      )}

      {/* Upcoming Payments */}
      {showUpcoming && <UpcomingPayments />}

      {/* Next Steps */}
      {showNextSteps && <NextStepsCarousel />}

      {/* Quick nav — Guide + Tools */}
      <div className="space-y-2">
        <NavRow
          href="/guide"
          icon={BookOpen}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          title="Adulting Guide"
          subtitle={guideLoading ? "Loading..." : `${overallPercentage}% complete · ${totalItems - totalCompleted} steps remaining`}
        />
        <NavRow
          href="/tools"
          icon={Wrench}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
          title="Tools"
          subtitle="Contributions, bills, debts, insurance & more"
        />
        <NavRow
          href="/dashboard"
          icon={Wallet}
          iconBg="bg-emerald-500/10"
          iconColor="text-emerald-600 dark:text-emerald-400"
          title="Financial Dashboard"
          subtitle="Budgets, trends, spending insights"
        />
      </div>
    </div>
  );
}

function FinStat({ icon: Icon, label, value, color, iconColor }: {
  icon: React.ElementType; label: string; value: string; color?: string; iconColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card px-3 py-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={cn("h-3 w-3", iconColor ?? "text-muted-foreground")} />
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
      <p className={cn("text-sm font-bold tabular-nums truncate", color)}>{value}</p>
    </div>
  );
}

function NavRow({ href, icon: Icon, iconBg, iconColor, title, subtitle }: {
  href: string; icon: React.ElementType; iconBg: string; iconColor: string; title: string; subtitle: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3.5 group hover:border-primary/30 transition-colors">
        <div className={cn("shrink-0 h-9 w-9 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium group-hover:text-primary transition-colors">{title}</p>
          <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 transition-colors" />
      </div>
    </Link>
  );
}

const STAGE_COLORS = [
  { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", bar: "bg-blue-500" },
  { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-500" },
  { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", bar: "bg-violet-500" },
  { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", bar: "bg-amber-500" },
  { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", bar: "bg-rose-500" },
  { bg: "bg-yellow-500/10", text: "text-yellow-600 dark:text-yellow-400", bar: "bg-yellow-500" },
];
