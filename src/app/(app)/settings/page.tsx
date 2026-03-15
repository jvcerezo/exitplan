"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut, Loader2, RefreshCw, Map, Camera, X, Bug, Send } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar, useRemoveAvatar } from "@/hooks/use-profile";
import { useExchangeRates, useUpsertExchangeRate } from "@/hooks/use-exchange-rates";
import { useMarketRates } from "@/hooks/use-market-rates";
import { useMyBugReports, useSubmitBugReport } from "@/hooks/use-bug-reports";
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
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CURRENCIES, DEFAULT_RATES_TO_PHP } from "@/lib/constants";
import { useTourContext } from "@/providers/tour-provider";
import { OfflineSyncCenter } from "@/components/offline/offline-sync-center";
import type { BugReportSeverity } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const removeAvatar = useRemoveAvatar();
  const { theme, setTheme } = useTheme();
  const { data: exchangeRates } = useExchangeRates();
  const { data: marketData, isLoading: marketLoading } = useMarketRates();
  const upsertRate = useUpsertExchangeRate();
  const submitBugReport = useSubmitBugReport();
  const { data: myBugReports } = useMyBugReports(5);
  const queryClient = useQueryClient();
  const { start: startTour } = useTourContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mounted, setMounted] = useState(false);
  const [fullName, setFullName] = useState("");
  const [primaryCurrency, setPrimaryCurrency] = useState("PHP");
  const [bugTitle, setBugTitle] = useState("");
  const [bugDescription, setBugDescription] = useState("");
  const [bugSeverity, setBugSeverity] = useState<BugReportSeverity>("medium");

  useEffect(() => setMounted(true), []);

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB");
      e.target.value = "";
      return;
    }
    uploadAvatar.mutate(file);
    e.target.value = "";
  };

  const handleSubmitBugReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    await submitBugReport.mutateAsync({
      title: bugTitle,
      description: bugDescription,
      severity: bugSeverity,
      page_path: typeof window !== "undefined" ? window.location.pathname : "/settings",
    });

    setBugTitle("");
    setBugDescription("");
    setBugSeverity("medium");
  };

  // Initials fallback
  const initials = (profile?.full_name ?? profile?.email ?? "?")
    .split(" ")
    .map((w) => w[0])
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
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative group">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{initials}</span>
                    )}
                  </div>
                  {/* Overlay */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadAvatar.isPending}
                    className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Change avatar"
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="h-5 w-5 text-white animate-spin" />
                    ) : (
                      <Camera className="h-5 w-5 text-white" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{profile?.full_name || "No name set"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadAvatar.isPending}
                    >
                      {uploadAvatar.isPending ? "Uploading..." : "Change Photo"}
                    </Button>
                    {profile?.avatar_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        onClick={() => removeAvatar.mutate()}
                        disabled={removeAvatar.isPending}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground/60">JPG, PNG or WebP · Max 2 MB</p>
                </div>
              </div>

              <Separator />

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
            <div className="flex items-center justify-between">
              <Label>Exchange Rates (to {primaryCurrency})</Label>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: ["market-rates"] })
                }
                disabled={marketLoading}
              >
                <RefreshCw
                  className={`h-3 w-3 mr-1 ${marketLoading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Set custom rates or leave blank to use live market rates
            </p>
            <div className="space-y-2">
              {CURRENCIES.filter((c) => c.code !== primaryCurrency).map((c) => {
                // Prefer live market rate, fall back to hardcoded
                const marketRate = marketData?.rates
                  ? (marketData.rates[c.code] ?? DEFAULT_RATES_TO_PHP[c.code] ?? 1) /
                    (marketData.rates[primaryCurrency] ?? DEFAULT_RATES_TO_PHP[primaryCurrency] ?? 1)
                  : (DEFAULT_RATES_TO_PHP[c.code] ?? 1) /
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
                      placeholder={marketRate.toFixed(4)}
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
            {marketData?.updated_at && (
              <p className="text-[11px] text-muted-foreground/60">
                Market rates updated{" "}
                {(() => {
                  const diff = Date.now() - new Date(marketData.updated_at).getTime();
                  const mins = Math.floor(diff / 60000);
                  if (mins < 1) return "just now";
                  if (mins < 60) return `${mins}m ago`;
                  const hours = Math.floor(mins / 60);
                  if (hours < 24) return `${hours}h ago`;
                  return `${Math.floor(hours / 24)}d ago`;
                })()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bug Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-muted-foreground" />
            Report a Bug
          </CardTitle>
          <CardDescription>
            Found something broken? Send details and it will appear in the admin dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmitBugReport} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="bug-title">Title</Label>
              <Input
                id="bug-title"
                placeholder="Short summary of the issue"
                value={bugTitle}
                onChange={(e) => setBugTitle(e.target.value)}
                required
                maxLength={120}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-severity">Severity</Label>
              <Select
                value={bugSeverity}
                onValueChange={(value) => setBugSeverity(value as BugReportSeverity)}
              >
                <SelectTrigger id="bug-severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bug-description">Description</Label>
              <textarea
                id="bug-description"
                placeholder="What happened? Include steps to reproduce."
                value={bugDescription}
                onChange={(e) => setBugDescription(e.target.value)}
                required
                rows={4}
                className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <Button
              type="submit"
              className="w-full sm:w-auto"
              disabled={submitBugReport.isPending || !bugTitle.trim() || !bugDescription.trim()}
            >
              {submitBugReport.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Bug Report
                </>
              )}
            </Button>
          </form>

          <Separator />

          <div className="space-y-2">
            <p className="text-sm font-medium">Recent Reports</p>
            {!myBugReports || myBugReports.length === 0 ? (
              <p className="text-xs text-muted-foreground">No reports submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {myBugReports.map((report) => (
                  <div key={report.id} className="rounded-md border px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{report.title}</p>
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground shrink-0">
                        {report.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {report.severity.toUpperCase()} · {new Date(report.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}
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
                variant={mounted && theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex-1 min-w-[100px]"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex-1 min-w-[100px]"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
              <Button
                variant={mounted && theme === "system" ? "default" : "outline"}
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

      <OfflineSyncCenter />

      {/* Account Section */}
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Take a Tour — mobile only (sidebar has it on desktop) */}
          <div className="md:hidden">
            <Button
              variant="outline"
              type="button"
              className="w-full gap-2"
              onClick={startTour}
            >
              <Map className="h-4 w-4" />
              Take a Tour
            </Button>
          </div>
          <form action={signOut}>
            <Button variant="outline" type="submit" className="w-full text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive md:w-auto">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
