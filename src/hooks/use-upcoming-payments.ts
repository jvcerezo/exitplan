"use client";

import { useMemo } from "react";
import { useBills } from "./use-bills";
import { useDebts } from "./use-debts";
import { useInsurancePolicies } from "./use-insurance";
import { useContributions } from "./use-contributions";
import {
  getNextBillDueDate,
  getNextDebtDueDate,
  getNextPremiumDueDate,
  getCurrentContributionPeriod,
  daysUntil,
} from "@/lib/due-dates";

export type PaymentItemType = "bill" | "debt" | "insurance" | "contribution";

export interface UpcomingPayment {
  id: string;
  type: PaymentItemType;
  title: string;
  subtitle: string;
  amount: number;
  dueDate: Date;
  daysUntilDue: number;
  /** The source record ID for action routing */
  sourceId: string;
  /** Account linked to this payment, if any */
  accountId: string | null;
  /** Link to the feature page */
  href: string;
}

/**
 * Aggregates upcoming payments across bills, debts, insurance, and contributions
 * into a single sorted list. Shows items due within the next 30 days.
 */
export function useUpcomingPayments(daysAhead = 30) {
  const { data: bills, isLoading: billsLoading } = useBills();
  const { data: debts, isLoading: debtsLoading } = useDebts();
  const { data: policies, isLoading: insuranceLoading } = useInsurancePolicies();
  const { data: contributions, isLoading: contribLoading } = useContributions();

  const isLoading = billsLoading || debtsLoading || insuranceLoading || contribLoading;

  const items = useMemo(() => {
    const result: UpcomingPayment[] = [];

    // ── Bills ──
    if (bills) {
      for (const bill of bills) {
        if (!bill.is_active) continue;
        const nextDue = getNextBillDueDate(bill.due_day, bill.billing_cycle, bill.last_paid_date);
        if (!nextDue) continue;
        const days = daysUntil(nextDue);
        if (days > daysAhead) continue;

        result.push({
          id: `bill-${bill.id}`,
          type: "bill",
          title: bill.name,
          subtitle: bill.provider || bill.category,
          amount: bill.amount,
          dueDate: nextDue,
          daysUntilDue: days,
          sourceId: bill.id,
          accountId: bill.account_id,
          href: "/tools/bills",
        });
      }
    }

    // ── Debts ──
    if (debts) {
      for (const debt of debts) {
        if (debt.is_paid_off) continue;
        const nextDue = getNextDebtDueDate(debt.due_day);
        if (!nextDue) continue;
        const days = daysUntil(nextDue);
        if (days > daysAhead) continue;

        result.push({
          id: `debt-${debt.id}`,
          type: "debt",
          title: debt.name,
          subtitle: debt.lender || "Debt payment",
          amount: debt.minimum_payment,
          dueDate: nextDue,
          daysUntilDue: days,
          sourceId: debt.id,
          accountId: debt.account_id,
          href: "/tools/debts",
        });
      }
    }

    // ── Insurance ──
    if (policies) {
      for (const policy of policies) {
        if (!policy.is_active) continue;
        const nextDue = getNextPremiumDueDate(policy.renewal_date, policy.premium_frequency);
        if (!nextDue) continue;
        const days = daysUntil(nextDue);
        if (days > daysAhead) continue;

        result.push({
          id: `insurance-${policy.id}`,
          type: "insurance",
          title: policy.name,
          subtitle: policy.provider || "Insurance premium",
          amount: policy.premium_amount,
          dueDate: nextDue,
          daysUntilDue: days,
          sourceId: policy.id,
          accountId: policy.account_id,
          href: "/tools/insurance",
        });
      }
    }

    // ── Contributions (unpaid for current month) ──
    if (contributions) {
      const currentPeriod = getCurrentContributionPeriod();
      const TYPE_LABELS: Record<string, string> = {
        sss: "SSS",
        philhealth: "PhilHealth",
        pagibig: "Pag-IBIG",
      };

      for (const contrib of contributions) {
        if (contrib.is_paid) continue;
        if (contrib.period !== currentPeriod) continue;

        // Contributions are typically due by end of month
        const [y, m] = contrib.period.split("-").map(Number);
        const dueDate = new Date(y, m, 0); // last day of the month
        const days = daysUntil(dueDate);
        if (days > daysAhead) continue;

        result.push({
          id: `contribution-${contrib.id}`,
          type: "contribution",
          title: `${TYPE_LABELS[contrib.type] ?? contrib.type} Contribution`,
          subtitle: contrib.period,
          amount: contrib.employee_share,
          dueDate,
          daysUntilDue: days,
          sourceId: contrib.id,
          accountId: null,
          href: "/tools/contributions",
        });
      }
    }

    // Sort by urgency: overdue first, then soonest
    result.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return result;
  }, [bills, debts, policies, contributions, daysAhead]);

  const totalDue = items.reduce((sum, item) => sum + item.amount, 0);
  const overdueCount = items.filter((i) => i.daysUntilDue < 0).length;
  const dueSoonCount = items.filter((i) => i.daysUntilDue >= 0 && i.daysUntilDue <= 7).length;

  return { items, totalDue, overdueCount, dueSoonCount, isLoading };
}
