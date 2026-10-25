import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { QueryAuditLog } from "@/types/admin";

export const metadata = {
  title: "Statutory Audit Trail | AICTE SAKSHAM",
  description: "Immutable governance ledger capturing cryptographic triggers, decisions, and officer actions",
};

interface AuditLogEntry {
  id: string;
  tableName: string;
  operation: string;
  recordId: string;
  changedBy: string;
  timestamp: string;
  summary: string;
}

const DEMO_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud-1",
    tableName: "applications",
    operation: "UPDATE",
    recordId: "app-101",
    changedBy: "Council Admin (Approval Bureau)",
    timestamp: "2026-10-25T11:42:15Z",
    summary: "Status transitioned: 'sac_review' -> 'council_decision_pending'",
  },
  {
    id: "aud-2",
    tableName: "evc_visits",
    operation: "INSERT",
    recordId: "evc-1",
    changedBy: "Regional Officer (SWRO)",
    timestamp: "2026-10-25T09:15:30Z",
    summary: "Expert Committee roster assigned for TAPMI (PID: 1-1289456)",
  },
  {
    id: "aud-3",
    tableName: "undertakings",
    operation: "INSERT",
    recordId: "und-402",
    changedBy: "Institution Admin (K.J. Somaiya)",
    timestamp: "2026-10-24T17:20:05Z",
    summary: "Statutory land title affidavit uploaded with digital undertaking verification",
  },
  {
    id: "aud-4",
    tableName: "applications",
    operation: "UPDATE",
    recordId: "app-103",
    changedBy: "Council Admin (Executive)",
    timestamp: "2026-10-24T14:10:00Z",
    summary: "Application approved: Extension of Approval issued for AY 2026-27",
  },
  {
    id: "aud-5",
    tableName: "workflow_tasks",
    operation: "UPDATE",
    recordId: "task-99",
    changedBy: "Scrutiny Officer (NRO)",
    timestamp: "2026-10-23T16:05:40Z",
    summary: "Scrutiny checklist marked complete for HBTU Kanpur",
  },
];

async function AuditContent() {
  let logs = DEMO_AUDIT_LOGS;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("audit_logs") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => {
          limit: (n: number) => Promise<{
            data: QueryAuditLog[] | null;
            error: unknown;
          }>;
        };
      };
    })
      .select(`
        id,
        table_name,
        operation,
        record_id,
        changed_by,
        created_at,
        changed_by_profile:profiles!audit_logs_changed_by_fkey (
          full_name,
          role
        )
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      isDemo = false;
      logs = data.map((d) => {
        const prof = d.changed_by_profile;
        return {
          id: d.id,
          tableName: d.table_name,
          operation: d.operation,
          recordId: d.record_id,
          changedBy: prof?.full_name ? `${prof.full_name} (${prof.role})` : "System Service",
          timestamp: d.created_at,
          summary: `Record modified in '${d.table_name}' via trigger policy`,
        };
      });
    }
  } catch (err) {
    console.warn("AuditContent: falling back to demo records", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Statutory Audit Trail & Compliance Ledger
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident system activity log capturing every workflow modification, committee recommendation, and decision
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemo && (
            <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
              Demo Ledger
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Append-Only Trigger Active
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-sm font-bold text-slate-900">
            Recent Governance Events (audit_logs)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Database triggers automatically record user identity, operation type, and timestamp
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Target Table</th>
                <th className="py-3 px-4">Operation</th>
                <th className="py-3 px-4">Officer / Principal</th>
                <th className="py-3 px-4">Audit Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-slate-600">
                    {new Date(log.timestamp).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                    {log.tableName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                        log.operation === "INSERT"
                          ? "bg-sky-50 text-sky-800 border-sky-300"
                          : log.operation === "UPDATE"
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-rose-50 text-rose-800 border-rose-300"
                      }`}
                    >
                      {log.operation}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">
                    {log.changedBy}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {log.summary}
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

export default function AuditTrailPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading immutable audit ledger...</p>
        </div>
      }
    >
      <AuditContent />
    </Suspense>
  );
}
