import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/lib/theme";
import { router } from "expo-router";
import { ChevronLeft } from "lucide-react-native";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({
  title,
  subtitle,
  showBack = false,
  rightAction,
}: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      {showBack && (
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 12, padding: 4, marginLeft: -4 }}
        >
          <ChevronLeft size={24} color={colors.foreground} />
        </TouchableOpacity>
      )}
      <View style={{ flex: 1 }}>
        <Text variant="h3" style={{ color: colors.foreground }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );
}
