export interface Transaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export type TransactionInsert = Omit<Transaction, "id" | "created_at" | "user_id">;

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
}
