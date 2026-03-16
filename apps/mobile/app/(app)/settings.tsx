import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { Text } from "@/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/lib/theme";
import { CURRENCIES } from "@exitplan/core";
import {
  LogOut,
  Sun,
  Moon,
  Monitor,
  Download,
  ExternalLink,
  ShieldAlert,
} from "lucide-react-native";

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const queryClient = useQueryClient();
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [refreshing, setRefreshing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [primaryCurrency, setPrimaryCurrency] = useState("PHP");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (profile?.full_name) setFullName(profile.full_name);
    if (profile?.primary_currency) setPrimaryCurrency(profile.primary_currency);
  }, [profile?.full_name, profile?.primary_currency]);

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  async function onRefresh() {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["profile"] });
    setRefreshing(false);
  }

  function handleSaveProfile() {
    updateProfile.mutate({ full_name: fullName });
  }

  function handleSaveCurrency() {
    updateProfile.mutate({ primary_currency: primaryCurrency });
  }

  async function handleSignOut() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut();
          queryClient.clear();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  async function handleDeleteAccount() {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeletingAccount(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").delete().eq("id", user.id);
      }
      await supabase.auth.signOut();
      queryClient.clear();
      router.replace("/(auth)/login");
    } catch {
      Alert.alert(
        "Error",
        "Failed to delete account. Please try from the web app or contact support."
      );
      setIsDeletingAccount(false);
    }
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      contentContainerStyle={{ paddingBottom: 150 }}
    >
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
        }}
      >
        <Text
          variant="h2"
          style={{ color: colors.foreground, letterSpacing: -0.3 }}
        >
          Settings
        </Text>
        <Text
          variant="body-sm"
          style={{ color: colors.mutedForeground, marginTop: 2 }}
        >
          Manage your account and preferences
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, gap: 24, marginTop: 8 }}>
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 16 }}>
            {isLoading ? (
              <ActivityIndicator
                size="large"
                color={colors.mutedForeground}
                style={{ paddingVertical: 32 }}
              />
            ) : (
              <>
                {/* Avatar + info */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 20,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 40,
                      overflow: "hidden",
                      backgroundColor: colors.primary + "1A",
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 2,
                      borderColor: colors.border,
                    }}
                  >
                    {profile?.avatar_url ? (
                      <Image
                        source={{ uri: profile.avatar_url }}
                        style={{ width: 80, height: 80 }}
                      />
                    ) : (
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "700",
                          color: colors.primary,
                        }}
                      >
                        {initials}
                      </Text>
                    )}
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: colors.foreground,
                      }}
                    >
                      {profile?.full_name || "No name set"}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.mutedForeground,
                      }}
                    >
                      {profile?.email}
                    </Text>
                  </View>
                </View>

                <Separator />

                {/* Email (read-only) */}
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: colors.foreground,
                    }}
                  >
                    Email
                  </Text>
                  <View
                    style={{
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: colors.muted,
                      paddingHorizontal: 12,
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.mutedForeground,
                      }}
                    >
                      {profile?.email ?? ""}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.mutedForeground,
                    }}
                  >
                    Your email address cannot be changed
                  </Text>
                </View>

                <Separator />

                {/* Full Name */}
                <View style={{ gap: 4 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "500",
                      color: colors.foreground,
                    }}
                  >
                    Full Name
                  </Text>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Input
                        placeholder="Enter your full name"
                        value={fullName}
                        onChangeText={setFullName}
                      />
                    </View>
                    <Button
                      onPress={handleSaveProfile}
                      disabled={
                        updateProfile.isPending ||
                        fullName === (profile?.full_name ?? "")
                      }
                      loading={updateProfile.isPending}
                    >
                      Save
                    </Button>
                  </View>
                </View>

                {memberSince && (
                  <>
                    <Separator />
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.mutedForeground,
                      }}
                    >
                      Member since {memberSince}
                    </Text>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Currency Section */}
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Set your primary currency and manage exchange rates
            </CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.foreground,
              }}
            >
              Primary Currency
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Select
                  value={primaryCurrency}
                  onValueChange={setPrimaryCurrency}
                  options={CURRENCIES.map((c) => ({
                    value: c.code,
                    label: `${c.symbol} ${c.name} (${c.code})`,
                  }))}
                />
              </View>
              <Button
                onPress={handleSaveCurrency}
                disabled={
                  updateProfile.isPending ||
                  primaryCurrency === (profile?.primary_currency ?? "PHP")
                }
              >
                Save
              </Button>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: colors.mutedForeground,
              }}
            >
              All amounts on the dashboard will be converted to this currency
            </Text>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how ExitPlan looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "500",
                color: colors.foreground,
              }}
            >
              Theme
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 12,
              }}
            >
              {([
                { key: "light" as const, label: "Light", Icon: Sun },
                { key: "dark" as const, label: "Dark", Icon: Moon },
                { key: "system" as const, label: "System", Icon: Monitor },
              ]).map(({ key, label, Icon }) => {
                const isActive = mode === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setMode(key)}
                    activeOpacity={0.7}
                    style={{
                      flex: 1,
                      height: 40,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isActive ? colors.primary : colors.border,
                      backgroundColor: isActive ? colors.primary : "transparent",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                    }}
                  >
                    <Icon
                      size={16}
                      color={isActive ? colors.primaryForeground : colors.foreground}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: isActive
                          ? colors.primaryForeground
                          : colors.foreground,
                      }}
                    >
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings</CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 12 }}>
            <Button
              variant="outline"
              onPress={handleSignOut}
              style={{
                borderColor: colors.destructive + "4D",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <LogOut size={16} color={colors.destructive} />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.destructive,
                  }}
                >
                  Sign Out
                </Text>
              </View>
            </Button>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Your data rights and export options
            </CardDescription>
          </CardHeader>
          <CardContent style={{ gap: 16 }}>
            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.foreground,
                }}
              >
                Export Your Data
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.mutedForeground,
                }}
              >
                Download a full copy of all your data in JSON format.
              </Text>
              <Button
                variant="outline"
                size="sm"
                style={{ marginTop: 8, alignSelf: "flex-start" }}
                onPress={() =>
                  Alert.alert(
                    "Export Data",
                    "Data export is available on the web app."
                  )
                }
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Download size={14} color={colors.foreground} />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: colors.foreground,
                    }}
                  >
                    Download My Data
                  </Text>
                </View>
              </Button>
            </View>

            <Separator />

            <View style={{ gap: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.foreground,
                }}
              >
                Legal Documents
              </Text>
              <View style={{ gap: 6, marginTop: 4 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ExternalLink size={12} color={colors.primary} />
                  <Text
                    style={{ fontSize: 12, color: colors.primary }}
                  >
                    Privacy Policy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <ExternalLink size={12} color={colors.primary} />
                  <Text
                    style={{ fontSize: 12, color: colors.primary }}
                  >
                    Terms of Service
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card
          style={{
            borderColor: colors.destructive + "66",
          }}
        >
          <CardHeader>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <ShieldAlert size={20} color={colors.destructive} />
              <CardTitle
                style={{ color: colors.destructive, fontSize: 16 }}
              >
                Danger Zone
              </CardTitle>
            </View>
            <CardDescription>
              Permanent and irreversible actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View
              style={{
                borderRadius: 10,
                borderWidth: 1,
                borderColor: colors.destructive + "4D",
                backgroundColor: colors.destructive + "0D",
                padding: 16,
                gap: 12,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.destructive,
                  }}
                >
                  Delete Account
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.mutedForeground,
                    marginTop: 4,
                    lineHeight: 18,
                  }}
                >
                  Permanently deletes your account and all associated data.
                  This cannot be undone.
                </Text>
              </View>
              <View style={{ gap: 8 }}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.mutedForeground,
                  }}
                >
                  Type{" "}
                  <Text
                    style={{
                      fontWeight: "700",
                      fontFamily: "monospace",
                      color: colors.foreground,
                    }}
                  >
                    DELETE
                  </Text>{" "}
                  to confirm
                </Text>
                <TextInput
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChangeText={setDeleteConfirmText}
                  autoCapitalize="characters"
                  style={{
                    height: 40,
                    width: 200,
                    borderWidth: 1,
                    borderColor: colors.input,
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    fontSize: 14,
                    fontFamily: "monospace",
                    color: colors.foreground,
                    backgroundColor: colors.background,
                  }}
                  placeholderTextColor={colors.mutedForeground}
                />
              </View>
              <Button
                variant="destructive"
                size="sm"
                style={{ alignSelf: "flex-start" }}
                disabled={
                  deleteConfirmText !== "DELETE" || isDeletingAccount
                }
                loading={isDeletingAccount}
                onPress={handleDeleteAccount}
              >
                Delete My Account Permanently
              </Button>
            </View>
          </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
