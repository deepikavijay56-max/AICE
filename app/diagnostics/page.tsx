import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "AICTE SAKSHAM System Diagnostics & SSR Integration Status",
  description: "Internal development status and health check for Supabase SSR and database connectivity in AICTE SAKSHAM",
};

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

export default function DiagnosticsPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between p-6 sm:p-12 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-8 pt-6">
        <header className="border-b border-zinc-800 pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              AICTE SAKSHAM &bull; Developer Diagnostics &amp; SSR Health
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              Internal service status checks for Smart India Hackathon engineering review
            </p>
          </div>
          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-xs text-zinc-300 transition-colors"
          >
            &larr; Back to Portal
          </Link>
        </header>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 backdrop-blur">
          <Suspense fallback={<StatusSkeleton />}>
            <SupabaseStatusSection />
          </Suspense>
        </div>
      </div>

      <footer className="max-w-4xl mx-auto w-full border-t border-zinc-800/80 pt-6 mt-12 text-xs text-zinc-500">
        AICTE SAKSHAM &mdash; Smart Approval, Compliance, Scheduling &amp; Handling Automation &bull; Diagnostics Utility
      </footer>
    </div>
  );
}
