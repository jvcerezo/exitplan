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
import { Check } from "lucide-react-native";

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

interface PasswordStrength {
  level: StrengthLevel;
  score: number;
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Uppercase letter (A-Z)", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a-z)", passed: /[a-z]/.test(password) },
    { label: "Number (0-9)", passed: /[0-9]/.test(password) },
    { label: "Special character (!@#$...)", passed: /[^A-Za-z0-9]/.test(password) },
  ];

  if (password.length === 0) {
    return { level: "empty", score: 0, label: "", color: "", checks };
  }

  const score = checks.filter((c) => c.passed).length;

  if (score <= 1) return { level: "weak", score, label: "Weak", color: "#EF4444", checks };
  if (score === 2) return { level: "fair", score, label: "Fair", color: "#F97316", checks };
  if (score === 3) return { level: "good", score, label: "Good", color: "#EAB308", checks };
  return { level: "strong", score, label: "Strong", color: "#22C55E", checks };
}

export default function SignupScreen() {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSignup() {
    setError(null);
    setSuccessEmail(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (strength.score < 3) {
      setError("Please use a stronger password (add uppercase, numbers, or special characters).");
      return;
    }
    if (!agreedToTerms) {
      setError("You must agree to the Privacy Policy and Terms of Service to create an account.");
      return;
    }

    setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName.trim() } },
    });
    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    // Check if email confirmation is needed
    if (data?.user?.identities?.length === 0 || !data?.session) {
      setSuccessEmail(email);
    }
  }

  async function handleGoogleSignup() {
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
      Alert.alert("Google Sign Up Failed", err.message || "Something went wrong");
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
              Create your account
            </Text>
            <Text
              variant="body-sm"
              style={{ color: colors.mutedForeground, marginTop: 6 }}
            >
              Free forever. No credit card required.
            </Text>
          </View>

          {/* Google OAuth */}
          <Button
            variant="outline"
            onPress={handleGoogleSignup}
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
              or sign up with email
            </Text>
            <Separator style={{ flex: 1 }} />
          </View>

          {/* Success message */}
          {successEmail && (
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#10B981" + "33",
                backgroundColor: "#10B981" + "0D",
                paddingHorizontal: 16,
                paddingVertical: 12,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 14, color: "#10B981" }}>
                Check your inbox for a confirmation link sent to{" "}
                <Text style={{ fontWeight: "600" }}>{successEmail}</Text>.
                After confirming, you'll continue to onboarding.
              </Text>
            </View>
          )}

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
              <Text style={{ fontSize: 14, color: colors.destructive }}>
                {error}
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={{ gap: 20 }}>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
            />
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Password with strength meter */}
            <View style={{ gap: 8 }}>
              <Input
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password-new"
              />
              {password.length > 0 && (
                <View style={{ gap: 8, paddingTop: 4 }}>
                  {/* Strength bars */}
                  <View style={{ flexDirection: "row", gap: 4 }}>
                    {[1, 2, 3, 4].map((bar) => (
                      <View
                        key={bar}
                        style={{
                          flex: 1,
                          height: 6,
                          borderRadius: 3,
                          backgroundColor:
                            strength.score >= bar
                              ? strength.color
                              : colors.muted,
                        }}
                      />
                    ))}
                  </View>
                  {/* Label */}
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.mutedForeground,
                      }}
                    >
                      Password strength
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: strength.color,
                      }}
                    >
                      {strength.label}
                    </Text>
                  </View>
                  {/* Checklist */}
                  <View style={{ gap: 4 }}>
                    {strength.checks.map((c) => (
                      <View
                        key={c.label}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <View
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 7,
                            backgroundColor: c.passed
                              ? "#22C55E"
                              : colors.muted,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {c.passed ? (
                            <Check size={8} color="white" strokeWidth={3} />
                          ) : (
                            <View
                              style={{
                                width: 4,
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: colors.mutedForeground,
                              }}
                            />
                          )}
                        </View>
                        <Text
                          style={{
                            fontSize: 12,
                            color: c.passed
                              ? colors.foreground
                              : colors.mutedForeground,
                          }}
                        >
                          {c.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>

            <Input
              label="Confirm Password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            {/* Terms checkbox */}
            <TouchableOpacity
              onPress={() => setAgreedToTerms((v) => !v)}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View
                style={{
                  marginTop: 2,
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  borderWidth: 1,
                  borderColor: agreedToTerms ? colors.primary : colors.input,
                  backgroundColor: agreedToTerms ? colors.primary : colors.background,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {agreedToTerms && (
                  <Check size={10} color={colors.primaryForeground} strokeWidth={3} />
                )}
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  color: colors.mutedForeground,
                  lineHeight: 18,
                }}
              >
                I have read and agree to the{" "}
                <Text style={{ fontSize: 12, color: colors.primary }}>Privacy Policy</Text>
                {" "}and{" "}
                <Text style={{ fontSize: 12, color: colors.primary }}>Terms of Service</Text>.
                I consent to ExitPlan collecting and processing my personal data
                as described.
              </Text>
            </TouchableOpacity>

            <Button
              onPress={handleSignup}
              loading={loading}
              disabled={!agreedToTerms}
              style={{ marginTop: 4 }}
            >
              {loading
                ? "Creating account..."
                : successEmail
                ? "Resend / Try again"
                : "Create Account"}
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
              Already have an account?
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(auth)/login")}
            >
              <Text
                variant="body-sm"
                style={{ color: colors.primary, fontWeight: "600" }}
              >
                Sign in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
