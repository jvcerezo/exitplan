"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SessionRedirectGuard } from "@/components/auth/session-redirect-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "../actions";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";

const BRAND_BULLETS = [
  "Track income & expenses across all accounts",
  "Set monthly budgets and savings goals",
  "Visual insights on one clean dashboard",
];

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <SessionRedirectGuard to="/home" />
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link href="/" className="inline-flex items-center gap-3 text-xl font-bold tracking-tight">
          <BrandMark className="h-11 w-11" />
          <span>
            Exit<span className="opacity-60">Plan</span>
          </span>
        </Link>

        <div className="space-y-8">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Your money.<br />
            Your plan.<br />
            Your freedom.
          </p>
          <ul className="space-y-3">
            {BRAND_BULLETS.map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm text-primary-foreground/80">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary-foreground/60" />
                {b}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-primary-foreground/50">
          100% free · No credit card required
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 inline-flex items-center gap-3 text-2xl font-bold tracking-tight lg:hidden">
          <BrandMark className="h-11 w-11" />
          <span className="text-[#14213D] dark:text-white">
            Exit<span className="text-primary">Plan</span>
          </span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to continue your financial journey
            </p>
          </div>

          {/* Google */}
          <div className="space-y-4 mb-6">
            <GoogleSignInButton next="/home" />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or continue with email</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
