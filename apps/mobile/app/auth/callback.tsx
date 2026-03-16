import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Text } from "@/components/ui/text";
import { useTheme } from "@/lib/theme";

export default function AuthCallbackScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams();

  useEffect(() => {
    async function handleCallback() {
      try {
        const accessToken = params.access_token as string | undefined;
        const refreshToken = params.refresh_token as string | undefined;

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            console.error("Auth callback error:", error.message);
            router.replace("/(auth)/login");
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("has_completed_onboarding")
            .eq("id", session.user.id)
            .single();

          if (profile && !profile.has_completed_onboarding) {
            router.replace("/(auth)/onboarding");
          } else {
            router.replace("/(app)/dashboard");
          }
        } else {
          router.replace("/(auth)/login");
        }
      } catch {
        router.replace("/(auth)/login");
      }
    }

    handleCallback();
  }, [params]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text variant="body-sm" style={{ color: colors.mutedForeground, marginTop: 16 }}>
        Signing you in...
      </Text>
    </View>
  );
}
