import React from "react";
import { View } from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 64,
        paddingHorizontal: 24,
      }}
    >
      {icon && (
        <View
          style={{
            marginBottom: 16,
            height: 56,
            width: 56,
            borderRadius: 16,
            backgroundColor: colors.primary + "1A",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </View>
      )}
      <Text
        variant="h4"
        style={{
          textAlign: "center",
          color: colors.foreground,
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      <Text
        variant="body-sm"
        style={{
          textAlign: "center",
          color: colors.mutedForeground,
          maxWidth: 300,
        }}
      >
        {description}
      </Text>
      {action && <View style={{ marginTop: 24 }}>{action}</View>}
    </View>
  );
}
