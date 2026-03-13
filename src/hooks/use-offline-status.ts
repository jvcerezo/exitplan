"use client";

import { useEffect, useState } from "react";

/**
 * Reliable connectivity detection that works on both web and Capacitor native.
 *
 * - Web: uses navigator.onLine + online/offline events
 * - Capacitor (iOS/Android): uses @capacitor/network which listens to the
 *   native network stack — far more reliable than navigator.onLine on mobile
 *   (avoids false-positives on captive portals or cellular with no data).
 */
export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let unlisten: (() => void) | undefined;

    async function init() {
      try {
        // Capacitor is available when running as a native app
        const { Network } = await import("@capacitor/network");

        // Get current status immediately
        const status = await Network.getStatus();
        setIsOnline(status.connected);

        // Listen for native network changes
        const handle = await Network.addListener("networkStatusChange", (s) => {
          setIsOnline(s.connected);
        });

        unlisten = () => handle.remove();
      } catch {
        // Capacitor not available (plain browser) — fall back to navigator.onLine
        const update = () => setIsOnline(navigator.onLine);
        update();
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        unlisten = () => {
          window.removeEventListener("online", update);
          window.removeEventListener("offline", update);
        };
      }
    }

    void init();
    return () => unlisten?.();
  }, []);

  return { isOnline, isOffline: !isOnline };
}

