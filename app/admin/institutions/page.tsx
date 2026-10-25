import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { QueryInstitution } from "@/types/admin";

export const metadata = {
  title: "Institutions Directory | AICTE SAKSHAM",
  description: "Directory of approved technical colleges, polytechnics, and universities",
};

interface InstitutionItem {
  id: string;
  name: string;
  permanentInstituteId: string;
  institutionType: string;
  state: string;
  district: string;
  status: string;
}

const DEMO_INSTITUTIONS: InstitutionItem[] = [
  {
    id: "inst-1",
    name: "K.J. Somaiya College of Engineering",
    permanentInstituteId: "1-4251781",
    institutionType: "Private-Unaided",
    state: "Maharashtra",
    district: "Mumbai Suburban",
    status: "Approved (Active)",
  },
  {
    id: "inst-2",
    name: "T.A. Pai Management Institute",
    permanentInstituteId: "1-1289456",
    institutionType: "Stand Alone (PGDM)",
    state: "Karnataka",
    district: "Udupi",
    status: "Approved (Active)",
  },
  {
    id: "inst-3",
    name: "PSG College of Pharmacy",
    permanentInstituteId: "1-7893214",
    institutionType: "Govt-Aided",
    state: "Tamil Nadu",
    district: "Coimbatore",
    status: "Approved (Active)",
  },
  {
    id: "inst-4",
    name: "Harcourt Butler Technical University",
    permanentInstituteId: "1-3344556",
    institutionType: "State University",
    state: "Uttar Pradesh",
    district: "Kanpur",
    status: "Approved (Active)",
  },
  {
    id: "inst-5",
    name: "Jadavpur University School of Architecture",
    permanentInstituteId: "1-9988771",
    institutionType: "State University",
    state: "West Bengal",
    district: "Kolkata",
    status: "Approved (Active)",
  },
];

async function InstitutionsContent() {
  let institutions = DEMO_INSTITUTIONS;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("institutions") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryInstitution[] | null;
          error: unknown;
        }>;
      };
    })
      .select("id, name, aicte_id, legal_entity_type, state, city")
      .order("name", { ascending: true });

    if (data && data.length > 0) {
      isDemo = false;
      institutions = data.map((d) => ({
        id: d.id,
        name: d.name,
        permanentInstituteId: d.aicte_id || "N/A",
        institutionType: d.legal_entity_type || "Technical Institute",
        state: d.state || "India",
        district: d.city || "Central",
        status: "Approved (Active)",
      }));
    }
  } catch (err) {
    console.warn("InstitutionsContent: falling back to demo records", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Approved Institutions Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Permanent Institute ID (PID) indexed technical education database
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
              Demo Directory
            </span>
          )}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            Total Registered: {institutions.length}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Permanent ID</th>
                <th className="py-3 px-4">Institution Name</th>
                <th className="py-3 px-4">Type / Category</th>
                <th className="py-3 px-4">State & City</th>
                <th className="py-3 px-4 text-right">Regulatory Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {inst.permanentInstituteId}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {inst.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                      {inst.institutionType}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {inst.district}, {inst.state}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {inst.status}
                    </span>
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

export default function InstitutionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading institutions directory...</p>
        </div>
      }
    >
      <InstitutionsContent />
    </Suspense>
  );
}
