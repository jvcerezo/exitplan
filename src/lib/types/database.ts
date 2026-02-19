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
