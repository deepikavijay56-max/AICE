import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { ShieldCheckIcon, CheckCircleIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Document Vault | AICTE SAKSHAM",
  description: "Secure multi-tenant repository of statutory approvals, building drawings, and NOCs",
};

async function InstitutionDocumentsContent() {
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
        message="Only registered Technical Institute administrators can access the institutional document repository."
      />
    );
  }

  const documents = [
    {
      id: "doc-1",
      title: "Approved Master Building Plan & Architectural Blueprints",
      category: "Infrastructure",
      fileName: "Campus_MasterPlan_Sanctioned_2026.pdf",
      fileSize: "14.2 MB",
      uploadDate: "2026-09-10",
      verificationStatus: "Verified by Scrutiny",
    },
    {
      id: "doc-2",
      title: "State Fire Safety NOC / Compliance Certificate",
      category: "Statutory Clearances",
      fileName: "Fire_Safety_NOC_Valid_2027.pdf",
      fileSize: "3.8 MB",
      uploadDate: "2026-09-11",
      verificationStatus: "Verified by Scrutiny",
    },
    {
      id: "doc-3",
      title: "Land Title Deed & Contiguity Affidavit",
      category: "Land Ownership",
      fileName: "Registered_SaleDeed_7_Acres.pdf",
      fileSize: "22.5 MB",
      uploadDate: "2026-09-10",
      verificationStatus: "Verified by Scrutiny",
    },
    {
      id: "doc-4",
      title: "Faculty Cadre & 7th CPC RTGS Salary Disbursement Sheet",
      category: "Academic Staff",
      fileName: "Faculty_RTGS_BankStatement_August2026.pdf",
      fileSize: "5.1 MB",
      uploadDate: "2026-10-04",
      verificationStatus: "Under Verification",
    },
  ];

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
              Institutional Vault
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Statutory Document Repository
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Encrypted cloud storage with hash integrity verification under ISO 27001
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Mandatory Statutory Attachments</h3>
            <span className="text-xs text-slate-500 font-mono">4 Documents Stored</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 text-slate-600 font-semibold uppercase text-[10px] border-b border-slate-200">
                  <th className="py-3 px-4">Document Title</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">File Name &amp; Size</th>
                  <th className="py-3 px-4">Upload Date</th>
                  <th className="py-3 px-4 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {d.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {d.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {d.fileName} <span className="text-slate-400">({d.fileSize})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {d.uploadDate}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px]">
                        <CheckCircleIcon className="w-3 h-3" />
                        {d.verificationStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-3">
          <ShieldCheckIcon className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-slate-900">Immutable Object Storage</h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              All documents are stored with write-once-read-many (WORM) controls. Once verified by the scrutiny committee, documents cannot be altered without an explicit regulatory clarification request.
            </p>
          </div>
        </div>
      </div>
    </RoleDashboardShell>
  );
}

export default function InstitutionDocumentsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading document vault...</p>
        </div>
      }
    >
      <InstitutionDocumentsContent />
    </Suspense>
  );
}
