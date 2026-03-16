import type { CapacitorConfig } from "@capacitor/cli";
import { configDotenv } from "dotenv";

configDotenv({ path: ".env.local" });

const serverUrl = process.env.CAP_SERVER_URL;
const useHostedServer = process.env.CAP_USE_SERVER_URL === "true";

const config: CapacitorConfig = {
  appId: "com.jvcerezo.exitplan",
  appName: "ExitPlan",
  webDir: "public",
  ...(useHostedServer && serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith("http://"),
        },
      }
    : {}),
};

export default config;
