import type { CapacitorConfig } from "@capacitor/cli";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env.local" });

// Development-only: point to a local dev server for hot reload.
// NEVER set CAP_USE_SERVER_URL=true for production/Play Store builds.
// When server.url is set, Capacitor ignores webDir and acts as a remote
// web view — this breaks offline support and violates app store policies.
const devServerUrl = process.env.CAP_SERVER_URL;
const useDevServer = process.env.CAP_USE_SERVER_URL === "true";

const config: CapacitorConfig = {
  appId: "com.jvcerezo.exitplan",
  appName: "ExitPlan",
  webDir: "out",
  ...(useDevServer && devServerUrl
    ? {
        server: {
          url: devServerUrl,
          cleartext: devServerUrl.startsWith("http://"),
        },
      }
    : {}),
  plugins: {
    Keyboard: {
      resize: "none",
      style: "dark",
    },
  },
};

export default config;
