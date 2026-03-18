import { ContributionCalculator } from "@/components/adulting/contribution-calculator";
import { ContributionHistory } from "@/components/adulting/contribution-history";
import { AutomationCard } from "@/components/adulting/automation-card";
import { Landmark, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ContributionsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/tools"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Tools
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
            <Landmark className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Gov&apos;t Contributions</h1>
            <p className="text-sm text-muted-foreground">
              SSS · PhilHealth · Pag-IBIG — salary breakdown &amp; deductions using 2024 rates
            </p>
          </div>
        </div>
      </div>

      {/* Quick info cards */}
      <div className="grid gap-3 grid-cols-3">
        {[
          { name: "SSS", rate: "13%", note: "MSC ₱3k–₱30k", color: "text-blue-500", bg: "bg-blue-500/10" },
          { name: "PhilHealth", rate: "5%", note: "₱10k–₱100k", color: "text-green-500", bg: "bg-green-500/10" },
          { name: "Pag-IBIG", rate: "2%", note: "Max ₱100", color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((f) => (
          <div
            key={f.name}
            className={`rounded-xl border border-border/60 p-3 ${f.bg}`}
          >
            <p className={`text-xs font-semibold ${f.color}`}>{f.name}</p>
            <p className="text-lg font-bold mt-0.5">{f.rate}</p>
            <p className="text-[10px] text-muted-foreground">{f.note}</p>
          </div>
        ))}
      </div>

      {/* Automation */}
      <AutomationCard
        storageKey="exitplan_auto_contributions"
        title="Auto-Generate Monthly Entries"
        description="Automatically create SSS, PhilHealth, and Pag-IBIG entries each month based on your last salary."
        features={[
          "New entries created on the 1st of each month as unpaid",
          "Uses your most recent salary and employment type",
          "You still mark each as paid when you actually pay",
          "Reminder notifications sent 3 days before month-end",
        ]}
      />

      {/* Calculator */}
      <ContributionCalculator />

      {/* History */}
      <ContributionHistory />
    </div>
  );
}
