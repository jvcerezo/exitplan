"use client";

import type { ReactNode } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useRealtimeSync } from "@/hooks/use-realtime";

export function AppShell({ children }: { children: ReactNode }) {
  useKeyboardShortcuts();
  useRealtimeSync();

  return <>{children}</>;
}
