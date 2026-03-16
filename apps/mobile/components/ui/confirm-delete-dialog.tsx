import React from "react";
import { View, Modal as RNModal, TouchableOpacity } from "react-native";
import { Text } from "./text";
import { Button } from "./button";
import { useTheme } from "@/lib/theme";

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void | Promise<void>;
  isPending?: boolean;
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title = "Delete item?",
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  isPending = false,
}: ConfirmDeleteDialogProps) {
  const { colors } = useTheme();

  return (
    <RNModal visible={open} transparent animationType="fade" onRequestClose={() => onOpenChange(false)}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
        activeOpacity={1}
        onPress={() => !isPending && onOpenChange(false)}
      >
        <TouchableOpacity activeOpacity={1}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              padding: 24,
              marginHorizontal: 32,
              width: 320,
              maxWidth: "90%",
            }}
          >
            <Text
              variant="h4"
              style={{ color: colors.foreground, marginBottom: 8 }}
            >
              {title}
            </Text>
            <Text
              variant="body-sm"
              style={{ color: colors.mutedForeground, marginBottom: 24, lineHeight: 20 }}
            >
              {description}
            </Text>
            <View style={{ flexDirection: "row", gap: 12, justifyContent: "flex-end" }}>
              <Button
                variant="outline"
                size="sm"
                onPress={() => onOpenChange(false)}
                disabled={isPending}
              >
                {cancelLabel}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onPress={() => void onConfirm()}
                disabled={isPending}
                loading={isPending}
              >
                {isPending ? "Deleting..." : confirmLabel}
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}
