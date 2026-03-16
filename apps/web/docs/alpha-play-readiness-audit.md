# ExitPlan Readiness Audit — Alpha Testing & Google Play Deployment

Date: 2026-03-15

## Executive Summary

- **Alpha testing readiness (product/feature validation):** **CONDITIONAL GO**
- **Google Play deployment readiness (Android release):** **NO-GO (current state)**

The app is stable enough to begin alpha user testing on web/PWA flows, but it is **not yet ready** for Play deployment due to mobile export/build blockers and missing release/policy prerequisites.

---

## Evidence Collected

### Commands executed

1. `npm run build` → ✅ Pass
2. `npm run lint` → ❌ Fail (existing repo issues)
3. `npm run build:mobile` → ❌ Fail
4. `npm run mobile:android` → ✅ Pass (Capacitor sync succeeds)
5. `android\\gradlew.bat bundleRelease` → ❌ Fail (`JAVA_HOME` not set in this environment)

### Key configuration files reviewed

- `package.json`
- `next.config.ts`
- `capacitor.config.ts`
- `android/variables.gradle`
- `android/app/build.gradle`
- `android/app/src/main/AndroidManifest.xml`
- `.env.local.example`

---

## Alpha Testing Readiness Audit

## 1) Build & runtime baseline

- **Web production build:** ✅ Pass (`npm run build`)
- **Lint quality gate:** ❌ Failing with existing issues (hooks/purity/content rules)

Assessment:
- Alpha can proceed if focus is real-world behavior and bug discovery, not code-style conformance.
- Lint failures should still be tracked as technical debt before public release.

## 2) Functional test coverage state

- No dedicated automated test suite (unit/integration/e2e) was found in scripts.
- Regression currently relies on manual testing + build checks.

Assessment:
- Acceptable for early alpha, but medium risk for regression escape.

## 3) Feature-level alpha scope

Based on current app structure and routes, testable alpha surface includes:
- Auth/onboarding
- Dashboard
- Transactions
- Goals
- Budgets
- Accounts
- Settings
- Offline fallback path

Assessment:
- Scope is broad enough for meaningful alpha signal.

---

## Google Play Deployment Readiness Audit

## 1) Android technical baseline

- `minSdkVersion = 24` ✅
- `targetSdkVersion = 36` ✅
- `compileSdkVersion = 36` ✅
- Package ID `com.jvcerezo.exitplan` present ✅

Assessment:
- SDK targets are modern and compatible with current Play expectations.

## 2) Mobile packaging path

- `npm run mobile:android` (Cap sync) succeeds ✅
- `npm run build:mobile` fails ❌
  - Failure source: Next export mode with an API route:
  - `/api/exchange-rates` not configured for static export

Impact:
- Current static export pipeline for mobile packaging is blocked.

## 3) Release artifact generation

- `bundleRelease` not verified in this environment (JAVA_HOME missing) ❌
- No explicit release signing config found in `android/app/build.gradle` ⚠️

Impact:
- AAB production readiness is not demonstrated.

## 4) Play policy/compliance artifacts

Repository evidence does **not** currently show:
- Privacy Policy URL/documentation
- Data Safety declaration mapping
- Account deletion policy/URL (if account creation is supported)
- Play content rating questionnaire prep
- Production release checklist for store listing assets

Impact:
- Even with a buildable AAB, Play submission is at high risk of rejection/delay without these assets.

---

## Blockers (Must Fix Before Play Deployment)

1. **Mobile export build fails** (`npm run build:mobile`) due to API route incompatibility with `output: "export"`.
2. **Release bundle not validated** (`bundleRelease` blocked in current environment + signing not confirmed).
3. **Policy readiness incomplete** (privacy policy/data safety/account deletion flow documentation absent).

---

## High-Priority Risks (Alpha + Play)

1. **No automated tests** → regression risk between changes.
2. **Lint errors present** → quality drift risk before wider rollout.
3. **Mobile/static architecture mismatch** → release delay risk.

---

## Go / No-Go Decision

### Alpha testing (invite users now)
- **Decision:** ✅ **GO (with constraints)**
- Conditions:
  - Use structured feedback form + triage
  - Prioritize critical flow bugs
  - Defer Play launch messaging until blockers are cleared

### Google Play deployment
- **Decision:** ❌ **NO-GO**
- Reason:
  - Packaging and compliance prerequisites are not fully satisfied yet.

---

## 7-Day Remediation Plan (Recommended)

## Day 1–2: Packaging Fix
- Resolve `build:mobile` export incompatibility:
  - Option A: remove/replace runtime API dependencies for export build.
  - Option B: avoid static export path for mobile and load from hosted server (`CAP_SERVER_URL`) with release-safe config.
- Re-run `npm run build:mobile` until green.

## Day 2–3: Android Release Pipeline
- Configure Java/Android build environment.
- Add release signing workflow (upload key + secure secrets handling).
- Produce test AAB via `bundleRelease`.

## Day 3–5: Compliance Pack
- Publish Privacy Policy URL.
- Prepare Data Safety responses (Supabase/auth/storage/analytics behavior).
- Define account deletion path and user-facing instructions.
- Prepare store listing assets (icon, screenshots, feature graphic, short/long descriptions).

## Day 5–7: Stabilization
- Fix high-impact lint/runtime issues tied to core flows.
- Run another full alpha regression cycle.
- Freeze release candidate and submit internal testing track on Play Console.

---

## Immediate Next Actions (Practical)

1. Decide mobile architecture for Play release (`export` vs hosted `server.url` approach).
2. Unblock `build:mobile` and verify a reproducible Android release build.
3. Draft privacy policy + data safety + account deletion content before Play submission.
