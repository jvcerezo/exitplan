"use client";

import { useEffect } from "react";
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

  // App resume → check session validity, redirect to /login if expired.
  // This runs client-side (in-WebView navigation) so the server-side
  // middleware redirect — which can open the system browser on Capacitor —
  // is never reached.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener("appStateChange", async ({ isActive }) => {
      if (!isActive) return;
      if (isPublicRoute(pathname)) return;

      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      }
    });

    return () => {
      listener.then((handle) => handle.remove());
    };
  }, [router, pathname]);

  return null;
}
