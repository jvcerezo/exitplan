import React from "react";
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text } from "./text";
import { useTheme } from "@/lib/theme";
import { X } from "lucide-react-native";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export function Modal({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
}: ModalProps) {
  const { colors } = useTheme();

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            maxHeight: "90%",
          }}
        >
          {(title || showCloseButton) && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 16,
                paddingTop: 16,
                paddingBottom: 8,
              }}
            >
              {title ? (
                <Text variant="h4" style={{ color: colors.foreground }}>
                  {title}
                </Text>
              ) : (
                <View />
              )}
              {showCloseButton && (
                <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
                  <X size={20} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>
          )}
          <ScrollView
            style={{ paddingHorizontal: 16, paddingBottom: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </RNModal>
  );
}
