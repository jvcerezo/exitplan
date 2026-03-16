import React from "react";
import { View } from "react-native";
import { useTheme } from "@/lib/theme";

interface LoadingSkeletonProps {
  count?: number;
  height?: number;
}

export function LoadingSkeleton({
  count = 3,
  height = 20,
}: LoadingSkeletonProps) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.muted,
            borderRadius: 10,
            height,
          }}
        />
      ))}
    </View>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  const { colors } = useTheme();

  return (
    <View style={{ gap: 12 }}>
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.muted,
            borderRadius: 10,
            height: 96,
          }}
        />
      ))}
    </View>
  );
}
