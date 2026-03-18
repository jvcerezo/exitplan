"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

/**
 * Detects if running inside a Capacitor native app.
 * Uses dynamic import to avoid breaking on web.
 */
async function isNativeApp(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * On native: opens the OAuth URL in an in-app browser,
 * listens for the redirect back, then extracts the session.
 */
async function handleNativeOAuth(authUrl: string, redirectUrl: string): Promise<boolean> {
  try {
    const { Browser } = await import("@capacitor/browser");
    const { App } = await import("@capacitor/app");
    const supabase = createClient();

    return new Promise<boolean>(async (resolve) => {
      let resolved = false;

      // Listen for the app being resumed via deep link or URL change
      const cleanup = await App.addListener("appUrlOpen", async ({ url }) => {
        if (resolved) return;
        if (url.includes("auth/callback") || url.includes("code=")) {
          resolved = true;
          await Browser.close();
          cleanup.remove();
          browserCleanup.remove();

          // Extract the code from the URL and exchange it
          const urlObj = new URL(url);
          const code = urlObj.searchParams.get("code");

          if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            resolve(!error);
          } else {
            // Try hash-based token (implicit flow)
            const hashParams = new URLSearchParams(url.split("#")[1] ?? "");
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");

            if (accessToken) {
              const { error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken ?? "",
              });
              resolve(!error);
            } else {
              resolve(false);
            }
          }
        }
      });

      // Also listen for browser finished (user cancelled)
      const browserCleanup = await Browser.addListener("browserFinished", () => {
        if (resolved) return;
        resolved = true;
        browserCleanup.remove();
        cleanup.remove();
        resolve(false);
      });

      // Open the OAuth URL in the in-app browser
      Browser.open({
        url: authUrl,
        presentationStyle: "popover",
        windowName: "_self",
      });
    });
  } catch {
    return false;
  }
}

export function GoogleSignInButton({ next }: { next: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const isNative = await isNativeApp();
    const supabase = createClient();

    // Determine the redirect URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    const redirectTo = `${siteUrl}/auth/callback?next=${encodeURIComponent(next)}`;

    if (isNative) {
      // Native: use skipBrowserRedirect, then open in in-app browser
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (error || !data.url) {
        setLoading(false);
        return;
      }

      const success = await handleNativeOAuth(data.url, redirectTo);
      if (success) {
        // Auth succeeded — navigate to the next page
        window.location.href = next;
      } else {
        setLoading(false);
      }
    } else {
      // Web: normal redirect flow
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (error) {
        setLoading(false);
      }
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-3"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      Continue with Google
    </Button>
  );
}
