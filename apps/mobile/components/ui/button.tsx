import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "default" | "destructive" | "outline" | "ghost" | "secondary" | "link";
  size?: "sm" | "md" | "lg" | "icon" | "icon-xs";
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "default",
  size = "md",
  loading = false,
  disabled,
  children,
  style,
  ...props
}: ButtonProps) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  const baseStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 12,
    opacity: isDisabled ? 0.5 : 1,
  };

  const sizeMap: Record<string, ViewStyle> = {
    sm: { height: 32, paddingHorizontal: 12, borderRadius: 10 },
    md: { height: 40, paddingHorizontal: 16 },
    lg: { height: 44, paddingHorizontal: 24 },
    icon: { height: 36, width: 36, paddingHorizontal: 0 },
    "icon-xs": { height: 24, width: 24, paddingHorizontal: 0, borderRadius: 8 },
  };

  const variantMap: Record<string, ViewStyle> = {
    default: { backgroundColor: colors.primary },
    destructive: { backgroundColor: colors.destructive },
    outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: "transparent" },
    secondary: { backgroundColor: colors.secondary },
    link: { backgroundColor: "transparent" },
  };

  const textColorMap: Record<string, string> = {
    default: colors.primaryForeground,
    destructive: "#FFFFFF",
    outline: colors.foreground,
    ghost: colors.foreground,
    secondary: colors.secondaryForeground,
    link: colors.primary,
  };

  const textSizeMap: Record<string, TextStyle> = {
    sm: { fontSize: 12 },
    md: { fontSize: 14 },
    lg: { fontSize: 15 },
    icon: { fontSize: 14 },
    "icon-xs": { fontSize: 12 },
  };

  return (
    <TouchableOpacity
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[baseStyle, sizeMap[size], variantMap[variant], style as ViewStyle]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "default" || variant === "destructive"
              ? colors.primaryForeground
              : colors.mutedForeground
          }
        />
      ) : typeof children === "string" ? (
        <Text
          style={[
            {
              fontWeight: "600",
              color: textColorMap[variant],
              textDecorationLine: variant === "link" ? "underline" : "none",
            },
            textSizeMap[size],
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
