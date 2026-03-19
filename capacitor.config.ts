import type { CapacitorConfig } from "@capacitor/cli";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env.local" });

const serverUrl = process.env.CAP_SERVER_URL;
const useHostedServer = process.env.CAP_USE_SERVER_URL === "true";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHost = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const config: CapacitorConfig = {
  appId: "com.jvcerezo.exitplan",
  appName: "Sandalan",
  webDir: "out",
  server: {
    // Keep ALL navigation inside the WebView — prevents links from
    // opening in the system browser on redirects, auth flows, etc.
    allowNavigation: [
      "exitplan.app",
      "*.exitplan.app",
      "*.supabase.co",
      ...(supabaseHost ? [supabaseHost] : []),
      "accounts.google.com",
      "*.google.com",
    ],
    ...(useHostedServer && serverUrl
      ? {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        }
      : {}),
  },
  plugins: {
    Keyboard: {
      resize: "none",
      style: "dark",
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
