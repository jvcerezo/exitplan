"use client";

import Link from "next/link";
import {
  Receipt,
  CreditCard,
  Shield,
  Landmark,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { useUpcomingPayments, type PaymentItemType } from "@/hooks/use-upcoming-payments";
import { formatCurrency, cn } from "@/lib/utils";
import { getUrgencyLabel } from "@/lib/due-dates";

const TYPE_CONFIG: Record<PaymentItemType, { icon: React.ElementType; color: string; bg: string }> = {
  bill: { icon: Receipt, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/10" },
  debt: { icon: CreditCard, color: "text-violet-600 dark:text-violet-400", bg: "bg-violet-500/10" },
  insurance: { icon: Shield, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10" },
  contribution: { icon: Landmark, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10" },
};

export function UpcomingPayments() {
  const { items, totalDue, overdueCount, isLoading } = useUpcomingPayments(30);

  if (isLoading || items.length === 0) return null;

  // Show max 5 items
  const visible = items.slice(0, 5);
  const remaining = items.length - visible.length;

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Upcoming Payments
          </p>
          {overdueCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-red-500">
              <AlertCircle className="h-3 w-3" />
              {overdueCount} overdue
            </span>
          )}
        </div>
        <p className="text-xs font-semibold">{formatCurrency(totalDue)}</p>
      </div>

      {/* Items */}
      <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">
        {visible.map((item) => {
          const config = TYPE_CONFIG[item.type];
          const Icon = config.icon;
          const urgency = getUrgencyLabel(item.daysUntilDue);

          return (
            <Link
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-3 bg-card hover:bg-muted/30 transition-colors group"
            >
              <div className={cn("shrink-0 h-8 w-8 rounded-lg flex items-center justify-center", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {item.title}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{item.subtitle}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(item.amount)}</p>
                <p className={cn("text-[10px] font-medium", urgency.color)}>{urgency.label}</p>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0" />
            </Link>
          );
        })}
      </div>

      {remaining > 0 && (
        <p className="text-center text-[11px] text-muted-foreground">
          +{remaining} more upcoming
        </p>
      )}
    </div>
  );
}
