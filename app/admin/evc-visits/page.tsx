import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import { EvcIcon, ClockIcon, CheckCircleIcon } from "@/components/admin/Icons";
import type { QueryEvcVisit } from "@/types/admin";

export const metadata = {
  title: "EVC Visits Oversight | AICTE SAKSHAM",
  description: "Monitor Expert Visiting Committees (EVC) schedules, geotagged evidence, and reports",
};

interface EvcVisitRecord {
  id: string;
  visitDate: string;
  institutionName: string;
  permanentInstituteId: string;
  regionName: string;
  leadExpertName: string;
  status: "scheduled" | "in_progress" | "report_submitted" | "verified" | "cancelled";
  geotaggedPhotosCount: number;
  reportRecommendation: string;
}

const DEMO_EVC_VISITS: EvcVisitRecord[] = [
  {
    id: "evc-1",
    visitDate: "2026-11-04",
    institutionName: "T.A. Pai Management Institute",
    permanentInstituteId: "1-1289456",
    regionName: "South-Western Region",
    leadExpertName: "Prof. S. Ranganathan (IIMB)",
    status: "scheduled",
    geotaggedPhotosCount: 0,
    reportRecommendation: "Pending Site Visit",
  },
  {
    id: "evc-2",
    visitDate: "2026-10-22",
    institutionName: "K.J. Somaiya College of Engineering",
    permanentInstituteId: "1-4251781",
    regionName: "Western Region",
    leadExpertName: "Dr. A. Verma (IIT Bombay)",
    status: "report_submitted",
    geotaggedPhotosCount: 18,
    reportRecommendation: "Recommended for 120 Intake Extension",
  },
  {
    id: "evc-3",
    visitDate: "2026-10-18",
    institutionName: "PSG College of Pharmacy",
    permanentInstituteId: "1-7893214",
    regionName: "Southern Region",
    leadExpertName: "Prof. M. Kalyani (Madras Medical College)",
    status: "verified",
    geotaggedPhotosCount: 24,
    reportRecommendation: "Compliant with Pharmacy Council Norms",
  },
  {
    id: "evc-4",
    visitDate: "2026-10-24",
    institutionName: "Jadavpur University Architecture Dept",
    permanentInstituteId: "1-9988771",
    regionName: "Eastern Region",
    leadExpertName: "Ar. D. Banerjee (IIEST Shibpur)",
    status: "in_progress",
    geotaggedPhotosCount: 8,
    reportRecommendation: "Under Physical Evaluation",
  },
];

async function EvcContent() {
  let visits = DEMO_EVC_VISITS;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("evc_visits") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryEvcVisit[] | null;
          error: unknown;
        }>;
      };
    })
      .select(`
        id,
        scheduled_start,
        status,
        findings_summary,
        application:applications (
          institution:institutions (
            name,
            aicte_id
          ),
          region:regions (
            name
          )
        ),
        lead_expert:profiles!evc_visits_lead_expert_id_fkey (
          full_name
        )
      `)
      .order("scheduled_start", { ascending: false });

    if (data && data.length > 0) {
      isDemo = false;
      visits = data.map((d) => {
        const app = d.application;
        const expert = d.lead_expert;

        return {
          id: d.id,
          visitDate: d.scheduled_start || "2026-11-01",
          institutionName: app?.institution?.name || "Technical Institute",
          permanentInstituteId: app?.institution?.aicte_id || "N/A",
          regionName: app?.region?.name || "Central",
          leadExpertName: expert?.full_name || "Nominated Senior Professor",
          status: (d.status as EvcVisitRecord["status"]) || "scheduled",
          geotaggedPhotosCount: 12,
          reportRecommendation: d.findings_summary || "Inspection proceeding per APH checklist",
        };
      });
    }
  } catch (err) {
    console.warn("EvcContent: falling back to demo records", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Expert Visiting Committee (EVC) Oversight
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tracking peer review committees, physical site inspections, and geotagged infrastructure evidence
          </p>
        </div>

        {isDemo && (
          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
            Sample EVC Roster
          </span>
        )}
      </div>

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-50 text-cyan-700">
            <EvcIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">{visits.length}</div>
            <div className="text-xs text-slate-500 font-medium">Scheduled / Active Visits</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircleIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {visits.filter((v) => v.status === "verified" || v.status === "report_submitted").length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Reports Submitted / Verified</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700">
            <ClockIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900">
              {visits.filter((v) => v.status === "scheduled" || v.status === "in_progress").length}
            </div>
            <div className="text-xs text-slate-500 font-medium">Awaiting Inspection</div>
          </div>
        </div>
      </div>

      {/* EVC Visits Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            EVC Committee Inspection Register
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Geotagged photographic verification mandated under AICTE Quality Mandate
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Inspection Date</th>
                <th className="py-3 px-4">Institution</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Lead Expert</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visits.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900 font-mono">
                    {new Date(v.visitDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-800">{v.institutionName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      PID: {v.permanentInstituteId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {v.regionName}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {v.leadExpertName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        v.status === "verified"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                          : v.status === "report_submitted"
                          ? "bg-teal-50 text-teal-800 border-teal-300"
                          : v.status === "in_progress"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-cyan-50 text-cyan-800 border-cyan-300"
                      }`}
                    >
                      {v.status.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                    {v.reportRecommendation}
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

export default function EvcVisitsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading EVC visits register...</p>
        </div>
      }
    >
      <EvcContent />
    </Suspense>
  );
}
