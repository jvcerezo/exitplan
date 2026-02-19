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

export type Category = (typeof CATEGORIES)[number];
