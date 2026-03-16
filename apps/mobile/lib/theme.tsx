import React, { createContext, useContext, useState } from "react";
import { useColorScheme } from "react-native";

// Exact OKLCH → hex conversions from web globals.css
const light = {
  background: "#FCFEFD",     // oklch(0.995 0.002 155)
  foreground: "#0A110D",     // oklch(0.17 0.015 160)
  card: "#FFFFFF",           // oklch(1 0 0)
  cardForeground: "#0A110D",
  primary: "#00884B",        // oklch(0.55 0.14 155)
  primaryForeground: "#F5FCF7", // oklch(0.985 0.01 155)
  secondary: "#E4F5E9",     // oklch(0.955 0.025 155)
  secondaryForeground: "#1A3322",
  muted: "#EFF5F1",         // oklch(0.965 0.008 155)
  mutedForeground: "#5B675E", // oklch(0.50 0.02 155)
  accent: "#DAF3E1",        // oklch(0.94 0.035 155)
  accentForeground: "#152E1D",
  destructive: "#E7000B",   // oklch(0.577 0.245 27.325)
  border: "#DAE4DD",        // oklch(0.91 0.015 155)
  input: "#DAE4DD",
  ring: "#00884B",
  // Utility colors
  green400: "#4ADE80",
  green500: "#22C55E",
  green600: "#16A34A",
  yellow400: "#FACC15",
  yellow500: "#EAB308",
  yellow600: "#CA8A04",
  red400: "#F87171",
  red500: "#EF4444",
  orange500: "#F97316",
  emerald400: "#34D399",
  emerald500: "#10B981",
  emerald700: "#047857",
  blue500: "#3B82F6",
  indigo500: "#6366F1",
  teal500: "#14B8A6",
  purple500: "#A855F7",
};

const dark = {
  background: "#050B07",     // oklch(0.14 0.015 160)
  foreground: "#F3F6F4",     // oklch(0.97 0.005 155)
  card: "#0E1611",           // oklch(0.19 0.015 160)
  cardForeground: "#F3F6F4",
  primary: "#04AB62",        // oklch(0.65 0.16 155)
  primaryForeground: "#010804", // oklch(0.12 0.02 160)
  secondary: "#17221C",     // oklch(0.24 0.02 160)
  secondaryForeground: "#F3F6F4",
  muted: "#17221C",         // oklch(0.24 0.02 160)
  mutedForeground: "#88928B", // oklch(0.65 0.015 155)
  accent: "#223227",        // oklch(0.30 0.03 155)
  accentForeground: "#F3F6F4",
  destructive: "#FF6467",   // oklch(0.704 0.191 22.216)
  border: "rgba(255,255,255,0.10)", // oklch(1 0 0 / 10%)
  input: "rgba(255,255,255,0.15)",  // oklch(1 0 0 / 15%)
  ring: "#04AB62",
  // Utility colors
  green400: "#4ADE80",
  green500: "#22C55E",
  green600: "#04AB62",
  yellow400: "#FACC15",
  yellow500: "#EAB308",
  yellow600: "#CA8A04",
  red400: "#F87171",
  red500: "#EF4444",
  orange500: "#F97316",
  emerald400: "#34D399",
  emerald500: "#10B981",
  emerald700: "#34D399",
  blue500: "#3B82F6",
  indigo500: "#818CF8",
  teal500: "#2DD4BF",
  purple500: "#C084FC",
};

export type ThemeColors = typeof light;
type ThemeMode = "system" | "light" | "dark";

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: dark,
  isDark: true,
  mode: "dark",
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>("dark");

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? dark : light;

  return (
    <ThemeContext.Provider value={{ colors, isDark, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
