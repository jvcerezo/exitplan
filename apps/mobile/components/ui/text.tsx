import React from "react";
import { Text as RNText, TextProps, TextStyle } from "react-native";
import { useTheme } from "@/lib/theme";

interface TypedTextProps extends TextProps {
  variant?: "h1" | "h2" | "h3" | "h4" | "body" | "body-sm" | "caption" | "label" | "section-label";
  color?: "default" | "muted" | "primary" | "destructive" | "success" | "inherit";
}

const variantStyles: Record<string, TextStyle> = {
  h1: { fontSize: 30, fontWeight: "bold", letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: "bold", letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: "600" },
  h4: { fontSize: 18, fontWeight: "600" },
  body: { fontSize: 16 },
  "body-sm": { fontSize: 14 },
  caption: { fontSize: 12 },
  label: { fontSize: 14, fontWeight: "500" },
  "section-label": { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },
};

export function Text({
  variant = "body",
  color = "default",
  style,
  ...props
}: TypedTextProps) {
  const { colors } = useTheme();

  const colorMap: Record<string, string> = {
    default: colors.foreground,
    muted: colors.mutedForeground,
    primary: colors.primary,
    destructive: colors.destructive,
    success: colors.green600,
    inherit: "inherit",
  };

  const textColor = color === "inherit" ? undefined : colorMap[color] ?? colors.foreground;

  return (
    <RNText
      style={[
        variantStyles[variant] ?? variantStyles.body,
        textColor ? { color: textColor } : undefined,
        style,
      ]}
      {...props}
    />
  );
}
