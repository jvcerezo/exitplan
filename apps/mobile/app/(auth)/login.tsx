import React, { useState } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BrandMark } from "@/components/brand-mark";
import { useTheme } from "@/lib/theme";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    }
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      const redirectTo = Linking.createURL("auth/callback");
      const { data, error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (authError) throw authError;
      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type === "success") {
          const url = result.url;
          const params = new URLSearchParams(url.split("#")[1] || url.split("?")[1] || "");
          const accessToken = params.get("access_token");
          const refreshToken = params.get("refresh_token");
          if (accessToken && refreshToken) {
            await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          }
        }
      }
    } catch (err: any) {
      Alert.alert("Google Login Failed", err.message || "Something went wrong");
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 24,
            paddingVertical: 48,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Mobile logo */}
          <View style={{ alignItems: "center", marginBottom: 40 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <BrandMark size={44} />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "700",
                  letterSpacing: -0.3,
                  color: colors.foreground,
                }}
              >
                Exit
                <Text style={{ color: colors.primary }}>Plan</Text>
              </Text>
            </View>
          </View>

          {/* Heading */}
          <View style={{ marginBottom: 32 }}>
            <Text
              variant="h2"
              style={{ color: colors.foreground, letterSpacing: -0.3 }}
            >
              Welcome back
            </Text>
            <Text
              variant="body-sm"
              style={{ color: colors.mutedForeground, marginTop: 6 }}
            >
              Sign in to continue your financial journey
            </Text>
          </View>

          {/* Google OAuth */}
          <Button
            variant="outline"
            onPress={handleGoogleLogin}
            loading={googleLoading}
            style={{ marginBottom: 16 }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.foreground,
              }}
            >
              Continue with Google
            </Text>
          </Button>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginVertical: 8,
              marginBottom: 24,
            }}
          >
            <Separator style={{ flex: 1 }} />
            <Text
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                color: colors.mutedForeground,
              }}
            >
              or continue with email
            </Text>
            <Separator style={{ flex: 1 }} />
          </View>

          {/* Error */}
          {error && (
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.destructive + "33",
                backgroundColor: colors.destructive + "0D",
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{ fontSize: 14, color: colors.destructive }}
              >
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={{ gap: 20 }}>
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Input
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
            <Button
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: 4 }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </View>

          {/* Footer */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              marginTop: 24,
              gap: 4,
            }}
          >
            <Text
              variant="body-sm"
              style={{ color: colors.mutedForeground }}
            >
              Don't have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text
                variant="body-sm"
                style={{ color: colors.primary, fontWeight: "600" }}
              >
                Create one free
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
