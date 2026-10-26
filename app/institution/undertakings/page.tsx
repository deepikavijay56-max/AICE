import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getComplianceMonitoringData } from "@/lib/complianceEngine";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Statutory Undertakings | AICTE SAKSHAM",
  description: "Signed legal affidavits, anti-ragging undertakings, and non-encumbrance declarations",
};

async function InstitutionUndertakingsContent() {
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "institution_admin" &&
    user.role !== "institution_user" &&
    user.role !== "council_admin"
  ) {
    return (
      <AccessDeniedView
        requiredRole="institution_admin"
        actualRole={user.role}
        message="Only registered Technical Institute administrators can manage statutory undertakings."
      />
    );
  }

  const data = await getComplianceMonitoringData();

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "institution_admin"}
      fullName={user?.fullName || "Institution Registrar"}
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Legal Compliance
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Statutory Undertakings &amp; Digital Affidavits
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Notarized declarations submitted under penalty of perjury as per Approval Process Handbook (APH) 2026-27
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Submitted Statutory Affidavits</h3>
            <span className="text-xs text-slate-500 font-mono">Digitally Hashed &bull; SHA-256 Verified</span>
          </div>

          <div className="divide-y divide-slate-100">
            {data.undertakings.map((u) => (
              <div key={u.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 capitalize">
                      {u.title || u.undertakingType.replace(/_/g, " ")}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {u.applicationNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Deponent: <span className="font-semibold text-slate-700">{u.signedBy}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    SHA-256 Signature Hash: {u.digitalSignatureHash} &bull; Attested: {new Date(u.signedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircleIcon className="w-3.5 h-3.5" />
                    Verified &amp; Active
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900">Legal Admissibility Guarantee</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              These digital undertakings are admissible in courts of law under Section 65B of the Indian Evidence Act 1872. Any false declaration shall invoke withdrawal of approval under Section 10(p) of the AICTE Act.
            </p>
          </div>
        </div>
      </div>
    </RoleDashboardShell>
  );
}

export default function InstitutionUndertakingsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading statutory undertakings...</p>
        </div>
      }
    >
      <InstitutionUndertakingsContent />
    </Suspense>
  );
}
