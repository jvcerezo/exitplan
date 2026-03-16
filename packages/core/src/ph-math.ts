/**
 * Philippine government contribution and tax calculation utilities.
 * Rates based on 2024 schedules.
 */

import {
  SSS_RATE,
  PHILHEALTH_RATE,
  PAGIBIG_RATE,
  TRAIN_TAX_BRACKETS,
} from "./constants";

export interface SSSContribution {
  msc: number;
  employee: number;
  employer: number;
  ec: number; // employee compensation (employer-borne)
  total: number;
}

export interface PhilHealthContribution {
  monthly_salary: number;
  employee: number;
  employer: number;
  total: number;
}

export interface PagIbigContribution {
  employee: number;
  employer: number;
  total: number;
}

export interface GovernmentDeductions {
  sss: SSSContribution;
  philhealth: PhilHealthContribution;
  pagibig: PagIbigContribution;
  total_employee: number;
  total_employer: number;
  net_take_home: number;
}

/** Compute SSS Monthly Salary Credit and contributions. */
export function calculateSSS(
  monthlySalary: number,
  employmentType: "employed" | "self_employed" | "voluntary" | "ofw" = "employed"
): SSSContribution {
  const { min_msc, max_msc } = SSS_RATE;

  // Determine MSC (rounded to nearest 500, clamped to min/max)
  let msc: number;
  if (monthlySalary < 3250) {
    msc = min_msc;
  } else if (monthlySalary >= 29750) {
    msc = max_msc;
  } else {
    msc = Math.round(monthlySalary / 500) * 500;
  }

  // Self-employed / OFW pay full 13% themselves; employed splits 4.5 / 8.5
  const isSelfPay = employmentType === "self_employed" || employmentType === "ofw";

  const employee = isSelfPay ? Math.round(msc * SSS_RATE.total) : Math.round(msc * SSS_RATE.employee);
  const employer = isSelfPay ? 0 : Math.round(msc * SSS_RATE.employer);

  // EC premium: ₱10 for MSC ≤ ₱14,500, ₱30 above (employer only)
  const ec = employmentType === "employed" ? (msc <= 14500 ? SSS_RATE.ec_min : SSS_RATE.ec_max) : 0;

  return { msc, employee, employer, ec, total: employee + employer + ec };
}

/** Compute PhilHealth premium. */
export function calculatePhilHealth(
  monthlySalary: number,
  employmentType: "employed" | "self_employed" | "voluntary" | "ofw" = "employed"
): PhilHealthContribution {
  const { min_salary, max_salary, rate, employee: empRate, employer: emplrRate } = PHILHEALTH_RATE;

  const clampedSalary = Math.min(Math.max(monthlySalary, min_salary), max_salary);
  const totalPremium = Math.round(clampedSalary * rate * 100) / 100;

  const isSelfPay = employmentType === "self_employed" || employmentType === "ofw";

  const employee = isSelfPay ? totalPremium : Math.round(clampedSalary * empRate * 100) / 100;
  const employer = isSelfPay ? 0 : Math.round(clampedSalary * emplrRate * 100) / 100;

  return { monthly_salary: clampedSalary, employee, employer, total: employee + employer };
}

/** Compute Pag-IBIG mandatory contribution. */
export function calculatePagIbig(
  monthlySalary: number,
  employmentType: "employed" | "self_employed" | "voluntary" | "ofw" = "employed"
): PagIbigContribution {
  const { salary_threshold, max_compensation, employee_high, employer_high, employee_low, employer_low } = PAGIBIG_RATE;

  const base = Math.min(monthlySalary, max_compensation);
  const isHigh = monthlySalary > salary_threshold;

  const isSelfPay = employmentType === "self_employed" || employmentType === "ofw";

  const employeeRate = isHigh ? employee_high : employee_low;
  const employerRate = isHigh ? employer_high : employer_low;

  const employee = Math.round(base * employeeRate * 100) / 100;
  // Self-employed/OFW bear both shares themselves; employer share is 0 (no employer)
  const employer = isSelfPay ? 0 : Math.round(base * employerRate * 100) / 100;

  return { employee, employer, total: employee + employer };
}

