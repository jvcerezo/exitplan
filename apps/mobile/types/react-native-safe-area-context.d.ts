// Fix for SafeAreaView JSX component type error caused by React 18 type mismatch
// between react-native-safe-area-context and @types/react versions.
// This does not affect runtime behavior.
import "react-native-safe-area-context";

declare module "react-native-safe-area-context" {
  import type { ComponentType } from "react";
  import type { ViewProps } from "react-native";

  interface EdgeInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  type Edge = "top" | "right" | "bottom" | "left";

  interface SafeAreaViewProps extends ViewProps {
    edges?: Edge[];
    mode?: "padding" | "margin";
  }

  export const SafeAreaView: ComponentType<SafeAreaViewProps>;
  export const SafeAreaProvider: ComponentType<ViewProps & { initialMetrics?: any }>;
  export function useSafeAreaInsets(): EdgeInsets;
  export function useSafeAreaFrame(): { x: number; y: number; width: number; height: number };
}
