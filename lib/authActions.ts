"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { ROLE_HOME_ROUTES } from "./authConstants";
import type { UserRole } from "@/types/database";

export interface SignInResult {
  success: boolean;
  message?: string;
  redirectTo?: string;
  error?: string;
}

export interface PasswordResetResult {
  success: boolean;
  message: string;
}

/**
 * Authenticates user credentials via Supabase Auth.
 * Upon success, looks up the user's role from trusted public.profiles and determines destination workspace.
 */
export async function signInAction(formData: FormData): Promise<SignInResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      success: false,
      message: "Please provide both your registered email address and password.",
      error: "MISSING_CREDENTIALS",
    };
  }

  // Basic email syntax check (accepts any valid email format)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      message: "Please enter a valid email address.",
      error: "INVALID_EMAIL_FORMAT",
    };
  }

  try {
    const supabase = await createServerClient();

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      // Security rule: Never reveal if the email is registered unnecessarily
      const message =
        authError?.message.includes("Invalid login credentials")
          ? "Invalid email or password. Please verify your credentials and try again."
          : authError?.message || "Authentication failed. Please verify credentials.";

      return {
        success: false,
        message,
        error: "AUTH_FAILED",
      };
    }

    // Resolve trusted profile role server-side
    const { data: rawProfile, error: profileError } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              role: UserRole;
              is_active: boolean;
            } | null;
            error: unknown;
          }>;
        };
      };
    })
      .select("role, is_active")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !rawProfile) {
      return {
        success: false,
        message:
          "Authentication succeeded, but no role profile is associated with this account. Please contact Council Administration.",
        error: "PROFILE_NOT_FOUND",
      };
    }

    if (!rawProfile.is_active) {
      return {
        success: false,
        message: "Your account is currently inactive. Please contact your regional directorate or council administrator.",
        error: "ACCOUNT_INACTIVE",
      };
    }

    const role = rawProfile.role;
    const targetRoute = ROLE_HOME_ROUTES[role] || "/admin";

    revalidatePath("/", "layout");

    return {
      success: true,
      redirectTo: targetRoute,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Service temporarily unavailable. Please retry.";
    return {
      success: false,
      message,
      error: "SERVER_ERROR",
    };
  }
}

/**
 * Initiates standard Supabase password recovery.
 */
export async function requestPasswordResetAction(formData: FormData): Promise<PasswordResetResult> {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    return {
      success: false,
      message: "Please enter your registered email address.",
    };
  }

  try {
    const supabase = await createServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      return {
        success: false,
        message: error.message || "Failed to dispatch password recovery email.",
      };
    }

    return {
      success: true,
      message:
        "If an authorized account is associated with this email, instructions have been dispatched to your institutional inbox.",
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Password reset service temporarily unavailable.",
    };
  }
}

/**
 * Signs out the current session and revalidates all paths.
 */
export async function signOutAction(): Promise<{ success: boolean }> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (err) {
    console.warn("Sign out error:", err);
    return { success: false };
  }
}
