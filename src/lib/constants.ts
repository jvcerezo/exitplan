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
