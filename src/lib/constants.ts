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
  { name: "BDO", type: "bank" as const },
  { name: "BPI", type: "bank" as const },
  { name: "GCash", type: "e-wallet" as const },
  { name: "Maya", type: "e-wallet" as const },
] as const;
