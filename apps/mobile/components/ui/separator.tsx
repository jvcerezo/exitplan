import React from "react";
import { View, ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";

interface SeparatorProps {
  style?: ViewStyle;
  orientation?: "horizontal" | "vertical";
}

export function Separator({ style, orientation = "horizontal" }: SeparatorProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.border,
          ...(orientation === "horizontal"
            ? { height: 1, width: "100%" }
            : { width: 1, height: "100%" }),
        },
        style,
      ]}
    />
  );
}
