import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Image,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { usePathname, router } from "expo-router";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { BrandMark } from "@/components/brand-mark";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Target,
  Calculator,
  GraduationCap,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react-native";

const DRAWER_WIDTH = 288;
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const navItems = [
  { href: "/(app)/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/(app)/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/(app)/accounts", label: "Accounts", icon: Wallet },
  { href: "/(app)/goals", label: "Goals", icon: Target },
  { href: "/(app)/budgets", label: "Budgets", icon: Calculator },
  { href: "/(app)/adulting", label: "Adulting Hub", icon: GraduationCap },
  { href: "/(app)/settings", label: "Settings", icon: Settings },
];

interface DrawerProps {
  open: boolean;
  onClose: () => void;
}

export function Drawer({ open, onClose }: DrawerProps) {
  const { colors, isDark, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { data: profile } = useProfile();
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [open]);

  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleNav(href: string) {
    onClose();
    setTimeout(() => {
      router.push(href as any);
    }, 100);
  }

  async function handleSignOut() {
    onClose();
    await supabase.auth.signOut();
    router.replace("/(auth)/login");
  }

  if (!open) return null;

  return (
    <Modal transparent visible={open} animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: backdropOpacity,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: DRAWER_WIDTH,
          backgroundColor: colors.card,
          borderRightWidth: 1,
          borderRightColor: colors.border + "99",
          transform: [{ translateX }],
        }}
      >
        {/* Brand header */}
        <View
          style={{
            height: 56,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border + "99",
            marginTop: insets.top,
          }}
        >
          <TouchableOpacity
            onPress={() => handleNav("/(app)/dashboard")}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <BrandMark size={32} />
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                letterSpacing: -0.3,
                color: colors.foreground,
              }}
            >
              Exit
              <Text style={{ color: colors.primary }}>Plan</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Nav items */}
        <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12, gap: 2 }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href.replace("/(app)", ""));
            const Icon = item.icon;
            return (
              <TouchableOpacity
                key={item.href}
                onPress={() => handleNav(item.href)}
                activeOpacity={0.6}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor: isActive ? colors.primary + "1A" : "transparent",
                }}
              >
                <Icon
                  size={20}
                  color={isActive ? colors.primary : colors.foreground + "B3"}
                />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: isActive ? colors.primary : colors.foreground + "B3",
                  }}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border + "99",
            paddingHorizontal: 12,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            gap: 4,
          }}
        >
          {/* User profile */}
          {profile && (
            <TouchableOpacity
              onPress={() => handleNav("/(app)/settings")}
              activeOpacity={0.6}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                borderRadius: 12,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 4,
              }}
            >
              <View
                style={{
                  height: 32,
                  width: 32,
                  borderRadius: 16,
                  overflow: "hidden",
                  backgroundColor: colors.primary + "1A",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                {profile.avatar_url ? (
                  <Image
                    source={{ uri: profile.avatar_url }}
                    style={{ width: 32, height: 32 }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.primary,
                    }}
                  >
                    {initials}
                  </Text>
                )}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.foreground,
                  }}
                >
                  {profile.full_name || profile.email || "Account"}
                </Text>
                {profile.full_name && (
                  <Text
                    numberOfLines={1}
                    style={{
                      fontSize: 12,
                      color: colors.mutedForeground,
                    }}
                  >
                    {profile.email}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}

          {/* Theme toggle row */}
          <TouchableOpacity
            onPress={() => setMode(isDark ? "light" : "dark")}
            activeOpacity={0.6}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: 12,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                textTransform: "uppercase",
                letterSpacing: 1,
                color: colors.mutedForeground,
              }}
            >
              Theme
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {isDark ? (
                <Moon size={16} color={colors.mutedForeground} />
              ) : (
                <Sun size={16} color={colors.mutedForeground} />
              )}
              <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                {isDark ? "Dark" : "Light"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign out */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.6}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          >
            <LogOut size={20} color={colors.foreground + "B3"} />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "500",
                color: colors.foreground + "B3",
              }}
            >
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}
