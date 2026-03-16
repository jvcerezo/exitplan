import React, { useState } from "react";
import { TextInput, TextInputProps, View, TouchableOpacity } from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";
import { Eye, EyeOff } from "lucide-react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, secureTextEntry, ...props }: InputProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry !== undefined;

  return (
    <View style={{ gap: 4 }}>
      {label ? (
        <Text variant="label" style={{ color: colors.foreground }}>
          {label}
        </Text>
      ) : null}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: 40,
          borderWidth: 1,
          borderColor: error ? colors.destructive : focused ? colors.primary : colors.input,
          borderRadius: 10,
          backgroundColor: colors.card,
          paddingHorizontal: 12,
        }}
      >
        <TextInput
          style={[
            {
              flex: 1,
              fontSize: 15,
              color: colors.foreground,
              height: "100%",
              padding: 0,
            },
            style,
          ]}
          placeholderTextColor={colors.mutedForeground}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={18} color={colors.mutedForeground} />
            ) : (
              <Eye size={18} color={colors.mutedForeground} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error ? (
        <Text variant="caption" color="destructive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
