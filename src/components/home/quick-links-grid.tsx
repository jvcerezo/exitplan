"use client";

import Link from "next/link";
import { BookOpen, Wrench, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useGuideProgress } from "@/hooks/use-guide-progress";
import { useBills } from "@/hooks/use-bills";
import { cn } from "@/lib/utils";

export function QuickLinksGrid() {
  const { overallPercentage, isLoading: guideLoading } = useGuideProgress();
  const { data: bills, isLoading: billsLoading } = useBills();

  const upcomingBills = bills?.filter((b) => {
    if (!b.due_day || !b.is_active) return false;
    const now = new Date();
    const today = now.getDate();
    const dueDay = b.due_day;
    // Check if due within next 7 days (wrapping around month end)
    const diff = dueDay >= today ? dueDay - today : dueDay + 30 - today;
    return diff >= 0 && diff <= 7;
  }) ?? [];

  return (
    <div className="grid grid-cols-2 gap-3">
      <Link href="/guide" className="block">
        <Card className="h-full hover:border-primary/40 transition-colors group">
          <CardContent className="pt-5 pb-5 flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">Adulting Guide</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {guideLoading ? "Loading..." : `${overallPercentage}% complete`}
              </p>
            </div>
            {!guideLoading && (
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${overallPercentage}%` }}
                />
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
              Continue
              <ArrowRight className="h-3 w-3" />
            </span>
          </CardContent>
        </Card>
      </Link>

      <Link href="/tools" className="block">
        <Card className="h-full hover:border-primary/40 transition-colors group">
          <CardContent className="pt-5 pb-5 flex flex-col gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Wrench className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold">Tools</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {billsLoading
                  ? "Loading..."
                  : upcomingBills.length > 0
                    ? `${upcomingBills.length} bill${upcomingBills.length > 1 ? "s" : ""} due this week`
                    : "Contributions, debts, insurance & more"}
              </p>
            </div>
            {upcomingBills.length > 0 && (
              <div className={cn("rounded-lg px-2.5 py-1.5 text-xs font-medium", "bg-amber-500/10 text-amber-700 dark:text-amber-400")}>
                {upcomingBills.length} upcoming
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-xs font-medium text-primary group-hover:underline">
              Open Tools
              <ArrowRight className="h-3 w-3" />
            </span>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
