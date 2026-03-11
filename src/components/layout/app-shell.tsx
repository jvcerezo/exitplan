"use client";

import type { ReactNode } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRealtimeSync } from "@/hooks/use-realtime";
import { CommandPalette } from "@/components/layout/command-palette";
import { TourProvider } from "@/providers/tour-provider";
import { TourOverlay } from "@/components/layout/tour-overlay";

function AppShellInner({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  useRealtimeSync();

  return (
    <>
      {children}
      <CommandPalette />
      <TourOverlay />
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
