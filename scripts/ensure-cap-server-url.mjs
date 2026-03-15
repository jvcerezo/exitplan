const serverUrl = process.env.CAP_SERVER_URL;
const allowHttp = process.env.CAP_ALLOW_HTTP === "true";

if (!serverUrl) {
  console.error(
    "[Capacitor] Missing CAP_SERVER_URL. Set it to your deployed HTTPS app URL before syncing for Play builds."
  );
  process.exit(1);
}

try {
  const parsed = new URL(serverUrl);

  if (parsed.protocol !== "https:" && !allowHttp) {
    console.error(
      "[Capacitor] CAP_SERVER_URL must use https:// for release builds. For local testing only, set CAP_ALLOW_HTTP=true."
    );
    process.exit(1);
  }

  console.log(`[Capacitor] Using server URL: ${serverUrl}`);
} catch {
  console.error("[Capacitor] CAP_SERVER_URL is not a valid URL.");
  process.exit(1);
}