import React from "react";
import { View, TouchableOpacity, Text, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { BrandMark } from "@/components/brand-mark";
import { Menu, Search } from "lucide-react-native";

interface HeaderBarProps {
  onMenuPress: () => void;
  onSearchPress?: () => void;
}

export function HeaderBar({ onMenuPress, onSearchPress }: HeaderBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingTop: insets.top,
        borderBottomWidth: 1,
        borderBottomColor: colors.border + "CC",
        backgroundColor: colors.background + "F2",
      }}
    >
      <View
        style={{
          height: 48,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
        }}
      >
        {/* Hamburger menu */}
        <TouchableOpacity
          onPress={onMenuPress}
          style={{
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          }}
          activeOpacity={0.6}
        >
          <Menu size={20} color={colors.foreground} />
        </TouchableOpacity>

        {/* Center brand */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <BrandMark size={28} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              letterSpacing: -0.3,
              color: colors.foreground,
            }}
          >
            Exit
            <Text style={{ color: colors.primary }}>Plan</Text>
          </Text>
        </View>

        {/* Search */}
        <TouchableOpacity
          onPress={onSearchPress ?? (() => Alert.alert("Search", "Search coming soon"))}
          style={{
            height: 40,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 12,
          }}
          activeOpacity={0.6}
        >
          <Search size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
