import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { EvcIcon, ShieldCheckIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "EVC Inspection Guidelines | AICTE SAKSHAM",
  description: "Mandatory geotagged photographic protocol and peer-review inspection norms",
};

async function ExpertGuidelinesContent() {
  const user = await getCurrentUserContext();

  if (user && user.role !== "evc_expert" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="evc_expert"
        actualRole={user.role}
        message="Only appointed Expert Visiting Committee (EVC) members can access inspection guidelines."
      />
    );
  }

  const inspectionRules = [
    {
      title: "Geotagged Photographic Verification",
      description:
        "Every instructional laboratory, central library, barrier-free ramp, and computer centre must have minimum 3 timestamped geotagged photographs with latitude/longitude accuracy within 10 metres.",
    },
    {
      title: "Interactive Video Recording",
      description:
        "EVC panel must capture uninterrupted 360-degree video sweep of the campus boundary, administrative block, and fire safety systems. Video hash is immutably pinned to the dossier.",
    },
    {
      title: "Physical Equipment & Serial Number Cross-Check",
      description:
        "Verify physical presence of major equipment against invoice entries and asset register. Stock register stamps must match original supplier bills.",
    },
    {
      title: "Faculty Cadre & Aadhaar Biometric Verification",
      description:
        "Perform random 100% biometric / face-match audit of present teaching faculty against AICTE portal profile and original educational testimonials.",
    },
  ];

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "evc_expert"}
      fullName={user?.fullName || "Prof. Senior Expert"}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-300">
              Inspection Protocol
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Expert Committee Physical Inspection Guidelines
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Standard Operating Procedures (SOP) under Approval Process Handbook (APH) Appendix 4
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {inspectionRules.map((r, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-cyan-800 font-bold text-sm">
                <EvcIcon className="w-4 h-4 shrink-0 text-cyan-600" />
                <span>{r.title}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {r.description}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs text-cyan-900 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-cyan-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Peer-Review Confidentiality &amp; Anti-Bias Guarantee</h4>
            <p className="text-[11px] text-cyan-800/90 mt-0.5">
              Under Section 10(k) of the AICTE Act 1987, peer-review panel findings remain confidential until council sanction. Any external communication with the applicant institution outside the authorized inspection schedule is strictly prohibited.
            </p>
          </div>
        </div>
      </div>
    </RoleDashboardShell>
  );
}

export default function ExpertGuidelinesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading EVC inspection guidelines...</p>
        </div>
      }
    >
      <ExpertGuidelinesContent />
    </Suspense>
  );
}
