"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useOfflineStatus } from "@/hooks/use-offline-status";
import { usePrefetchAll } from "@/hooks/use-prefetch-all";
import { CommandPalette } from "@/components/layout/command-palette";
import { TourProvider } from "@/providers/tour-provider";
import { TourOverlay } from "@/components/layout/tour-overlay";
import { RecurringProcessor } from "@/components/transactions/recurring-processor";

function AppShellInner({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  usePrefetchAll();

  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStatus();
  const prevOnlineRef = useRef(isOnline);

  // When we transition from offline → online, refetch all stale queries
  // so the UI shows fresh data as soon as connectivity is restored.
  useEffect(() => {
    const wasOffline = !prevOnlineRef.current;
    prevOnlineRef.current = isOnline;

    if (isOnline && wasOffline) {
      void queryClient.refetchQueries({ type: "active", stale: true });
    }
  }, [isOnline, queryClient]);

  return (
    <>
      {children}
      <CommandPalette />
      <TourOverlay />
      <RecurringProcessor />
    </>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <TourProvider>
      <AppShellInner>{children}</AppShellInner>
    </TourProvider>
  );
}

