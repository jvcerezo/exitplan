import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useTheme } from "@/lib/theme";

interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  compact = false,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        gap: 4,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border + "99",
        backgroundColor: colors.background + "66",
        padding: 4,
      }}
    >
      {options.map((option) => {
        const isActive = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              paddingVertical: compact ? 8 : 8,
              paddingHorizontal: compact ? 8 : 12,
              ...(isActive
                ? {
                    backgroundColor: colors.primary + "26",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 1,
                    borderWidth: 1,
                    borderColor: colors.primary + "40",
                  }
                : {
                    borderWidth: 1,
                    borderColor: "transparent",
                  }),
            }}
          >
            <Text
              style={{
                fontSize: compact ? 11 : 12,
                fontWeight: "600",
                color: isActive ? colors.foreground : colors.mutedForeground,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
