/**
 * Builds a Capacitor-ready static export.
 * 1. Stashes server-only files
 * 2. Swaps server actions with client-side version
 * 3. Builds Next.js with output: "export"
 * 4. Restores everything
 */
import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const appDir = resolve(root, "src/app");
const stashDir = resolve(root, ".api-stash");

const TO_STASH = [
  "api",
  "auth/callback",
  "(admin)",
  "(app)/accounts/[id]",
  "(app)/accounts/detail",
  "icon.tsx",
  "opengraph-image.tsx",
  "twitter-image.tsx",
  "apple-icon.tsx",
  "sitemap.ts",
  "robots.ts",
];

function stash() {
  mkdirSync(stashDir, { recursive: true });
  for (const entry of TO_STASH) {
    const src = resolve(appDir, entry);
    if (!existsSync(src)) continue;
    const dest = resolve(stashDir, entry);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(src, dest, { recursive: true });
    rmSync(src, { recursive: true, force: true });
    console.log(`[build] Stashed ${entry}`);
  }
}

function restore() {
  if (!existsSync(stashDir)) return;
  for (const entry of TO_STASH) {
    const src = resolve(stashDir, entry);
    if (!existsSync(src)) continue;
    const dest = resolve(appDir, entry);
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    cpSync(src, dest, { recursive: true });
    console.log(`[build] Restored ${entry}`);
  }
  rmSync(stashDir, { recursive: true, force: true });
}

// Swap server actions with client-side version
const actionsFile = resolve(appDir, "(auth)/actions.ts");
const actionsClientFile = resolve(appDir, "(auth)/actions.client.ts");
const actionsBackup = resolve(stashDir, "actions.ts.bak");

function swapActions() {
  if (!existsSync(actionsFile) || !existsSync(actionsClientFile)) return;
  mkdirSync(stashDir, { recursive: true });
  cpSync(actionsFile, actionsBackup);
  cpSync(actionsClientFile, actionsFile);
  console.log("[build] Swapped actions.ts with client version");
}

function restoreActions() {
  if (!existsSync(actionsBackup)) return;
  cpSync(actionsBackup, actionsFile);
  rmSync(actionsBackup, { force: true });
  console.log("[build] Restored original actions.ts");
}

rmSync(resolve(root, ".next"), { recursive: true, force: true });

try {
  stash();
  swapActions();
  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, CAPACITOR_BUILD: "true" },
  });
} finally {
  restoreActions();
  restore();
}
