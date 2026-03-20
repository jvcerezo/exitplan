export const CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Food",
  "Housing",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Family Support",
  "Transfer",
  "Other",
] as const;

export const EXPENSE_CATEGORIES = [
  "Food",
  "Housing",
  "Transportation",
  "Entertainment",
  "Healthcare",
  "Education",
  "Family Support",
  "Other",
] as const;

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const GOAL_CATEGORIES = [
  "Emergency Fund",
  "Debt Payoff",
  "Savings",
  "Investment",
  "Retirement",
  "Travel",
  "Education",
  "Home",
  "Vehicle",
  "Other",
] as const;

export type GoalCategory = (typeof GOAL_CATEGORIES)[number];

export const CURRENCIES = [
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

/** Fallback exchange rates TO PHP (1 unit = X PHP) */
export const DEFAULT_RATES_TO_PHP: Record<string, number> = {
  PHP: 1,
  USD: 56.5,
  AUD: 36.0,
};

export const NO_DECIMAL_CURRENCIES: string[] = [];

export const ACCOUNT_TYPES = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Account" },
  { value: "e-wallet", label: "E-Wallet" },
  { value: "credit-card", label: "Credit Card" },
] as const;

export const COMMON_ACCOUNTS = [
  { name: "Cash", type: "cash" as const },
  { name: "GCash", type: "e-wallet" as const },
  { name: "Maya", type: "e-wallet" as const },
] as const;

// ─── Philippine Government Contribution Rates ────────────────────────────────

/** SSS 2024: 14% total. MSC range ₱3,000–₱30,000 */
export const SSS_RATE = {
  employee: 0.045,
  employer: 0.095,
  total: 0.14,
  min_msc: 4000,
  max_msc: 30000,
  /** EC (Employee Compensation) added on top for employed, borne by employer */
  ec_min: 10,
  ec_max: 30,
} as const;

/** PhilHealth 2024: 5% of monthly basic salary */
export const PHILHEALTH_RATE = {
  rate: 0.05,
  employee: 0.025,
  employer: 0.025,
  min_salary: 10000,
  max_salary: 100000,
} as const;

/** Pag-IBIG / HDMF mandatory contribution */
export const PAGIBIG_RATE = {
  /** For salary > ₱1,500 */
  employee_high: 0.02,
  employer_high: 0.02,
  /** For salary ≤ ₱1,500 */
  employee_low: 0.01,
  employer_low: 0.02,
  salary_threshold: 1500,
  /** Max compensation for mandatory contribution computation */
  max_compensation: 5000,
} as const;

/** TRAIN Law income tax brackets (2023 onwards, annual) */
export const TRAIN_TAX_BRACKETS = [
  { min: 0,         max: 250000,   base: 0,      rate: 0 },
  { min: 250000,    max: 400000,   base: 0,      rate: 0.15 },
  { min: 400000,    max: 800000,   base: 22500,  rate: 0.20 },
  { min: 800000,    max: 2000000,  base: 102500, rate: 0.25 },
  { min: 2000000,   max: 8000000,  base: 402500, rate: 0.30 },
  { min: 8000000,   max: Infinity, base: 2202500,rate: 0.35 },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: "employed",      label: "Employed" },
  { value: "self_employed", label: "Self-Employed / Freelancer" },
  { value: "voluntary",     label: "Voluntary Member" },
  { value: "ofw",           label: "OFW" },
] as const;

export const BIR_DEADLINES = [
  { label: "Q1 (Jan–Mar)",  form: "1701Q", due: "May 15" },
  { label: "Q2 (Apr–Jun)",  form: "1701Q", due: "August 15" },
  { label: "Q3 (Jul–Sep)",  form: "1701Q", due: "November 15" },
  { label: "Annual",        form: "1701/1701A", due: "April 15" },
] as const;
