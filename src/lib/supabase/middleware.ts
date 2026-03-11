import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/auth"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
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

  // Session cookie exists but is invalid/expired — redirect to login
  if (!user && !isPublicRoute(pathname)) {
    return NextResponse.redirect(withTourParam(request, "/login"));
  }

  // Authenticated user on auth page (not onboarding) — redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(withTourParam(request, "/dashboard"));
  }

  // Admin route protection (also checks onboarding)
  if (user && isAdminRoute(pathname)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, has_completed_onboarding")
      .eq("id", user.id)
      .single();

    if (profile && !profile.has_completed_onboarding) {
      return NextResponse.redirect(withTourParam(request, "/onboarding"));
    }

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(withTourParam(request, "/dashboard"));
    }
  }

  // Onboarding enforcement for non-onboarding protected routes
  if (user && !isAdminRoute(pathname) && pathname !== "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", user.id)
      .single();

    if (profile && !profile.has_completed_onboarding) {
      if (!isTourMode) {
        return NextResponse.redirect(withTourParam(request, "/onboarding"));
      }
    }
  }

  // Already-onboarded user visiting /onboarding — redirect to dashboard
  if (user && pathname === "/onboarding") {
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_completed_onboarding")
      .eq("id", user.id)
      .single();

    if (profile?.has_completed_onboarding) {
      return NextResponse.redirect(withTourParam(request, "/dashboard"));
    }
  }

  return supabaseResponse;
}
