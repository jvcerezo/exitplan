/**
 * Client-side auth actions for Capacitor static export builds.
 * This file replaces actions.ts during mobile builds.
 */

import { createClient } from "@/lib/supabase/client";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const supabase = createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${siteUrl}/auth/callback?next=/onboarding`,
    },
  });

  if (error) {
    const status = error.status ?? 0;
    const msg =
      status === 422 || status === 400
        ? "Invalid email or password format."
        : status === 429
          ? "Too many attempts. Please try again later."
          : "Could not create account. Please try again.";
    return { error: msg };
  }

  if (data.session) {
    return { success: true, redirect: "/onboarding" } as any;
  }

  return {
    success: true,
    requiresEmailConfirmation: true,
    email,
  };
}

export async function signIn(formData: FormData) {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });

  if (error) {
    const status = error.status ?? 0;
    const msg =
      status === 400
        ? "Invalid email or password."
        : status === 429
          ? "Too many attempts. Please try again later."
          : "Sign in failed. Please try again.";
    return { error: msg };
  }

  return { redirect: "/dashboard" } as any;
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return { redirect: "/" } as any;
}

export async function deleteAccount() {
  return { error: "Account deletion requires an internet connection. Please use the web app." };
}

export async function completeOnboarding() {
  const supabase = createClient();
  const { error } = await supabase.rpc("complete_onboarding");

  if (error) {
    return { error: "Could not complete onboarding. Please try again." };
  }

  return { success: true };
}
