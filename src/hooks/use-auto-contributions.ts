"use client";

import { useEffect, useRef } from "react";
import { useContributions, useBulkAddContributions } from "./use-contributions";
import { calculateGovernmentDeductions } from "@/lib/ph-math";
import { getCurrentContributionPeriod } from "@/lib/due-dates";
import type { EmploymentType } from "@/lib/types/database";

const AUTO_GEN_KEY = "exitplan_contrib_auto_gen";
const AUTO_TOGGLE_KEY = "exitplan_auto_contributions";

/**
 * Automatically generates contribution entries for the current month
 * based on the most recent month's salary and employment type.
 *
 * Only runs once per month per user. Entries are created as unpaid
 * so the user can mark them as paid when they actually pay.
 * Respects the user's automation toggle preference.
 */
export function useAutoContributions() {
  const { data: contributions, isLoading } = useContributions();
  const bulkAdd = useBulkAddContributions();
  const hasRun = useRef(false);

  useEffect(() => {
    if (isLoading || hasRun.current || !contributions || contributions.length === 0) return;
    hasRun.current = true;

    // Check if user has disabled auto-generation
    const toggleState = localStorage.getItem(AUTO_TOGGLE_KEY);
    if (toggleState === "0") return;

    const currentPeriod = getCurrentContributionPeriod();

    // Check if we already auto-generated this month
    const lastAutoGen = localStorage.getItem(AUTO_GEN_KEY);
    if (lastAutoGen === currentPeriod) return;

    // Check if current month already has entries
    const currentMonthEntries = contributions.filter((c) => c.period === currentPeriod);
    if (currentMonthEntries.length > 0) {
      // Already has entries for this month — mark as done
      localStorage.setItem(AUTO_GEN_KEY, currentPeriod);
      return;
    }

    // Find the most recent month with entries to use as template
    const sortedPeriods = [...new Set(contributions.map((c) => c.period))].sort().reverse();
    const lastPeriod = sortedPeriods[0];
    if (!lastPeriod) return;

    const templateEntries = contributions.filter((c) => c.period === lastPeriod);
    if (templateEntries.length === 0) return;

    // Use the salary and employment type from the template
    const salary = templateEntries[0].monthly_salary;
    const employmentType = templateEntries[0].employment_type as EmploymentType;

    if (salary <= 0) return;

    // Calculate current deductions
    const deductions = calculateGovernmentDeductions(salary, employmentType);

    const newEntries = [
      {
        type: "sss" as const,
        period: currentPeriod,
        monthly_salary: salary,
        employee_share: deductions.sss.employee,
        employer_share: deductions.sss.employer || null,
        total_contribution: deductions.sss.employee + deductions.sss.employer + deductions.sss.ec,
        is_paid: false,
        employment_type: employmentType,
      },
      {
        type: "philhealth" as const,
        period: currentPeriod,
        monthly_salary: salary,
        employee_share: deductions.philhealth.employee,
        employer_share: deductions.philhealth.employer || null,
        total_contribution: deductions.philhealth.total,
        is_paid: false,
        employment_type: employmentType,
      },
      {
        type: "pagibig" as const,
        period: currentPeriod,
        monthly_salary: salary,
        employee_share: deductions.pagibig.employee,
        employer_share: deductions.pagibig.employer || null,
        total_contribution: deductions.pagibig.total,
        is_paid: false,
        employment_type: employmentType,
      },
    ];

    bulkAdd.mutate(newEntries);
    localStorage.setItem(AUTO_GEN_KEY, currentPeriod);
  }, [contributions, isLoading, bulkAdd]);
}
