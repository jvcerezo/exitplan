-- ─── Philippine Adulting Feature Tables ─────────────────────────────────────
-- Fully idempotent — safe to re-run against an existing database.

-- ─── contributions ────────────────────────────────────────────────────────────
create table if not exists contributions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  type             text not null check (type in ('sss', 'philhealth', 'pagibig')),
  period           text not null,          -- YYYY-MM
  monthly_salary   numeric(12,2) not null,
  employee_share   numeric(12,2) not null,
  employer_share   numeric(12,2),
  total_contribution numeric(12,2) not null,
  is_paid          boolean not null default false,
  employment_type  text not null default 'employed'
                     check (employment_type in ('employed','self_employed','voluntary','ofw')),
  notes            text
);

alter table contributions enable row level security;

drop policy if exists "Users can manage own contributions" on contributions;
create policy "Users can manage own contributions"
  on contributions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists contributions_user_period
  on contributions(user_id, period desc);

-- Migration: unique constraint prevents saving the same (user, type, period) twice
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'contributions_user_type_period_key'
  ) then
    alter table contributions
      add constraint contributions_user_type_period_key unique (user_id, type, period);
  end if;
end $$;

-- ─── tax_records ──────────────────────────────────────────────────────────────
create table if not exists tax_records (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  year             integer not null,
  quarter          integer check (quarter between 1 and 4),  -- null = annual filing
  gross_income     numeric(12,2) not null default 0,
  deductions       numeric(12,2) not null default 0,
  taxable_income   numeric(12,2) not null default 0,
  tax_due          numeric(12,2) not null default 0,
  amount_paid      numeric(12,2) not null default 0,
  filing_type      text not null default 'quarterly'
                     check (filing_type in ('quarterly','annual')),
  taxpayer_type    text not null default 'employed'
                     check (taxpayer_type in ('employed','self_employed','mixed')),
  status           text not null default 'draft'
                     check (status in ('draft','filed','paid')),
  notes            text
);

alter table tax_records enable row level security;

drop policy if exists "Users can manage own tax records" on tax_records;
create policy "Users can manage own tax records"
  on tax_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists tax_records_user_year
  on tax_records(user_id, year desc, quarter);

-- ─── debts ────────────────────────────────────────────────────────────────────
create table if not exists debts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references profiles(id) on delete cascade,
  created_at       timestamptz not null default now(),
  name             text not null,
  type             text not null default 'other'
                     check (type in ('credit_card','personal_loan','sss_loan','pagibig_loan','home_loan','car_loan','salary_loan','other')),
  lender           text,
  current_balance  numeric(12,2) not null default 0,
  original_amount  numeric(12,2) not null default 0,
  interest_rate    numeric(6,4) not null default 0,  -- annual rate as decimal (0.24 = 24%)
  minimum_payment  numeric(12,2) not null default 0,
  due_day          integer check (due_day between 1 and 31),
  is_paid_off      boolean not null default false,
  notes            text,
  account_id       uuid references public.accounts(id) on delete set null
);

alter table debts enable row level security;

drop policy if exists "Users can manage own debts" on debts;
create policy "Users can manage own debts"
  on debts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists debts_user_id
  on debts(user_id, is_paid_off, created_at desc);

create index if not exists idx_debts_account_id
  on debts(account_id);

-- Migration: add account_id to debts if it doesn't already exist
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'debts' and column_name = 'account_id'
  ) then
    alter table debts add column account_id uuid references public.accounts(id) on delete set null;
    create index if not exists idx_debts_account_id on debts(account_id);
  end if;
end $$;

-- ─── insurance_policies ───────────────────────────────────────────────────────
create table if not exists insurance_policies (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references profiles(id) on delete cascade,
  created_at         timestamptz not null default now(),
  name               text not null,
  type               text not null default 'other'
                       check (type in ('life','health','hmo','car','property','ctpl','other')),
  provider           text,
  policy_number      text,
  premium_amount     numeric(12,2) not null default 0,
  premium_frequency  text not null default 'monthly'
                       check (premium_frequency in ('monthly','quarterly','semi_annual','annual')),
  coverage_amount    numeric(14,2),
  renewal_date       date,
  is_active          boolean not null default true,
  notes              text,
  account_id         uuid references public.accounts(id) on delete set null
);

alter table insurance_policies enable row level security;

drop policy if exists "Users can manage own insurance policies" on insurance_policies;
create policy "Users can manage own insurance policies"
  on insurance_policies for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists insurance_user_id
  on insurance_policies(user_id, is_active, renewal_date);

create index if not exists idx_insurance_account_id
  on insurance_policies(account_id);

-- Migration: add account_id to insurance_policies if it doesn't already exist
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'insurance_policies' and column_name = 'account_id'
  ) then
    alter table insurance_policies add column account_id uuid references public.accounts(id) on delete set null;
    create index if not exists idx_insurance_account_id on insurance_policies(account_id);
  end if;
end $$;

-- ─── bills ────────────────────────────────────────────────────────────────────
create table if not exists bills (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  created_at      timestamptz not null default now(),
  name            text not null,
  category        text not null default 'other'
                    check (category in ('electricity','water','internet','mobile','cable_tv','rent','association_dues','streaming','software','gym','other')),
  amount          numeric(12,2) not null default 0,
  billing_cycle   text not null default 'monthly'
                    check (billing_cycle in ('monthly','quarterly','semi_annual','annual')),
  due_day         integer check (due_day between 1 and 31),
  provider        text,
  last_paid_date  date,
  is_active       boolean not null default true,
  notes           text,
  account_id      uuid references public.accounts(id) on delete set null
);

alter table bills enable row level security;

drop policy if exists "Users can manage own bills" on bills;
create policy "Users can manage own bills"
  on bills for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists bills_user_id
  on bills(user_id, is_active, category);

create index if not exists idx_bills_account_id
  on bills(account_id);

-- Migration: add account_id to bills if it doesn't already exist
do $$ begin
  if not exists (
    select 1 from information_schema.columns
    where table_name = 'bills' and column_name = 'account_id'
  ) then
    alter table bills add column account_id uuid references public.accounts(id) on delete set null;
    create index if not exists idx_bills_account_id on bills(account_id);
  end if;
end $$;
