import { useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme";
import { HeaderBar } from "@/components/layout/header-bar";
import { Drawer } from "@/components/layout/drawer";
import { FAB } from "@/components/layout/fab";

export default function AppLayout() {
  const { colors } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const screenOptions = {
    headerShown: false as const,
    contentStyle: { backgroundColor: colors.background },
    animation: "fade" as const,
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Top header bar */}
      <HeaderBar
        onMenuPress={() => setDrawerOpen(true)}
      />

      {/* Stack navigator — no native header */}
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="transactions" />
        <Stack.Screen name="accounts" />
        <Stack.Screen name="goals" />
        <Stack.Screen name="budgets" />
        <Stack.Screen name="adulting" />
        <Stack.Screen name="settings" />
      </Stack>

      {/* Context-aware FAB */}
      <FAB />

      {/* Slide-out drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}
