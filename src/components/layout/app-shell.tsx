"use client";

import type { ReactNode } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRealtimeSync } from "@/hooks/use-realtime";
import { CommandPalette } from "@/components/layout/command-palette";

export function AppShell({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  useRealtimeSync();

  return (
    <>
      {children}
      <CommandPalette />
    </>
  );
}
