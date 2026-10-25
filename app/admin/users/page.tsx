import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { QueryProfile } from "@/types/admin";

export const metadata = {
  title: "User Management & RBAC | AICTE SAKSHAM",
  description: "Role-based access control, officer delegations, and statutory permissions",
};

interface UserProfileRow {
  id: string;
  fullName: string;
  role: string;
  regionOrInstitution: string;
  isActive: boolean;
  createdAt: string;
}

const DEMO_USERS: UserProfileRow[] = [
  {
    id: "usr-1",
    fullName: "Dr. K. Balasubramanian",
    role: "council_admin",
    regionOrInstitution: "AICTE HQ, New Delhi",
    isActive: true,
    createdAt: "2026-01-15T09:00:00Z",
  },
  {
    id: "usr-2",
    fullName: "Shri Rajesh Deshmukh",
    role: "regional_officer",
    regionOrInstitution: "Western Regional Office (Mumbai)",
    isActive: true,
    createdAt: "2026-02-01T10:30:00Z",
  },
  {
    id: "usr-3",
    fullName: "Dr. Sunita Murthy",
    role: "scrutiny_officer",
    regionOrInstitution: "Southern Regional Office (Chennai)",
    isActive: true,
    createdAt: "2026-02-10T11:15:00Z",
  },
  {
    id: "usr-4",
    fullName: "Prof. Arvind Verma",
    role: "evc_expert",
    regionOrInstitution: "IIT Bombay (Visiting Expert)",
    isActive: true,
    createdAt: "2026-03-05T14:00:00Z",
  },
  {
    id: "usr-5",
    fullName: "Shri Amitabh Sen",
    role: "system_auditor",
    regionOrInstitution: "Internal Audit Directorate",
    isActive: true,
    createdAt: "2026-01-20T16:45:00Z",
  },
];

async function UsersContent() {
  let users = DEMO_USERS;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("profiles") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryProfile[] | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        full_name,
        role,
        is_active,
        created_at,
        region:regions (
          name
        ),
        institution:institutions (
          name
        )
      `)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      isDemo = false;
      users = data.map((d) => {
        const reg = d.region;
        const inst = d.institution;
        return {
          id: d.id,
          fullName: d.full_name || "Statutory User",
          role: d.role,
          regionOrInstitution: reg?.name || inst?.name || "Council Secretariat",
          isActive: d.is_active ?? true,
          createdAt: d.created_at || "2026-01-01",
        };
      });
    }
  } catch (err) {
    console.warn("UsersContent: falling back to demo records", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            User Management & Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Governed by cryptographic row-level security policies across Council, Regional & Scrutiny hierarchies
          </p>
        </div>

        {isDemo && (
          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
            Sample Officer Directory
          </span>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Authorized Personnel Directory
          </h3>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
            Total Officers: {users.length}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Officer Name</th>
                <th className="py-3 px-4">Statutory Role</th>
                <th className="py-3 px-4">Jurisdiction / Attachment</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4 text-right">Registered On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {u.fullName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {u.regionOrInstitution}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {u.isActive ? "Active (Verified)" : "Suspended"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading user management directory...</p>
        </div>
      }
    >
      <UsersContent />
    </Suspense>
  );
}
