"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const register = async () => {
      try {
        if (process.env.NODE_ENV !== "production") {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((registration) => registration.unregister()));

          if ("caches" in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map((key) => caches.delete(key)));
          }

          return;
        }

        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    };

    void register();
  }, []);

  return null;
}
