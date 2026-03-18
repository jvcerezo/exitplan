"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, LogOut, Loader2, RefreshCw, Map, Camera, X, Bug, Send, Download, ShieldAlert, ExternalLink, Bell, Zap, LayoutDashboard, ArrowLeft } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar, useRemoveAvatar } from "@/hooks/use-profile";
import { useExchangeRates, useUpsertExchangeRate } from "@/hooks/use-exchange-rates";
import { useMarketRates } from "@/hooks/use-market-rates";
import { useMyBugReports, useSubmitBugReport } from "@/hooks/use-bug-reports";
import { signOut, deleteAccount } from "@/app/(auth)/actions";
import Link from "next/link";
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
import { cn } from "@/lib/utils";
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
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");

  // Automation & notification toggles (localStorage-backed)
  const automationKeys = [
    { key: "exitplan_auto_contributions", label: "Auto-generate monthly contributions", description: "Create SSS, PhilHealth, and Pag-IBIG entries each month from your last salary" },
    { key: "exitplan_auto_bills", label: "Bill reminders", description: "Show upcoming bills on your Home page and send push notifications before due dates" },
    { key: "exitplan_auto_debts", label: "Debt payment reminders", description: "Show upcoming debt payments on your Home page and send push notifications" },
    { key: "exitplan_auto_insurance", label: "Insurance premium reminders", description: "Show upcoming insurance premiums and send push notifications before renewal dates" },
  ];

  const homePageKeys = [
    { key: "exitplan_home_upcoming", label: "Upcoming Payments", description: "Show bills, contributions, debts, and insurance due soon" },
    { key: "exitplan_home_nextsteps", label: "Next Steps", description: "Show suggested next actions from your adulting journey" },
    { key: "exitplan_home_finances", label: "Financial Summary", description: "Show balance, income, and expenses at a glance" },
    { key: "exitplan_home_stage", label: "Current Life Stage", description: "Show your current adulting journey stage and progress" },
  ];

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

  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const res = await fetch("/api/export-data");
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exitplan-data-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to export data. Please try again.");
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setIsDeletingAccount(true);
    const result = await deleteAccount();
    if (result?.error) {
      toast.error(result.error);
      setIsDeletingAccount(false);
    } else {
      // deleteAccount signs out + deletes — redirect to home
      window.location.href = "/";
    }
  };

  // Get existing user rates keyed by from_currency
  const userRates: Record<string, number> = {};
  for (const rate of exchangeRates ?? []) {
    if (rate.to_currency === primaryCurrency) {
      userRates[rate.from_currency] = rate.rate;
    }
  }

  const SECTIONS = [
    { id: "profile", label: "Profile", icon: Camera, desc: "Name, avatar, email" },
    { id: "appearance", label: "Appearance", icon: Sun, desc: "Theme preferences" },
    { id: "automation", label: "Automation", icon: Zap, desc: "Reminders & auto-generation" },
    { id: "notifications", label: "Notifications", icon: Bell, desc: "Push notification settings" },
    { id: "home", label: "Home Page", icon: LayoutDashboard, desc: "Customize your Home" },
    { id: "currency", label: "Currency", icon: RefreshCw, desc: "Rates & primary currency" },
    { id: "privacy", label: "Privacy & Data", icon: ShieldAlert, desc: "Export, delete, legal" },
    { id: "bugs", label: "Report Bug", icon: Bug, desc: "Report issues" },
    { id: "account", label: "Account", icon: LogOut, desc: "Sign out, tour, sync" },
  ] as const;

  // On mobile: show the menu list OR the active section (drill-in)
  // On desktop: always show sidebar + content side by side
  const showingContent = activeSection !== "";

  return (
    <div>
      {/* Desktop: sidebar + content */}
      <div className="sm:flex sm:gap-6">
        {/* Sidebar — always visible on desktop, hidden on mobile when drilling in */}
        <div className={cn(
          "sm:w-56 sm:shrink-0 sm:block",
          showingContent ? "hidden" : "block"
        )}>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-sm text-muted-foreground mb-4">Manage your account and preferences</p>

          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveSection(id)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors",
                  activeSection === id
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                  activeSection === id ? "bg-primary/10" : "bg-muted"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-[11px] text-muted-foreground sm:hidden">{desc}</p>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content — always visible on desktop, shown on mobile only when a section is selected */}
        <div className={cn(
          "sm:flex-1 sm:min-w-0 sm:block",
          showingContent ? "block" : "hidden"
        )}>
          {/* Mobile back button */}
          <button
            type="button"
            onClick={() => setActiveSection("")}
            className="sm:hidden flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Settings
          </button>

      {/* ── Profile ── */}
      {activeSection === "profile" && (
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
      )}

      {/* ── Currency ── */}
      {activeSection === "currency" && (
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
      )}

      {/* ── Bug Reports ── */}
      {activeSection === "bugs" && (
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
      )}

      {/* ── Appearance ── */}
      {activeSection === "appearance" && (
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
      )}

      {/* ── Automation ── */}
      {activeSection === "automation" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-muted-foreground" />
            Automation & Reminders
          </CardTitle>
          <CardDescription>
            Control which features run automatically and send you reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {automationKeys.map((item) => (
            <SettingsToggleRow key={item.key} storageKey={item.key} label={item.label} description={item.description} />
          ))}
        </CardContent>
      </Card>
      )}

      {/* ── Notifications ── */}
      {activeSection === "notifications" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            Notifications
          </CardTitle>
          <CardDescription>
            Push notification preferences (mobile app only)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <SettingsToggleRow
            storageKey="exitplan_notif_enabled"
            label="Push notifications"
            description="Receive notifications on your phone for upcoming payments and reminders"
          />
          <SettingsToggleRow
            storageKey="exitplan_notif_morning"
            label="Morning summary"
            description="Get a daily summary of what's due today at 9:00 AM"
          />
        </CardContent>
      </Card>
      )}

      {/* ── Home Page ── */}
      {activeSection === "home" && (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
            Home Page
          </CardTitle>
          <CardDescription>
            Choose which sections appear on your Home page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {homePageKeys.map((item) => (
            <SettingsToggleRow key={item.key} storageKey={item.key} label={item.label} description={item.description} />
          ))}
        </CardContent>
      </Card>
      )}

      {/* ── Account ── */}
      {activeSection === "account" && (
      <>
      <OfflineSyncCenter />
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
      </>
      )}

      {/* ── Privacy & Data ── */}
      {activeSection === "privacy" && (
      <>
      <Card>
        <CardHeader>
          <CardTitle>Privacy</CardTitle>
          <CardDescription>
            Your data rights and export options under the Data Privacy Act of 2012
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Export Your Data</p>
            <p className="text-xs text-muted-foreground">
              Download a full copy of all your data in JSON format — transactions, accounts,
              budgets, goals, debts, and contributions.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 gap-2"
              onClick={handleExportData}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Exporting...</>
              ) : (
                <><Download className="h-4 w-4" /> Download My Data</>
              )}
            </Button>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm font-medium">Legal Documents</p>
            <div className="flex flex-col gap-1.5 mt-2">
              <Link
                href="/privacy"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Terms of Service
              </Link>
            </div>
          </div>

          <Separator />

          <p className="text-xs text-muted-foreground">
            For privacy-related concerns, email{" "}
            <a href="mailto:privacy@exitplan.app" className="text-primary hover:underline">
              privacy@exitplan.app
            </a>
            . We will respond within 15 business days.
          </p>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanent and irreversible actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground mt-1">
                Permanently deletes your account and all associated data — transactions, accounts,
                goals, budgets, debts, and contributions. This cannot be undone.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="delete-confirm" className="text-xs text-muted-foreground">
                Type <span className="font-mono font-bold text-foreground">DELETE</span> to confirm
              </Label>
              <Input
                id="delete-confirm"
                placeholder="DELETE"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="max-w-[200px] h-8 text-sm font-mono"
              />
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={deleteConfirmText !== "DELETE" || isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              {isDeletingAccount ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
              ) : (
                "Delete My Account Permanently"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </>
      )}

        </div>
      </div>
    </div>
  );
}

// ─── Toggle Row Component ────────────────────────────────────────────────────

function SettingsToggleRow({
  storageKey,
  label,
  description,
}: {
  storageKey: string;
  label: string;
  description: string;
}) {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    // Default to enabled if never set
    setEnabled(stored !== null ? stored === "1" : true);
  }, [storageKey]);

  if (enabled === null) return null;

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(storageKey, next ? "1" : "0");
  }

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={toggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}
