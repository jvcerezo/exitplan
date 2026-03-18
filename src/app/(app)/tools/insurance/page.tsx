"use client";

import Link from "next/link";
import { Shield, ArrowLeft, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useInsuranceSummary } from "@/hooks/use-insurance";
import { AddInsuranceDialog } from "@/components/adulting/add-insurance-dialog";
import { InsuranceList } from "@/components/adulting/insurance-list";
import { AutomationCard } from "@/components/adulting/automation-card";

const INCOME_MULTIPLE = 10;

export default function InsurancePage() {
  const { data: summary } = useInsuranceSummary();

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10">
              <Shield className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Insurance Tracker</h1>
              <p className="text-sm text-muted-foreground">Monitor all your policies and renewal dates</p>
            </div>
          </div>
          <div className="hidden sm:block"><AddInsuranceDialog /></div>
        </div>
      </div>

      {summary && summary.count > 0 && (
        <div className="grid gap-2.5 grid-cols-3">
          <Card className="rounded-2xl border border-border/60">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Annual Premium</p>
              <p className="text-sm sm:text-xl font-bold mt-0.5 truncate">{formatCurrency(summary.totalAnnualPremium)}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border border-teal-500/20 bg-teal-500/5">
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Total Coverage</p>
              <p className="text-sm sm:text-xl font-bold text-teal-600 mt-0.5 truncate">{formatCurrency(summary.totalCoverage)}</p>
            </CardContent>
          </Card>
          <Card className={`rounded-2xl border ${summary.renewingSoon.length > 0 ? "border-orange-500/20 bg-orange-500/5" : "border-border/60"}`}>
            <CardContent className="p-3 sm:p-4">
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Renewing Soon</p>
              <p className={`text-sm sm:text-xl font-bold mt-0.5 ${summary.renewingSoon.length > 0 ? "text-orange-500" : ""}`}>{summary.renewingSoon.length}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {summary && summary.renewingSoon.length > 0 && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-semibold text-orange-600">Policies renewing within 30 days</p>
            <ul className="mt-1 space-y-0.5">
              {summary.renewingSoon.map((p) => (
                <li key={p.id} className="text-[11px] text-muted-foreground">
                  {p.name} — {new Date(p.renewal_date!).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Automation */}
      <AutomationCard
        storageKey="exitplan_auto_insurance"
        title="Premium Reminders"
        description="Get notified before your insurance premiums are due."
        features={[
          "Policies with a renewal date appear in Upcoming Payments on your Home page",
          "Push notifications sent before your next premium is due",
          "Pay premium to record a transaction from your linked account",
          "Set a renewal date on each policy to enable reminders",
        ]}
      />

      <div className="sm:hidden"><AddInsuranceDialog /></div>
      <InsuranceList />

      <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 space-y-2">
        <p className="text-xs font-semibold">Insurance Rule of Thumb</p>
        <div className="space-y-1">
          {[
            `Life: At least ${INCOME_MULTIPLE}x your annual income in coverage.`,
            "Health/HMO: Ensure your annual MBL (Maximum Benefit Limit) covers at least ₱500k.",
            "Car: CTPL is mandatory. Comprehensive is recommended for newer vehicles.",
            "Property: If you own real estate, secure fire and natural disaster coverage.",
          ].map((tip, i) => (
            <p key={i} className="text-[11px] text-muted-foreground">• {tip}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
