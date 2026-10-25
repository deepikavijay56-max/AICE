import React, { Suspense } from "react";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/AdminShell";
import { AlertCircleIcon, ArrowRightIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Council Administration | AICTE SAKSHAM",
  description: "AICTE Statutory Approval & Regulatory Compliance Monitoring Portal",
};

interface UserProfilePreview {
  role?: string;
  full_name?: string;
}

function AccessDeniedScreen({ userRole }: { userRole: string }) {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-slate-100">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircleIcon className="w-6 h-6" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
            403 Forbidden
          </span>
          <h2 className="text-lg font-bold text-white mt-2">
            Council Administration Access Restricted
          </h2>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Your authenticated profile is registered with role{" "}
            <span className="font-mono font-bold text-amber-400">{userRole}</span>.
            Access to statutory council-level policy controls and final executive decisions requires an authorized{" "}
            <span className="font-mono font-bold text-teal-400">council_admin</span> role.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors"
          >
            <span>Return to Portal Home</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

async function UserContextFetcher({ children }: { children: React.ReactNode }) {
  let userEmail: string | null = null;
  let userRole = "council_admin";
  let fullName: string | null = null;
  let isAccessDenied = false;

  try {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      userEmail = user.email || null;
      const { data: rawProfile } = await (supabase.from("profiles") as unknown as {
        select: (cols: string) => {
          eq: (col: string, val: string) => {
            single: () => Promise<{
              data: UserProfilePreview | null;
              error: unknown;
            }>;
          };
        };
      })
        .select("role, full_name")
        .eq("id", user.id)
        .single();

      const profile = rawProfile;
      if (profile && profile.role) {
        userRole = profile.role;
        fullName = profile.full_name || null;

        // Strict Server-Side RBAC Enforcement:
        // Non-council users (institution_admin, institution_user, evc_expert) must not access council_admin routes
        const authorizedCouncilRoles = ["council_admin", "system_auditor"];
        if (!authorizedCouncilRoles.includes(userRole)) {
          isAccessDenied = true;
        }
      }
    }
  } catch (err) {
    console.warn("Unable to fetch user context for admin layout:", err);
  }

  if (isAccessDenied) {
    return <AccessDeniedScreen userRole={userRole} />;
  }

  return (
    <AdminShell
      userEmail={userEmail}
      userRole={userRole}
      fullName={fullName}
    >
      {children}
    </AdminShell>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold tracking-wider uppercase text-teal-400">
              Loading AICTE Council Administration...
            </span>
          </div>
        </div>
      }
    >
      <UserContextFetcher>{children}</UserContextFetcher>
    </Suspense>
  );
}