/** Compute all three government deductions together. */
export function calculateGovernmentDeductions(
  monthlySalary: number,
  employmentType: "employed" | "self_employed" | "voluntary" | "ofw" = "employed"
): GovernmentDeductions {
  const sss = calculateSSS(monthlySalary, employmentType);
  const philhealth = calculatePhilHealth(monthlySalary, employmentType);
  const pagibig = calculatePagIbig(monthlySalary, employmentType);

  const total_employee = sss.employee + philhealth.employee + pagibig.employee;
  const total_employer = sss.employer + sss.ec + philhealth.employer + pagibig.employer;

  return {
    sss,
    philhealth,
    pagibig,
    total_employee,
    total_employer,
    net_take_home: monthlySalary - total_employee,
  };
}

// ─── TRAIN Law Income Tax ────────────────────────────────────────────────────

export interface TaxComputation {
  gross_annual: number;
  non_taxable_benefits: number; // 13th month + bonuses up to ₱90k
  taxable_income: number;
  tax_due: number;
  effective_rate: number;
  quarterly_estimate: number;
}

/** Compute annual income tax under the TRAIN Law (2023+). */
export function computeIncomeTax(
  grossAnnualIncome: number,
  nonTaxableBenefits = 0
): TaxComputation {
  const taxableIncome = Math.max(0, grossAnnualIncome - nonTaxableBenefits);

  let taxDue = 0;
  for (const bracket of TRAIN_TAX_BRACKETS) {
    if (taxableIncome > bracket.min) {
      const taxableInBracket = Math.min(taxableIncome, bracket.max === Infinity ? taxableIncome : bracket.max) - bracket.min;
      taxDue = bracket.base + taxableInBracket * bracket.rate;
    }
  }

  const effectiveRate = taxableIncome > 0 ? taxDue / taxableIncome : 0;

  return {
    gross_annual: grossAnnualIncome,
    non_taxable_benefits: nonTaxableBenefits,
    taxable_income: taxableIncome,
    tax_due: Math.round(taxDue * 100) / 100,
    effective_rate: Math.round(effectiveRate * 10000) / 100, // as percentage
    quarterly_estimate: Math.round((taxDue / 4) * 100) / 100,
  };
}

/** Compute optional 8% flat income tax for self-employed (vs graduated). */
export function computeFlatTax(grossAnnualIncome: number): TaxComputation {
  // 8% on gross sales/receipts in excess of ₱250,000
  const taxable = Math.max(0, grossAnnualIncome - 250000);
  const taxDue = taxable * 0.08;

  return {
    gross_annual: grossAnnualIncome,
    non_taxable_benefits: 0,
    taxable_income: taxable,
    tax_due: Math.round(taxDue * 100) / 100,
    effective_rate: grossAnnualIncome > 0 ? Math.round((taxDue / grossAnnualIncome) * 10000) / 100 : 0,
    quarterly_estimate: Math.round((taxDue / 4) * 100) / 100,
  };
}

/** Calculate 13th month pay. */
export function calculate13thMonth(
  basicMonthlySalary: number,
  monthsWorked = 12
): { gross: number; taxExemptPortion: number; taxable: number } {
  const gross = (basicMonthlySalary / 12) * monthsWorked;
  const taxExemptCap = 90000;
  const taxExemptPortion = Math.min(gross, taxExemptCap);
  const taxable = Math.max(0, gross - taxExemptCap);

  return {
    gross: Math.round(gross * 100) / 100,
    taxExemptPortion: Math.round(taxExemptPortion * 100) / 100,
    taxable: Math.round(taxable * 100) / 100,
  };
}
