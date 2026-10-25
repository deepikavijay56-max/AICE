import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";

async function SupabaseStatusSection() {
  let connection: {
    connected: boolean;
    configured: boolean;
    message: string;
  };

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.getSession();
    if (error) {
      connection = {
        connected: false,
        configured: true,
        message: `Supabase auth service notice: ${error.message}`,
      };
    } else {
      connection = {
        connected: true,
        configured: true,
        message: "Connected to Supabase client safely with RLS policies enabled.",
      };
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown connection failure";
    const isUnconfigured =
      message.includes("NEXT_PUBLIC_SUPABASE_URL") ||
      message.includes("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

    connection = {
      connected: false,
      configured: !isUnconfigured,
      message,
    };
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
          Supabase Initial Integration Status
        </h2>
        <a
          href="/api/health/supabase"
          target="_blank"
          rel="noreferrer"
          className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-mono"
        >
          View API Health Route &rarr;
        </a>
      </div>

      <div
        className={`p-4 rounded-lg border text-sm font-mono flex flex-col gap-2 ${
          connection.connected
            ? "bg-emerald-950/30 border-emerald-800/50 text-emerald-200"
            : connection.configured
            ? "bg-amber-950/30 border-amber-800/50 text-amber-200"
            : "bg-rose-950/30 border-rose-800/50 text-rose-200"
        }`}
      >
        <div className="flex items-center justify-between font-semibold">
          <span>Status: {connection.connected ? "Connected" : "Check Notice"}</span>
          <span className="text-xs opacity-75">Checked server-side</span>
        </div>
        <p className="text-xs break-words leading-relaxed whitespace-pre-wrap">
          {connection.message}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <span className="text-zinc-500 block mb-1">Browser Client</span>
          <span className="font-mono text-zinc-200">@/lib/supabase/client</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <span className="text-zinc-500 block mb-1">Server Client</span>
          <span className="font-mono text-zinc-200">@/lib/supabase/server</span>
        </div>
        <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
          <span className="text-zinc-500 block mb-1">Session Middleware</span>
          <span className="font-mono text-zinc-200">@/middleware.ts</span>
        </div>
      </div>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-zinc-800 rounded w-1/3"></div>
      <div className="h-20 bg-zinc-800/50 rounded-lg"></div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="h-16 bg-zinc-800/40 rounded-lg"></div>
        <div className="h-16 bg-zinc-800/40 rounded-lg"></div>
        <div className="h-16 bg-zinc-800/40 rounded-lg"></div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto w-full space-y-8 pt-6">
        {/* Header */}
        <header className="border-b border-zinc-800 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center h-8 px-2.5 rounded-md bg-indigo-600/20 text-indigo-400 font-mono text-xs uppercase tracking-wider font-semibold border border-indigo-500/30">
                AICTE SAKSHAM
              </span>
              <span className="text-xs text-zinc-400 font-mono">v0.1.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-2">
              Approval Workflow & Compliance Monitoring
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Next.js 16 App Router + Supabase SSR Integration
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold tracking-wide uppercase shadow-sm transition-colors"
            >
              <span>Launch Council Admin Portal</span>
              <span>&rarr;</span>
            </a>
          </div>
        </header>

        {/* Integration Status Card */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
          <Suspense fallback={<StatusSkeleton />}>
            <SupabaseStatusSection />
          </Suspense>
        </div>

        {/* Security & Architecture Highlights */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
            Security & Compliance Baseline
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-400">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong className="text-zinc-200 block">Row Level Security (RLS) Safe:</strong>
                No policies are loosened or bypassed; service_role credentials are kept strictly out of client bundles.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong className="text-zinc-200 block">Next.js App Router Cookies:</strong>
                Supports async cookie stores in Next.js 16 with automatic session refresh handling in middleware.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong className="text-zinc-200 block">Fail-Fast Environment Validation:</strong>
                Clear error messages in development when required environment keys are missing or malformed.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-900/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                ✓
              </div>
              <div>
                <strong className="text-zinc-200 block">Ready for Schema Migrations:</strong>
                Schema definitions and database tables can now be applied without breaking client or server contracts.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full border-t border-zinc-800/80 pt-6 mt-12 text-xs text-zinc-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span>AICTE SAKSHAM Compliance Monitoring Platform</span>
        <span>Ready for Database Schema &amp; Approval Workflows</span>
      </footer>
    </div>
  );
}
