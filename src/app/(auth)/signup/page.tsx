"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "../actions";

const BRAND_BULLETS = [
  "Free forever — no subscriptions, no paywalls",
  "Private & secure with row-level data isolation",
  "Import from GCash, BDO, BPI, and more",
];

type StrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

interface PasswordStrength {
  level: StrengthLevel;
  score: number; // 0–4
  label: string;
  color: string;
  checks: { label: string; passed: boolean }[];
}

function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    { label: "At least 8 characters", passed: password.length >= 8 },
    { label: "Uppercase letter (A–Z)", passed: /[A-Z]/.test(password) },
    { label: "Lowercase letter (a–z)", passed: /[a-z]/.test(password) },
    { label: "Number (0–9)", passed: /[0-9]/.test(password) },
    { label: "Special character (!@#$…)", passed: /[^A-Za-z0-9]/.test(password) },
  ];

  if (password.length === 0) {
    return { level: "empty", score: 0, label: "", color: "", checks };
  }

  const score = checks.filter((c) => c.passed).length;

  if (score <= 1) return { level: "weak", score, label: "Weak", color: "bg-red-500", checks };
  if (score === 2) return { level: "fair", score, label: "Fair", color: "bg-orange-500", checks };
  if (score === 3) return { level: "good", score, label: "Good", color: "bg-yellow-500", checks };
  return { level: "strong", score, label: "Strong", color: "bg-green-500", checks };
}

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const pwd = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (pwd !== confirmPassword) {
      setError("Passwords don't match.");
      setLoading(false);
      return;
    }
    if (pwd.length < 8) {
      setError("Password must be at least 8 characters.");
      setLoading(false);
      return;
    }
    if (strength.score < 3) {
      setError("Please use a stronger password (add uppercase, numbers, or special characters).");
      setLoading(false);
      return;
    }

    const result = await signUp(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* ── Left brand panel (desktop only) ── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary p-12 text-primary-foreground">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Exit<span className="opacity-60">Plan</span>
        </Link>

        <div className="space-y-8">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Start your path<br />
            to financial<br />
            freedom.
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
          Takes 30 seconds · No credit card needed
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-col items-center justify-center px-6 py-16 sm:px-10">
        {/* Mobile logo */}
        <Link href="/" className="mb-10 text-2xl font-bold tracking-tight lg:hidden">
          Exit<span className="text-primary">Plan</span>
        </Link>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Free forever. No credit card required.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
            </div>

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
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

              {/* Strength meter */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  {/* Bar */}
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                          strength.score >= bar ? strength.color : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  {/* Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Password strength</span>
                    <span
                      className={`text-xs font-medium ${
                        strength.level === "weak" ? "text-red-500"
                        : strength.level === "fair" ? "text-orange-500"
                        : strength.level === "good" ? "text-yellow-600"
                        : "text-green-600"
                      }`}
                    >
                      {strength.label}
                    </span>
                  </div>
                  {/* Checklist */}
                  <ul className="space-y-1">
                    {strength.checks.map((c) => (
                      <li key={c.label} className="flex items-center gap-2 text-xs">
                        <span
                          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full ${
                            c.passed ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {c.passed ? (
                            <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="h-2 w-2">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          ) : (
                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                          )}
                        </span>
                        <span className={c.passed ? "text-foreground" : "text-muted-foreground"}>
                          {c.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
