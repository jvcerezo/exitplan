import React, { useState } from "react";
import { View, TouchableOpacity, Modal, FlatList } from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";
import { ChevronDown, Check } from "lucide-react-native";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
}

export function Select({
  value,
  onValueChange,
  options,
  placeholder = "Select...",
  label,
}: SelectProps) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={{ gap: 4 }}>
      {label ? (
        <Text variant="label" style={{ color: colors.foreground }}>
          {label}
        </Text>
      ) : null}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={{
          height: 40,
          borderWidth: 1,
          borderColor: colors.input,
          borderRadius: 10,
          paddingHorizontal: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: colors.card,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: selected ? colors.foreground : colors.mutedForeground,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <ChevronDown size={16} color={colors.mutedForeground} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          onPress={() => setOpen(false)}
        />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: 384,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text variant="h4" style={{ color: colors.foreground }}>
              {label ?? "Select an option"}
            </Text>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border + "20",
                }}
                onPress={() => {
                  onValueChange(item.value);
                  setOpen(false);
                }}
              >
                <Text style={{ flex: 1, color: colors.foreground, fontSize: 15 }}>
                  {item.label}
                </Text>
                {value === item.value && (
                  <Check size={16} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}
