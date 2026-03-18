"use client";

import { useMemo } from "react";
import { useTransactions } from "./use-transactions";

const FAMILY_TAG = "family-support";

export interface FamilySupportSummary {
  totalThisMonth: number;
  totalLastMonth: number;
  monthOverMonthChange: number;
  byRecipient: { recipient: string; total: number }[];
  personalSpending: number;
  familyPercent: number;
}

function extractRecipient(tags: string[] | null): string {
  if (!tags) return "General";
  const familyTag = tags.find((t) => t.startsWith("family:"));
  if (familyTag) return familyTag.replace("family:", "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return "General";
}

export function useFamilySupport(): { data: FamilySupportSummary | null; isLoading: boolean } {
  const { data: allTransactions, isLoading } = useTransactions();

  const summary = useMemo(() => {
    if (!allTransactions) return null;

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const lastMonth = now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, "0")}`;

    const familyTxThisMonth = allTransactions.filter(
      (t) => t.date.startsWith(thisMonth) && t.amount < 0 && (t.tags?.includes(FAMILY_TAG) || t.category === "Family Support")
    );

    const familyTxLastMonth = allTransactions.filter(
      (t) => t.date.startsWith(lastMonth) && t.amount < 0 && (t.tags?.includes(FAMILY_TAG) || t.category === "Family Support")
    );

    const allExpensesThisMonth = allTransactions.filter(
      (t) => t.date.startsWith(thisMonth) && t.amount < 0
    );

    const totalThisMonth = familyTxThisMonth.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalLastMonth = familyTxLastMonth.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalExpenses = allExpensesThisMonth.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // By recipient
    const recipientMap = new Map<string, number>();
    for (const tx of familyTxThisMonth) {
      const recipient = extractRecipient(tx.tags);
      recipientMap.set(recipient, (recipientMap.get(recipient) ?? 0) + Math.abs(tx.amount));
    }
    const byRecipient = Array.from(recipientMap.entries())
      .map(([recipient, total]) => ({ recipient, total }))
      .sort((a, b) => b.total - a.total);

    return {
      totalThisMonth: Math.round(totalThisMonth * 100) / 100,
      totalLastMonth: Math.round(totalLastMonth * 100) / 100,
      monthOverMonthChange: totalLastMonth > 0 ? Math.round(((totalThisMonth - totalLastMonth) / totalLastMonth) * 100) : 0,
      byRecipient,
      personalSpending: Math.round((totalExpenses - totalThisMonth) * 100) / 100,
      familyPercent: totalExpenses > 0 ? Math.round((totalThisMonth / totalExpenses) * 100) : 0,
    };
  }, [allTransactions]);

  return { data: summary, isLoading };
}
