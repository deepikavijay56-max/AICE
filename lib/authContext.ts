import { createServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";
import type { CurrentUserContext } from "./authConstants";
export { ROLE_HOME_ROUTES } from "./authConstants";
export type { CurrentUserContext } from "./authConstants";

/**
 * Retrieves the authenticated user and verifies their profile role from public.profiles
 * Returns a fallback guest/admin preview if unauthenticated in demo mode
 */
export async function getCurrentUserContext(): Promise<CurrentUserContext | null> {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              id: string;
              email: string;
              full_name: string;
              role: UserRole;
              institution_id: string | null;
              region_id: string | null;
              is_active: boolean;
            } | null;
            error: unknown;
          }>;
        };
      };
    })
      .select("id, email, full_name, role, institution_id, region_id, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.is_active) {
      return {
        userId: user.id,
        email: user.email || null,
        fullName: profile?.full_name || null,
        role: "institution_user",
        institutionId: null,
        regionId: null,
        isActive: false,
        isAuthenticated: true,
      };
    }

    return {
      userId: user.id,
      email: user.email || null,
      fullName: profile.full_name,
      role: profile.role,
      institutionId: profile.institution_id,
      regionId: profile.region_id,
      isActive: profile.is_active,
      isAuthenticated: true,
    };
  } catch (err) {
    console.warn("getCurrentUserContext error:", err);
    return null;
  }
}
