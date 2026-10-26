import React from "react";
import type { ActivityFeedItem } from "./demoData";
import { CheckCircleIcon, ClockIcon, AlertCircleIcon, EvcIcon } from "./Icons";

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  isDemo?: boolean;
}

export function ActivityFeed({ items, isDemo = false }: ActivityFeedProps) {
  const getEventIcon = (type: string) => {
    if (type.includes("APPROV")) {
      return <CheckCircleIcon className="w-4 h-4 text-emerald-600" />;
    }
    if (type.includes("EVC")) {
      return <EvcIcon className="w-4 h-4 text-cyan-600" />;
    }
    if (type.includes("CLARIF") || type.includes("DEFIC")) {
      return <AlertCircleIcon className="w-4 h-4 text-amber-600" />;
    }
    return <ClockIcon className="w-4 h-4 text-teal-600" />;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Recent Application Activity Feed
            </h3>
            {isDemo && (
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Sample Feed
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time event ledger sourced from application_events and verified audit triggers
          </p>
        </div>

        <a
          href="/admin/audit-logs"
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          View Full Audit Trail &rarr;
        </a>
      </div>

      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 shrink-0 mt-0.5">
                {getEventIcon(item.eventType)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 font-mono">
                      {item.applicationNumber}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 uppercase font-mono">
                      {item.eventType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.timestamp).toLocaleString("en-IN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                  <span>Actor:</span>
                  <span className="font-medium text-slate-700">{item.actorName}</span>
                  <span>•</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                    {item.actorRole}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            <p className="font-medium">No application events recorded yet.</p>
            <p className="text-[11px] mt-1 text-slate-400">Events are recorded automatically on stage transitions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
