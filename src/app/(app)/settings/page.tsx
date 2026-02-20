"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut, Loader2 } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/use-profile";
import { useExchangeRates, useUpsertExchangeRate } from "@/hooks/use-exchange-rates";
import { signOut } from "@/app/(auth)/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, DEFAULT_RATES_TO_PHP } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { theme, setTheme } = useTheme();
  const { data: exchangeRates } = useExchangeRates();
  const upsertRate = useUpsertExchangeRate();

  const [fullName, setFullName] = useState("");
  const [primaryCurrency, setPrimaryCurrency] = useState("PHP");

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.primary_currency) {
      setPrimaryCurrency(profile.primary_currency);
    }
  }, [profile?.full_name, profile?.primary_currency]);

  const handleSaveProfile = () => {
    updateProfile.mutate({ full_name: fullName });
  };

  const handleSaveCurrency = () => {
    updateProfile.mutate({ primary_currency: primaryCurrency });
  };

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Get existing user rates keyed by from_currency
  const userRates: Record<string, number> = {};
  for (const rate of exchangeRates ?? []) {
    if (rate.to_currency === primaryCurrency) {
      userRates[rate.from_currency] = rate.rate;
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Your personal information and account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile?.email ?? ""}
                  disabled
                  className="bg-muted text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Your email address cannot be changed
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input
                    id="full-name"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSaveProfile}
                    disabled={
                      updateProfile.isPending ||
                      fullName === (profile?.full_name ?? "")
                    }
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
              </div>

              {memberSince && (
                <>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    Member since {memberSince}
                  </div>
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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Primary Currency</Label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Select value={primaryCurrency} onValueChange={setPrimaryCurrency}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleSaveCurrency}
                disabled={
                  updateProfile.isPending ||
                  primaryCurrency === (profile?.primary_currency ?? "PHP")
                }
              >
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              All amounts on the dashboard will be converted to this currency
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label>Exchange Rates (to {primaryCurrency})</Label>
            <p className="text-xs text-muted-foreground">
              Set custom rates or leave blank to use defaults
            </p>
            <div className="space-y-2">
              {CURRENCIES.filter((c) => c.code !== primaryCurrency).map((c) => {
                const defaultRate =
                  (DEFAULT_RATES_TO_PHP[c.code] ?? 1) /
                  (DEFAULT_RATES_TO_PHP[primaryCurrency] ?? 1);
                const currentRate = userRates[c.code];

                return (
                  <div
                    key={c.code}
                    className="flex items-center gap-3 text-sm"
                  >
                    <span className="w-12 font-medium">{c.code}</span>
                    <span className="text-muted-foreground">=</span>
                    <Input
                      type="number"
                      step="0.0001"
                      min="0.0001"
                      placeholder={defaultRate.toFixed(4)}
                      defaultValue={currentRate ?? ""}
                      className="w-32 h-8 text-sm"
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (val && val > 0) {
                          upsertRate.mutate({
                            from_currency: c.code,
                            to_currency: primaryCurrency,
                            rate: val,
                          });
                        }
                      }}
                    />
                    <span className="text-muted-foreground">
                      {primaryCurrency}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
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
        <CardContent>
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex flex-wrap gap-3">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1 min-w-[100px]"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1 min-w-[100px]"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="flex-1 min-w-[100px]"
              >
                <Monitor className="h-4 w-4" />
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signOut}>
            <Button variant="outline" type="submit" className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
