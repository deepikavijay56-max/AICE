import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export interface HealthCheckResponse {
  status: "connected" | "error" | "unconfigured";
  message: string;
  timestamp: string;
  details?: {
    endpoint?: string;
    authServiceReachable?: boolean;
    errorName?: string;
  };
}

export async function GET() {
  const timestamp = new Date().toISOString();

  try {
    const supabase = await createClient();

    // Perform a lightweight, safe communication check without relying on custom tables.
    // getSession() verifies auth/REST connectivity safely without requiring elevated permissions or RLS bypass.
    const { error } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json<HealthCheckResponse>(
        {
          status: "error",
          message: `Supabase returned an authentication service error: ${error.message}`,
          timestamp,
          details: {
            authServiceReachable: false,
            errorName: error.name,
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json<HealthCheckResponse>({
      status: "connected",
      message: "Successfully reached Supabase service (safe server-side check with RLS intact).",
      timestamp,
      details: {
        authServiceReachable: true,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const isUnconfigured =
      message.includes("NEXT_PUBLIC_SUPABASE_URL") ||
      message.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

    return NextResponse.json<HealthCheckResponse>(
      {
        status: isUnconfigured ? "unconfigured" : "error",
        message,
        timestamp,
      },
      { status: isUnconfigured ? 503 : 500 }
    );
  }
}
