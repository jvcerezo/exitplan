export interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  currency: string;
  attachment_path: string | null;
  account_id: string | null;
  transfer_id: string | null;
}

export type TransactionInsert = Omit<
  Transaction,
  "id" | "created_at" | "user_id" | "attachment_path" | "account_id" | "transfer_id"
> & {
  attachment_path?: string | null;
  account_id?: string | null;
  transfer_id?: string | null;
};

export interface Goal {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  category: string;
  is_completed: boolean;
}

export type GoalInsert = Omit<Goal, "id" | "created_at" | "user_id" | "is_completed">;

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: "user" | "admin";
  created_at: string;
  primary_currency: string;
}

export interface Budget {
  id: string;
  created_at: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
}

export type BudgetInsert = Omit<Budget, "id" | "created_at" | "user_id">;

export interface ExchangeRate {
  id: string;
  created_at: string;
  user_id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
}

export type ExchangeRateInsert = Omit<ExchangeRate, "id" | "created_at" | "user_id">;

export interface Account {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  type: "cash" | "bank" | "e-wallet" | "credit-card";
  currency: string;
  balance: number;
  is_archived: boolean;
}

export type AccountInsert = Omit<
  Account,
  "id" | "created_at" | "user_id" | "balance" | "is_archived"
> & {
  balance?: number;
  is_archived?: boolean;
};
