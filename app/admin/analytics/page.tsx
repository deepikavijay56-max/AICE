import React from "react";

export const metadata = {
  title: "Reports & Analytics | AICTE SAKSHAM",
  description: "Approval rates, regulatory cycle turnaround time, and regional performance analytics",
};

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Regulatory Analytics & Approval Metrics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregate institutional compliance trends, turnaround SLAs, and decision distributions
          </p>
        </div>

        <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
          AY 2026-27 Analytics Cycle
        </span>
      </div>

      {/* KPI summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Overall Approval Rate
          </p>
          <div className="text-2xl font-extrabold text-emerald-700 mt-2">87.2%</div>
          <p className="text-xs text-slate-500 mt-1">Based on 185 finalized decisions</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Average Turnaround Time
          </p>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">34.8 Days</div>
          <p className="text-xs text-slate-500 mt-1">Statutory target is ≤ 45 days</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            SLA Compliance Rate
          </p>
          <div className="text-2xl font-extrabold text-teal-700 mt-2">94.1%</div>
          <p className="text-xs text-slate-500 mt-1">Stages cleared within deadline</p>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            SAC Appellate Petitions
          </p>
          <div className="text-2xl font-extrabold text-indigo-700 mt-2">28 Cases</div>
          <p className="text-xs text-slate-500 mt-1">6.7% of total applications filed</p>
        </div>
      </div>

      {/* Detailed Analysis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Program Category Breakdown
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Application volume by academic technical discipline
          </p>

          <div className="space-y-3">
            {[
              { label: "Engineering & Technology", count: 215, pct: 52 },
              { label: "Management (MBA / PGDM)", count: 98, pct: 24 },
              { label: "Pharmacy (B.Pharm / M.Pharm)", count: 45, pct: 11 },
              { label: "Computer Applications (MCA)", count: 32, pct: 8 },
              { label: "Architecture & Town Planning", count: 22, pct: 5 },
            ].map((p) => (
              <div key={p.label} className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700">{p.label}</span>
                  <span className="font-bold text-slate-900">{p.count} ({p.pct}%)</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${p.pct}%` }}
                    className="h-full bg-teal-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Turnaround Performance by Region
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Average days taken from submission to council decision
          </p>

          <div className="space-y-3">
            {[
              { region: "Western Region (WRO)", days: 31, status: "Optimal" },
              { region: "Southern Region (SRO)", days: 33, status: "Optimal" },
              { region: "South-Western (SWRO)", days: 36, status: "Good" },
              { region: "Northern Region (NRO)", days: 38, status: "Good" },
              { region: "Eastern Region (ERO)", days: 42, status: "Within SLA" },
              { region: "North-Western (NWRO)", days: 35, status: "Optimal" },
            ].map((r) => (
              <div
                key={r.region}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
              >
                <span className="font-medium text-slate-800">{r.region}</span>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900 font-mono">{r.days} Days</span>
                  <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
