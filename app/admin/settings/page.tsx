import React from "react";
import { CheckCircleIcon } from "@/components/admin/Icons";

export const metadata = {
  title: "Council Portal Settings | AICTE SAKSHAM",
  description: "Approval cycle configuration, statutory parameters, and security policies",
};

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Council Administration Settings
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Statutory parameters, security controls, and approval cycle configurations
        </p>
      </div>

      <div className="space-y-6">
        {/* Academic Year Cycle Settings */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Active Approval Cycle
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Governs statutory submission windows and APH guidelines for all institutions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Academic Year
              </label>
              <input
                type="text"
                disabled
                value="2026-2027"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portal Status
              </label>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Open for Extension & Scrutiny
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                APH Version
              </label>
              <input
                type="text"
                disabled
                value="APH-2026-V1.2 (Notified)"
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Security & RLS Compliance Card */}
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Database Security & Row-Level Authorization Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current security posture based on applied migrations and PostgreSQL policies
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                title: "PostgreSQL Row Level Security (RLS)",
                desc: "Enforced across all 15 core tables. Service-role bypass prohibited in browser.",
                status: "Enforced",
              },
              {
                title: "Role-Based Integrity Triggers",
                desc: "Prevent unauthorized status transitions and protect immutable audit trails.",
                status: "Active",
              },
              {
                title: "EVC Expert Committee Safeguards",
                desc: "Self-assignment locked; lead experts strictly bound to designated inspections.",
                status: "Enforced",
              },
              {
                title: "Statutory Undertaking Cryptographic Hashes",
                desc: "Digital affidavits bound to verified profile ID and SHA-256 document checksums.",
                status: "Active",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-50 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-800">{item.title}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">{item.desc}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded border border-teal-200">
                  <CheckCircleIcon className="w-3.5 h-3.5 text-teal-600" />
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
