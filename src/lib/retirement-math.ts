/**
 * SSS pension estimation and retirement projection utilities.
 */

export interface SSSPensionEstimate {
  monthlyPension: number;
  averageMSC: number;
  creditedYears: number;
  formula: string;
}

/**
 * Estimate SSS monthly pension based on average MSC and credited years.
 * Formula: max of (P300 + 20% AMSC + 2% AMSC * (CYS - 10), P1,200, 40% AMSC)
 */
export function estimateSSSPension(
  averageMSC: number,
  creditedYears: number
): SSSPensionEstimate {
  if (creditedYears < 10) {
    return {
      monthlyPension: 0,
      averageMSC,
      creditedYears,
      formula: "Minimum 10 years (120 months) of contributions required",
    };
  }

  const formula1 = 300 + averageMSC * 0.2 + averageMSC * 0.02 * (creditedYears - 10);
  const formula2 = 1200;
  const formula3 = averageMSC * 0.4;
  const monthlyPension = Math.round(Math.max(formula1, formula2, formula3) * 100) / 100;

  return {
    monthlyPension,
    averageMSC,
    creditedYears,
    formula: `max(P300 + 20% × P${averageMSC.toLocaleString()} + 2% × P${averageMSC.toLocaleString()} × ${creditedYears - 10}, P1,200, 40% × P${averageMSC.toLocaleString()})`,
  };
}

export interface RetirementProjection {
  sssPension: SSSPensionEstimate;
  desiredMonthlyIncome: number;
  monthlyGap: number;
  totalSavingsNeeded: number;
  currentSavings: number;
  savingsShortfall: number;
  requiredMonthlySavings: number;
  yearsToRetirement: number;
}

/**
 * Project retirement readiness given current situation.
 * Uses the 4% safe withdrawal rule for total savings needed.
 */
export function projectRetirement(params: {
  currentAge: number;
  retirementAge: number;
  monthlySalary: number;
  currentSavings: number;
  desiredMonthlyIncome: number;
  contributionYears: number;
}): RetirementProjection {
  const { currentAge, retirementAge, monthlySalary, currentSavings, desiredMonthlyIncome, contributionYears } = params;

  // Estimate MSC (clamped)
  const msc = Math.min(30000, Math.max(4000, Math.round(monthlySalary / 500) * 500));
  const totalCYS = contributionYears + Math.max(0, retirementAge - currentAge);
  const sssPension = estimateSSSPension(msc, Math.min(totalCYS, 40));

  const monthlyGap = Math.max(0, desiredMonthlyIncome - sssPension.monthlyPension);

  // 4% rule: annual gap / 0.04 = total needed
  const annualGap = monthlyGap * 12;
  const totalSavingsNeeded = annualGap > 0 ? Math.round(annualGap / 0.04) : 0;
  const savingsShortfall = Math.max(0, totalSavingsNeeded - currentSavings);

  const yearsToRetirement = Math.max(0, retirementAge - currentAge);
  const monthsToRetirement = yearsToRetirement * 12;

  // Required monthly savings assuming 7% annual returns (MP2-like)
  let requiredMonthlySavings = 0;
  if (monthsToRetirement > 0 && savingsShortfall > 0) {
    const monthlyRate = 0.07 / 12;
    // Future value of current savings
    const futureCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsToRetirement);
    const remaining = totalSavingsNeeded - futureCurrentSavings;
    if (remaining > 0) {
      // PMT formula
      const fvFactor = (Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate;
      requiredMonthlySavings = Math.round((remaining / fvFactor) * 100) / 100;
    }
  }

  return {
    sssPension,
    desiredMonthlyIncome,
    monthlyGap,
    totalSavingsNeeded,
    currentSavings,
    savingsShortfall,
    requiredMonthlySavings: Math.max(0, requiredMonthlySavings),
    yearsToRetirement,
  };
}
