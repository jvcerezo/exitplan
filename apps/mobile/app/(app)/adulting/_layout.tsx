import { Stack } from "expo-router";
import { useTheme } from "@/lib/theme";

export default function AdultingLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="bills" />
      <Stack.Screen name="debts" />
      <Stack.Screen name="contributions" />
      <Stack.Screen name="taxes" />
      <Stack.Screen name="insurance" />
      <Stack.Screen name="checklist" />
      <Stack.Screen name="thirteenth-month" />
      <Stack.Screen name="calculators" />
    </Stack>
  );
}
