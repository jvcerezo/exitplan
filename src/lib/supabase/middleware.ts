import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth", "/privacy", "/terms", "/offline"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

// Web app is currently scoped to landing + admin only.
// Regular (non-admin) authenticated users get routed back to the landing
// page if they try to access any app route — the mobile app is the only
// supported client for end users right now.
function isWebAllowedForNonAdmin(pathname: string) {
  return isPublicRoute(pathname);
}

function withTourParam(fromRequest: NextRequest, targetPathname: string) {
  const url = fromRequest.nextUrl.clone();
  const tour = fromRequest.nextUrl.searchParams.get("tour");
  url.pathname = targetPathname;
  url.search = "";
  if (tour === "1") {
    url.searchParams.set("tour", "1");
  }
  return url;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isTourMode = request.nextUrl.searchParams.get("tour") === "1";

  // Fast path: check if any Supabase auth cookies exist at all.
  // If not and the route is protected, redirect immediately — no network call.
  const hasAuthCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-"));

  if (!hasAuthCookie && !isPublicRoute(pathname)) {
    return NextResponse.redirect(withTourParam(request, "/login"));
  }

  // For public routes with no auth cookie, skip Supabase entirely
  if (!hasAuthCookie && isPublicRoute(pathname)) {
    return NextResponse.next({ request });
  }

  // Auth cookie exists — create client to validate/refresh the session
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile:
    | {
        has_completed_onboarding: boolean;
      }
    | null
    | undefined;

  let isAdmin: boolean | undefined;

  async function getProfile() {
    if (profile !== undefined || !user) {
      return profile ?? null;
    }

    const { data } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", user.id)
      .maybeSingle();

    profile = data;
    return profile ?? null;
  }

  async function getIsAdmin() {
    if (isAdmin !== undefined || !user) {
      return isAdmin ?? false;
    }

    const { data, error } = await supabase.rpc("is_admin_user", {
      p_user_id: user.id,
    });

    if (error) {
      isAdmin = false;
      return false;
    }

    isAdmin = Boolean(data);
    return isAdmin;
  }

  // Session cookie exists but is invalid/expired — redirect to login
  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(withTourParam(request, "/login"));
  }

  // Authenticated user on auth page — route based on role.
  // Admins → /admin, regular users → landing (/) since web app is
  // landing + admin only right now.
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const adminCheck = await getIsAdmin();
    return NextResponse.redirect(
      withTourParam(request, adminCheck ? "/admin" : "/"),
    );
  }

  // Block non-admin authenticated users from any app route.
  // Web is locked to landing + admin while we focus on the mobile app.
  if (user && !isAdminRoute(pathname) && !isWebAllowedForNonAdmin(pathname)) {
    const adminCheck = await getIsAdmin();
    if (!adminCheck) {
      return NextResponse.redirect(withTourParam(request, "/"));
    }
  }

  // Admin route protection (also checks onboarding)
  if (user && isAdminRoute(pathname)) {
    const profile = await getProfile();
    const isAdmin = await getIsAdmin();

    if (profile && !profile.has_completed_onboarding) {
      return NextResponse.redirect(withTourParam(request, "/onboarding"));
    }

    if (!profile || !isAdmin) {
      // Non-admin hitting /admin → back to landing.
      return NextResponse.redirect(withTourParam(request, "/"));
    }
  }

  // Onboarding enforcement for non-onboarding protected routes
  // Skip public routes (landing page, privacy, terms) — they should always be accessible
  if (user && !isAdminRoute(pathname) && pathname !== "/onboarding" && !isPublicRoute(pathname)) {
    const profile = await getProfile();

    if (profile && !profile.has_completed_onboarding) {
      if (!isTourMode) {
        return NextResponse.redirect(withTourParam(request, "/onboarding"));
      }
    }
  }

  // Already-onboarded user visiting /onboarding — redirect to dashboard
  if (user && pathname === "/onboarding") {
    const profile = await getProfile();

    if (profile?.has_completed_onboarding) {
      return NextResponse.redirect(withTourParam(request, "/home"));
    }
  }

  return supabaseResponse;
}
