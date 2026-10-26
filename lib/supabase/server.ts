import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnvConfig } from "./env";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for Server Components, Server Actions, and Route Handlers.
 * In Next.js 15+, cookies() returns a Promise and must be awaited.
 *
 * Security notice:
 * Uses public publishable key with authenticated user session from secure cookies.
 * Does not expose service role credentials.
 */
export async function createClient() {
  let cookieStore: Awaited<ReturnType<typeof cookies>> | null = null;
  try {
    cookieStore = await cookies();
  } catch {
    // During Next.js static prerendering, cookies() can reject.
    // Allow static prerender to complete gracefully without hanging promise errors.
    cookieStore = null;
  }

  const { supabaseUrl, supabasePublishableKey } = getSupabaseEnvConfig();

  return createServerClient<Database>(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore ? cookieStore.getAll() : [];
      },
      setAll(cookiesToSet) {
        if (!cookieStore) return;
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore!.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}

export const createServerClientSupabase = createClient;
export { createClient as createServerClient };
