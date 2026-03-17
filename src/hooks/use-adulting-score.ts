"use client";

import { useMemo } from "react";
import { useChecklistProgress } from "./use-adulting-checklist";
import { useEmergencyFund } from "./use-emergency-fund";
import { useAccounts } from "./use-accounts";
import { useBudgets } from "./use-budgets";
import { useInsurancePolicies } from "./use-insurance";
import { CHECKLIST_PHASES } from "@/lib/adulting-checklist-data";
import type { AdultingScoreResult } from "@/lib/guide/types";

const PHASE_WEIGHTS: Record<string, { weight: number; label: string }> = {
  "government-ids": { weight: 20, label: "IDs & Registration" },
  banking: { weight: 10, label: "Banking & Savings" },
  contributions: { weight: 15, label: "Contributions" },
  tax: { weight: 15, label: "Tax Compliance" },
  insurance: { weight: 15, label: "Protection" },
  investing: { weight: 15, label: "Investing" },
  estate: { weight: 10, label: "Estate Planning" },
};

function getLevel(score: number): string {
  if (score >= 80) return "Adulting Pro";
  if (score >= 60) return "On Track";
  if (score >= 40) return "Getting There";
  return "Just Starting";
}

export function useAdultingScore(): AdultingScoreResult & { isLoading: boolean } {
  const { data: completedIds = [], isLoading: checklistLoading } = useChecklistProgress();
  const { data: efData, isLoading: efLoading } = useEmergencyFund(3);
  const { data: accounts, isLoading: accLoading } = useAccounts();
  const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
  const { data: budgetData, isLoading: budgetLoading } = useBudgets(currentMonth, "monthly");
  const { data: insurance, isLoading: insLoading } = useInsurancePolicies();

  const isLoading = checklistLoading || efLoading || accLoading || budgetLoading || insLoading;

  const result = useMemo(() => {
    const completedSet = new Set(completedIds);

    const subScores = CHECKLIST_PHASES.map((phase) => {
      const config = PHASE_WEIGHTS[phase.id];
      if (!config) return null;

      const completed = phase.items.filter((item) => completedSet.has(item.id)).length;
      const total = phase.items.length;
      let phaseScore = total > 0 ? Math.round((completed / total) * 100) : 0;

      // Boost banking score if user has accounts or emergency fund
      if (phase.id === "banking") {
        const accountBonus = (accounts?.length ?? 0) > 0 ? 10 : 0;
        const efBonus = (efData?.progressPercent ?? 0) >= 50 ? 15 : 0;
        phaseScore = Math.min(100, phaseScore + accountBonus + efBonus);
      }

      // Boost insurance score if user has policies tracked
      if (phase.id === "insurance") {
        const policyBonus = (insurance?.length ?? 0) > 0 ? 15 : 0;
        phaseScore = Math.min(100, phaseScore + policyBonus);
      }

      return {
        label: config.label,
        score: phaseScore,
        weight: config.weight,
        detail: `${completed}/${total} steps`,
      };
    }).filter((s): s is NonNullable<typeof s> => s !== null);

    // Weighted total
    const totalWeight = subScores.reduce((sum, s) => sum + s.weight, 0);
    const total = totalWeight > 0
      ? Math.round(subScores.reduce((sum, s) => sum + (s.score * s.weight) / totalWeight, 0))
      : 0;

    return {
      total,
      level: getLevel(total),
      subScores: subScores.map(({ label, score, detail }) => ({ label, score, detail })),
    };
  }, [completedIds, efData, accounts, budgetData, insurance]);

  return { ...result, isLoading };
}
