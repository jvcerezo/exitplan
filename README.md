# Sandalan — Web App & Admin Panel

Next.js web application for Sandalan. Serves as:
1. **Web app** — full personal finance tracker (same features as Flutter app)
2. **Admin panel** — user management, feedback triage, analytics
3. **API routes** — exchange rates, receipt OCR, data export, feedback webhook

## Tech Stack

- **Next.js 16** / React 19
- **Supabase** — auth, database, RLS, admin functions
- **TailwindCSS 4** — styling
- **shadcn/ui** — component library
- **Capacitor 8** — Android wrapper (hosted mode)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook
WEBHOOK_SECRET=your-webhook-secret
```

## Project Structure

```
src/
  app/
    (admin)/admin/          # Admin panel (protected by is_admin_user RPC)
      page.tsx              #   Dashboard overview (50+ metrics)
      users/page.tsx        #   User management
      bug-reports/page.tsx  #   Feedback triage (bug/suggestion/praise)
      adulting/page.tsx     #   Adulting hub analytics
    (app)/                  # Main app routes (protected by auth)
      dashboard/            #   Financial dashboard
      guide/                #   Life stage guide
      budgets/              #   Budget management
      tools/                #   Financial tools
      settings/             #   User settings
    (auth)/auth/            # Auth callback
    api/                    # API routes
      exchange-rates/       #   PHP exchange rates (24hr cache)
      export-data/          #   GDPR/DPA data export
      receipts/extract/     #   OCR receipt extraction (OCR.Space)
      delete-account/       #   Account deletion
      webhooks/new-feedback/ # Discord webhook for feedback
    privacy/                # Privacy policy page
    terms/                  # Terms of service page
  components/               # React components by feature
  hooks/                    # Custom hooks (accounts, transactions, budgets, etc.)
  lib/
    supabase/               # Supabase clients (browser, server, middleware, admin)
    types/database.ts       # TypeScript types for all DB tables
    constants.ts            # Rates, categories, currencies
supabase/
  schema.sql                # Main DB schema
  adulting_tables.sql       # Contributions + tax tables
  subscriptions.sql         # Premium billing table
docs/
  ADMIN.md                  # Admin panel documentation
  offline-strategy.md       # Offline architecture (5 phases)
  alpha-play-readiness-audit.md # Play Store readiness assessment
```

## Admin Panel

See [docs/ADMIN.md](docs/ADMIN.md) for full documentation.

**Access**: `https://sandalan.app/admin`

4 pages:
- **Overview** — KPIs, user activity, data health, signups
- **Users** — full user listing with activity metrics
- **Bug Reports** — feedback triage with search, filtering, status updates
- **Adulting Hub** — adoption metrics for contributions, tax, debts, insurance, bills

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/exchange-rates` | GET | PHP exchange rates (cached 24hr) |
| `/api/export-data` | POST | GDPR/DPA compliant data export |
| `/api/receipts/extract` | POST | OCR receipt text extraction |
| `/api/delete-account` | DELETE | Full account deletion |
| `/api/webhooks/new-feedback` | POST | Discord notification on new feedback |

## Deployment

### Web (Vercel)

Push to `main` branch — auto-deploys to `sandalan.app`.

### Android (Capacitor Hosted Mode)

For Google Play builds using Capacitor:

```bash
# Set deployed URL
$env:CAP_SERVER_URL="https://sandalan.app"

# Sync Capacitor
npm run mobile:android:hosted

# Build AAB
cd android
.\gradlew.bat bundleRelease
```

See the [Flutter app's DEPLOYMENT.md](../sandalan-android/docs/DEPLOYMENT.md) for the current primary Android build process (native Flutter, not Capacitor).

## Supabase Migrations

| File | Purpose | Run when |
|------|---------|----------|
| `supabase/schema.sql` | Core tables + RPC functions | Initial setup |
| `supabase/adulting_tables.sql` | Contributions + tax_records | Initial setup |
| `supabase/subscriptions.sql` | Premium subscriptions table | Before billing goes live |

## Documentation

- [Admin Panel](docs/ADMIN.md)
- [Offline Strategy](docs/offline-strategy.md)
- [Play Readiness Audit](docs/alpha-play-readiness-audit.md)
