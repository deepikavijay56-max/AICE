import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Scrutiny Guidelines & Norms | AICTE SAKSHAM",
  description: "Approval Process Handbook 2026-27 statutory document scrutiny rules and checklists",
};

async function ScrutinyGuidelinesContent() {
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "scrutiny_officer" &&
    user.role !== "council_admin" &&
    user.role !== "regional_officer"
  ) {
    return (
      <AccessDeniedView
        requiredRole="scrutiny_officer"
        actualRole={user.role}
        message="Only assigned Scrutiny Officers can inspect statutory checklist guidelines."
      />
    );
  }

  const guidelines = [
    {
      category: "Land & Building Norms (APH Chapter 1)",
      rules: [
        "Mega/Metro City: Minimum 1.5 - 2.5 Acres contiguous or non-contiguous within 2 km radius.",
        "Urban / Rural: Minimum 4.0 - 7.5 Acres with clear title in name of sponsoring trust/society.",
        "Occupancy Certificate / Form 32 from Municipal or Competent Authority is mandatory.",
      ],
    },
    {
      category: "Instructional & Administrative Area (APH Appendix 4)",
      rules: [
        "Classrooms: Minimum 66 sq.m for 60 intake, with acoustic dampening and digital smartboards.",
        "Laboratories: Minimum 66 - 132 sq.m per division equipped with safety goggles and showers.",
        "Central Library: Minimum 400 sq.m with digital subscription to IEEE/Springer/ACM repositories.",
      ],
    },
    {
      category: "Faculty & Cadre Ratio (APH Appendix 7)",
      rules: [
        "Undergraduate Engg/Tech Cadre Ratio: 1 Professor : 2 Associate Professors : 6 Assistant Professors.",
        "Overall Student-to-Faculty Ratio: 1:15 or 1:20 (as applicable by accreditation category).",
        "Mandatory 7th CPC salary disbursal via RTGS/NEFT backed by Form 16 PF contribution logs.",
      ],
    },
  ];

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "scrutiny_officer"}
      fullName={user?.fullName || "Scrutiny Officer"}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              Statutory Norms
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Scrutiny Checklist &amp; Norms Handbook
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Approval Process Handbook (APH) 2026-27 statutory document evaluation benchmarks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {guidelines.map((g, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3">
              <div className="flex items-center gap-2 text-teal-700">
                <ShieldCheckIcon className="w-4 h-4 shrink-0" />
                <h3 className="text-sm font-bold text-slate-900 leading-snug">{g.category}</h3>
              </div>
              <ul className="space-y-2 text-xs text-slate-600">
                {g.rules.map((r, rIdx) => (
                  <li key={rIdx} className="flex items-start gap-2">
                    <CheckCircleIcon className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </RoleDashboardShell>
  );
}

export default function ScrutinyGuidelinesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading APH guidelines...</p>
        </div>
      }
    >
      <ScrutinyGuidelinesContent />
    </Suspense>
  );
}
