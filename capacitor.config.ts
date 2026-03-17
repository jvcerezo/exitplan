import type { CapacitorConfig } from "@capacitor/cli";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env.local" });

const serverUrl = process.env.CAP_SERVER_URL;
const useHostedServer = process.env.CAP_USE_SERVER_URL === "true";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const config: CapacitorConfig = {
  appId: "com.jvcerezo.exitplan",
  appName: "ExitPlan",
  webDir: "out",
  ...(useHostedServer && serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
          // Keep all navigation inside the WebView — prevents links from
          // opening in the system browser.  The Supabase + Google domains
          // are required so the OAuth flow stays in the WebView instead of
          // bouncing to the system browser.
          allowNavigation: [
            new URL(serverUrl).hostname,
            ...(supabaseHost ? [supabaseHost] : []),
            "accounts.google.com",
            "*.google.com",
          ],
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
