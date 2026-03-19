"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

async function getBaseUrl() {
  const configuredSiteUrl = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL ?? "");
  const additionalAllowedOrigins = (process.env.ALLOWED_AUTH_REDIRECT_ORIGINS ?? "")
    .split(",")
    .map((entry) => normalizeOrigin(entry.trim()))
    .filter((entry): entry is string => Boolean(entry));

  const allowlistedOrigins = new Set<string>([
    ...(configuredSiteUrl ? [configuredSiteUrl] : []),
    ...additionalAllowedOrigins,
  ]);

  if (configuredSiteUrl) {
    return configuredSiteUrl;
  }

  const headerStore = await headers();
  const originHeader = normalizeOrigin(headerStore.get("origin") ?? "");
  if (originHeader && allowlistedOrigins.has(originHeader)) {
    return originHeader;
  }

  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "https";

  if (host) {
    const candidate = normalizeOrigin(`${proto}://${host}`);
    if (candidate && allowlistedOrigins.has(candidate)) {
      return candidate;
    }
  }

  if (process.env.VERCEL_URL) {
    const vercelOrigin = normalizeOrigin(`https://${process.env.VERCEL_URL}`);
    if (vercelOrigin) {
      return vercelOrigin;
    }
  }

  return "http://localhost:3000";
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const supabase = await createClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${baseUrl}/auth/callback?next=/onboarding`,
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
    redirect("/onboarding");
  }

  return {
    success: true,
    requiresEmailConfirmation: true,
    email,
  };
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

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

  redirect("/home");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated." };
  }

  // Sign out first so the session is cleared before the user row is deleted
  await supabase.auth.signOut();

  // Use the admin client to delete the auth user — this cascades to all user data
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    console.error("Error deleting account:", error);
    return { error: "Could not delete account. Please try again or contact support@sandalan.com." };
  }

  return { success: true };
}

export async function completeOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.rpc("complete_onboarding");

  if (error) {
    console.error("Error completing onboarding:", error);
    return { error: "Could not complete onboarding. Please try again." };
  }

  return { success: true };
}
