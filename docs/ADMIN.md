# Sandalan Admin Panel

## Access

- **URL**: `https://exitplan-tau.vercel.app/admin`
- **Requirement**: User must be in the `admin_users` Supabase table
- **Auth**: Same Supabase auth as the main app — login with your admin account

### Adding an Admin User

Run in Supabase SQL Editor:
```sql
INSERT INTO public.admin_users (user_id, note)
VALUES ('your-user-uuid-here', 'Initial admin');
```

## Pages

### 1. Overview (`/admin`)

Dashboard with 50+ metrics across:
- **KPI Cards**: Total users, active 30d, onboarding completion, data integrity, open bugs, adulting adoption
- **Essential Monitoring**: Open bugs, critical bugs, missing accounts, missing emails
- **Coverage**: Account/goal/budget coverage percentages
- **Activity**: Transaction counts (7d, 30d), signups, account provisioning
- **Adulting Hub**: Adoption %, contributions/tax/debts/insurance/bills breakdown

### 2. Users (`/admin/users`)

Full user listing with:
- Name, email, user ID
- Admin/User role badge
- Active/Inactive status
- Transaction count, goal count, adulting feature count
- Last active date, join date
- Quick notes: users with goals, without transactions, using adulting hub

### 3. Bug Reports (`/admin/bug-reports`)

Feedback triage with:
- **KPI Cards**: Total, open, in progress, average rating
- **Type Breakdown**: Bug / Suggestion / Praise counts with emoji
- **Search**: Filter by text, status, and type
- **Report Cards**: Type badge, status badge, star rating, timestamp, message, reporter info
- **Status Update**: Inline dropdown to change Open → In Progress → Resolved

Feedback types are parsed from the title format: `[suggestion] ⭐⭐⭐ App Feedback`

### 4. Adulting Hub (`/admin/adulting`)

Analytics for adulting features:
- Hub adoption percentage
- Contributions: total, paid/unpaid, amount, type breakdown
- Tax records: total, filed/paid/unpaid, status breakdown
- Debts: total, active/paid off, outstanding balance, type breakdown
- Insurance: total, active, renewals in 30d, type breakdown
- Bills: total, active, monthly total, category breakdown
- Top 10 adulting users

## Discord Notifications

New feedback submissions send a Discord embed via webhook.

**Setup**:
1. Create Discord webhook in your server
2. Add `DISCORD_WEBHOOK_URL` to Vercel env vars
3. Feedback is sent directly from the Flutter app (no Supabase trigger needed)

## Supabase Tables Used

The admin panel reads from these tables (using `createAdminClient` which bypasses RLS):

- `profiles` — user metadata
- `transactions` — financial transactions
- `accounts` — bank/financial accounts
- `goals` — savings goals
- `budgets` — spending budgets
- `bug_reports` — feedback and bug reports
- `contributions` — SSS/PhilHealth/Pag-IBIG
- `tax_records` — BIR tax filing
- `debts` — debt tracking
- `insurance_policies` — insurance
- `bills` — recurring bills
- `admin_users` — admin registry
