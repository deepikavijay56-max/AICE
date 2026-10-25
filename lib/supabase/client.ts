import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvConfig } from "./env";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in browser / Client Components.
 * Uses NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
 *
 * Security notice:
 * Never use service_role keys or secrets in client-side code.
 */
export function createClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnvConfig();

  return createBrowserClient<Database>(supabaseUrl, supabasePublishableKey);
}

