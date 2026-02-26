"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Instead of "check your email", the UI will show an OTP input
  return { success: true };
}

export async function verifySignupOtp(formData: FormData) {
  const email = formData.get("email") as string;
  const token = formData.get("token") as string;

  if (token === "000000") {
    // Dev bypass: confirm email + create session via admin client
    const admin = createAdminClient();

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({ type: "magiclink", email });

    if (linkError || !linkData) {
      return { error: linkError?.message ?? "Failed to generate link" };
    }

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

    if (verifyError) {
      return { error: verifyError.message };
    }
  } else {
    // Real OTP: verify the signup confirmation code
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (error) {
      return { error: error.message };
    }
  }

  redirect("/onboarding");
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

  // Use admin client to bypass RLS
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({ has_completed_onboarding: true })
    .eq("id", user.id);

  if (error) {
    console.error("Error completing onboarding:", error);
    return { error: error.message };
  }

  return { success: true };
}
