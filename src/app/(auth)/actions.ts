"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    return { error: error.message };
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
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
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
    return { error: error.message };
  }

  return { success: true };
}
