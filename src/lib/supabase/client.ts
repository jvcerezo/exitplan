import { createBrowserClient } from "@supabase/ssr";

// Must use literal process.env.NEXT_PUBLIC_* — Next.js inlines these at build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
