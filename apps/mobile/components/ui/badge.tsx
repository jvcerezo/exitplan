import React from "react";
import { View, ViewStyle } from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive" | "outline" | "secondary";
  style?: ViewStyle;
  className?: string;
}

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const { colors } = useTheme();

  const variantStyles: Record<string, { bg: string; text: string; borderColor?: string }> = {
    default: { bg: colors.accent, text: colors.primary },
    success: { bg: "#DCFCE7", text: colors.emerald700 },
    warning: { bg: "#FEF9C3", text: colors.yellow600 },
    destructive: { bg: "#FEE2E2", text: colors.destructive },
    outline: { bg: "transparent", text: colors.foreground, borderColor: colors.border },
    secondary: { bg: colors.secondary, text: colors.secondaryForeground },
  };

  const v = variantStyles[variant] ?? variantStyles.default;

  return (
    <View
      style={[
        {
          borderRadius: 999,
          paddingHorizontal: 8,
          paddingVertical: 2,
          alignSelf: "flex-start",
          backgroundColor: v.bg,
          ...(v.borderColor ? { borderWidth: 1, borderColor: v.borderColor } : {}),
        },
        style,
      ]}
    >
      <Text
        variant="caption"
        style={{ fontWeight: "500", color: v.text }}
      >
        {children}
      </Text>
    </View>
  );
}
