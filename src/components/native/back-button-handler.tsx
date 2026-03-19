"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { App } from "@capacitor/app";
import { Capacitor } from "@capacitor/core";
import { createClient } from "@/lib/supabase/client";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function BackButtonHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hardware back button (Android)
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        router.back();
      } else {
        App.exitApp();
      }
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [router]);

  // App resume → refresh session first, then validate.
  // refreshSession() gets a new access token using the refresh token,
  // so the middleware won't see an expired session and redirect externally.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener("appStateChange", async ({ isActive }) => {
      const supabase = createClient();

      if (isActive) {
        // App foregrounded — try to refresh the session silently
        const { error } = await supabase.auth.refreshSession();

        if (error && !isPublicRoute(pathname)) {
          // Refresh failed (e.g., refresh token also expired) → go to login
          router.replace("/login");
        }
      }
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [router, pathname]);

  // Periodic silent token refresh every 10 minutes on native platforms.
  // Supabase access tokens expire after 1 hour by default.
  // Refreshing proactively prevents the middleware from ever seeing an expired token.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    refreshIntervalRef.current = setInterval(async () => {
      const supabase = createClient();
      await supabase.auth.refreshSession();
    }, 10 * 60 * 1000); // every 10 minutes

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return null;
}
