/**
 * Supabase Environment Configuration Helper
 * Validates the presence of required Supabase environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 */

export interface SupabaseEnvConfig {
  supabaseUrl: string;
  supabasePublishableKey: string;
}

export function getSupabaseEnvConfig(): SupabaseEnvConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const missing: string[] = [];

  if (!supabaseUrl || supabaseUrl.trim() === "") {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabasePublishableKey || supabasePublishableKey.trim() === "") {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  if (missing.length > 0) {
    const errorMessage =
      `[AICTE SAKSHAM] Missing required Supabase environment variable(s): ${missing.join(", ")}.\n` +
      `Please configure them in your '.env.local' file.\n` +
      `Example:\n` +
      `  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n` +
      `  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key\n`;

    throw new Error(errorMessage);
  }

  return {
    supabaseUrl: supabaseUrl!,
    supabasePublishableKey: supabasePublishableKey!,
  };
}
