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
  split_group_id: string | null;
  tags: string[] | null;
}

export type TransactionInsert = Omit<
  Transaction,
  "id" | "created_at" | "user_id" | "attachment_path" | "account_id" | "transfer_id" | "split_group_id" | "tags"
> & {
  attachment_path?: string | null;
  account_id?: string | null;
  transfer_id?: string | null;
  split_group_id?: string | null;
  tags?: string[] | null;
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
  has_completed_onboarding: boolean;
  avatar_url: string | null;
}

export type BugReportSeverity = "low" | "medium" | "high" | "critical";
export type BugReportStatus = "open" | "in_progress" | "resolved";

export interface BugReport {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string;
  severity: BugReportSeverity;
  status: BugReportStatus;
  page_path: string | null;
  user_agent: string | null;
  app_version: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
}

export type BugReportInsert = Omit<
  BugReport,
  "id" | "created_at" | "user_id" | "status" | "resolved_at" | "resolved_by"
> & {
  status?: BugReportStatus;
  resolved_at?: string | null;
  resolved_by?: string | null;
};

export type BudgetPeriod = "weekly" | "monthly" | "quarterly";

export interface Budget {
  id: string;
  created_at: string;
  user_id: string;
  category: string;
  amount: number;
  month: string;
  period: BudgetPeriod;
  rollover: boolean;
}

export type BudgetInsert = Omit<Budget, "id" | "created_at" | "user_id" | "rollover" | "period"> & {
  period?: BudgetPeriod;
  rollover?: boolean;
};

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
  type: string;
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

export interface MarketRate {
  currency: string;
  rate_to_php: number;
  updated_at: string;
}

export type RecurringFrequency = "daily" | "weekly" | "monthly";

export interface RecurringTransaction {
  id: string;
  created_at: string;
  user_id: string;
  amount: number;
  category: string;
  description: string | null;
  currency: string;
  account_id: string | null;
  frequency: RecurringFrequency;
  interval_count: number;
  start_date: string;
  end_date: string | null;
  next_run_date: string;
  last_run_date: string | null;
  run_time: string | null;
  is_active: boolean;
  tags: string[] | null;
}

export type RecurringTransactionInsert = Omit<
  RecurringTransaction,
  "id" | "created_at" | "user_id" | "last_run_date"
> & {
  last_run_date?: string | null;
};

export type EmploymentType = "employed" | "self_employed" | "voluntary" | "ofw";
export type ContributionType = "sss" | "philhealth" | "pagibig";

export interface Contribution {
  id: string;
  user_id: string;
  created_at: string;
  type: ContributionType;
  period: string; // YYYY-MM
  monthly_salary: number;
  employee_share: number;
  employer_share: number | null;
  total_contribution: number;
  is_paid: boolean;
  employment_type: EmploymentType;
  notes: string | null;
}

export type ContributionInsert = Omit<Contribution, "id" | "created_at" | "user_id" | "employer_share" | "notes"> & {
  employer_share?: number | null;
  notes?: string | null;
};

export type TaxpayerType = "employed" | "self_employed" | "mixed";
export type TaxFilingType = "quarterly" | "annual";
export type TaxStatus = "draft" | "filed" | "paid";

export interface TaxRecord {
  id: string;
  user_id: string;
  created_at: string;
  year: number;
  quarter: number | null; // 1-4, null for annual
  gross_income: number;
  deductions: number;
  taxable_income: number;
  tax_due: number;
  amount_paid: number;
  filing_type: TaxFilingType;
  taxpayer_type: TaxpayerType;
  status: TaxStatus;
  notes: string | null;
}

export type TaxRecordInsert = Omit<TaxRecord, "id" | "created_at" | "user_id" | "notes"> & {
  notes?: string | null;
};

// ─── Debt Manager ─────────────────────────────────────────────────────────────

export type DebtType =
  | "credit_card"
  | "personal_loan"
  | "sss_loan"
  | "pagibig_loan"
  | "home_loan"
  | "car_loan"
  | "salary_loan"
  | "other";

export interface Debt {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  type: DebtType;
  lender: string | null;
  current_balance: number;
  original_amount: number;
  interest_rate: number; // annual rate as decimal (0.24 = 24%)
  minimum_payment: number;
  due_day: number | null; // 1-31
  is_paid_off: boolean;
  notes: string | null;
  account_id: string | null; // account this debt is paid from
}

export type DebtInsert = Omit<Debt, "id" | "created_at" | "user_id" | "is_paid_off" | "lender" | "due_day" | "notes" | "account_id"> & {
  lender?: string | null;
  due_day?: number | null;
  is_paid_off?: boolean;
  notes?: string | null;
  account_id?: string | null;
};

// ─── Insurance Tracker ────────────────────────────────────────────────────────

export type InsuranceType = "life" | "health" | "hmo" | "car" | "property" | "ctpl" | "other";
export type PremiumFrequency = "monthly" | "quarterly" | "semi_annual" | "annual";

export interface InsurancePolicy {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  type: InsuranceType;
  provider: string | null;
  policy_number: string | null;
  premium_amount: number;
  premium_frequency: PremiumFrequency;
  coverage_amount: number | null;
  renewal_date: string | null;
  is_active: boolean;
  notes: string | null;
  account_id: string | null; // account premiums are paid from
}

export type InsurancePolicyInsert = Omit<InsurancePolicy, "id" | "created_at" | "user_id" | "is_active" | "provider" | "policy_number" | "coverage_amount" | "renewal_date" | "notes" | "account_id"> & {
  provider?: string | null;
  policy_number?: string | null;
  coverage_amount?: number | null;
  renewal_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
  account_id?: string | null;
};

// ─── Bills & Subscriptions ───────────────────────────────────────────────────

export type BillCategory =
  | "electricity"
  | "water"
  | "internet"
  | "mobile"
  | "cable_tv"
  | "rent"
  | "association_dues"
  | "streaming"
  | "software"
  | "gym"
  | "other";

export type BillingCycle = "monthly" | "quarterly" | "semi_annual" | "annual";

export interface Bill {
  id: string;
  user_id: string;
  created_at: string;
  name: string;
  category: BillCategory;
  amount: number;
  billing_cycle: BillingCycle;
  due_day: number | null; // day of month, 1-31
  provider: string | null;
  last_paid_date: string | null;
  is_active: boolean;
  notes: string | null;
  account_id: string | null; // optional account this bill is paid from
}

export type BillInsert = Omit<Bill, "id" | "created_at" | "user_id" | "is_active" | "provider" | "due_day" | "last_paid_date" | "notes" | "account_id"> & {
  provider?: string | null;
  due_day?: number | null;
  last_paid_date?: string | null;
  is_active?: boolean;
  notes?: string | null;
  account_id?: string | null;
};
