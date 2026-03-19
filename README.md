This is a [Next.js](https://nextjs.org) project for `Sandalan`, a personal finance tracker focused on budgeting, goals, transactions, and financial freedom planning.

## Google Play Release (Capacitor)

For Play deployment, use **Capacitor hosted mode** (recommended for this app because it uses Next API routes like `/api/exchange-rates`).

### Prerequisites

- A deployed HTTPS URL for the app (example: `https://app.sandalan.com`)
- JDK installed and `JAVA_HOME` configured
- Android Studio SDK + build tools installed
- Signing keystore configured in Android Studio/Gradle before final release

### 1) Set release environment

```bash
CAP_SERVER_URL=https://your-deployed-app-url
```

On Windows PowerShell:

```powershell
$env:CAP_SERVER_URL="https://your-deployed-app-url"
```

### 2) Sync Capacitor Android project

```bash
npm run mobile:android:hosted
```

### 3) Build release bundle (AAB)

```powershell
Set-Location "android"
.\gradlew.bat bundleRelease
```

Release output:
- `android/app/build/outputs/bundle/release/app-release.aab`

### 4) Configure signing for Google Play (required)

Set these values as Gradle properties (recommended in `%USERPROFILE%\.gradle\gradle.properties`) or environment variables:

- `SANDALAN_UPLOAD_STORE_FILE` (path to `.jks`)
- `SANDALAN_UPLOAD_STORE_PASSWORD`
- `SANDALAN_UPLOAD_KEY_ALIAS`
- `SANDALAN_UPLOAD_KEY_PASSWORD`

PowerShell example:

```powershell
$env:SANDALAN_UPLOAD_STORE_FILE="C:\keys\sandalan-upload.jks"
$env:SANDALAN_UPLOAD_STORE_PASSWORD="your_store_password"
$env:SANDALAN_UPLOAD_KEY_ALIAS="upload"
$env:SANDALAN_UPLOAD_KEY_PASSWORD="your_key_password"
```

Without these values, the app can still sync/build in development, but it is **not publish-ready** for Google Play.

### Important Notes

- `mobile:*:static` scripts rely on Next static export and can fail when server API routes are required.
- For Play release, keep `CAP_SERVER_URL` as `https://...`.
- `CAP_ALLOW_HTTP=true` is for local testing only.
- Java/JDK is required when building Android bundles locally with Gradle.

### CI Option (No local Java needed)

You can build Play-ready AABs in GitHub Actions using `.github/workflows/android-play-aab.yml`.

Add these repository secrets:

- `CAP_SERVER_URL` (deployed HTTPS app URL)
- `ANDROID_UPLOAD_KEYSTORE_BASE64` (base64-encoded `.jks` file)
- `SANDALAN_UPLOAD_STORE_PASSWORD`
- `SANDALAN_UPLOAD_KEY_ALIAS`
- `SANDALAN_UPLOAD_KEY_PASSWORD`

How to create `ANDROID_UPLOAD_KEYSTORE_BASE64` locally (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\keys\sandalan-upload.jks")) | Set-Clipboard
```

Then paste clipboard content into the GitHub secret value.

To run the workflow:

1. Push your code to GitHub.
2. Go to **Actions** → **Android Play AAB**.
3. Click **Run workflow**.
4. Download artifacts from the workflow run:
	- `app-release-aab` (for Google Play upload)
	- `app-release-apk` (for direct tester install)

This path is recommended if you want to avoid local Java/Gradle setup.

## Offline Support

The current offline rollout plan is documented in `docs/offline-strategy.md`.

- Phase 1 includes cached reads, an offline banner, and service worker-based route fallback.
- The next phase adds queued offline writes and sync recovery.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
