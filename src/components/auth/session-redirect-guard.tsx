"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SessionRedirectGuardProps {
  to: string;
}

const CACHE_KEY = "EXITPLAN_OFFLINE_CACHE";

export function SessionRedirectGuard({ to }: SessionRedirectGuardProps) {
  const router = useRouter();

  // Clear persisted React Query cache so a new sign-in never shows
  // stale data from a previous user (e.g., wrong profile name).
  useEffect(() => {
    localStorage.removeItem(CACHE_KEY);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    let isActive = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (session?.user) {
        router.replace(to);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.replace(to);
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [router, to]);

  return null;
}
