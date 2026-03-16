import React from "react";
import { View, ViewProps, ViewStyle, Platform, TextStyle } from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.border,
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            },
            android: {
              elevation: 1,
            },
          }),
        } as ViewStyle,
        style as ViewStyle,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, style, ...props }: CardProps) {
  return (
    <View
      style={[{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }, style as ViewStyle]}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardTitle({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  const { colors } = useTheme();
  return (
    <Text
      variant="body-sm"
      style={[{ fontWeight: "600", color: colors.cardForeground }, style]}
    >
      {children}
    </Text>
  );
}

export function CardDescription({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: TextStyle;
}) {
  const { colors } = useTheme();
  return (
    <Text
      variant="caption"
      style={[{ color: colors.mutedForeground, marginTop: 2 }, style]}
    >
      {children}
    </Text>
  );
}

export function CardContent({ children, style, ...props }: CardProps) {
  return (
    <View
      style={[{ paddingHorizontal: 16, paddingBottom: 16 }, style as ViewStyle]}
      {...props}
    >
      {children}
    </View>
  );
}
