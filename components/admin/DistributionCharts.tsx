import React from "react";

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
  colorClass: string;
}

export interface RegionDistributionItem {
  regionCode: string;
  regionName: string;
  applicationCount: number;
  institutionCount: number;
  percentage: number;
}

interface DistributionChartsProps {
  statusData: StatusDistributionItem[];
  regionData: RegionDistributionItem[];
  isDemo?: boolean;
}

export function DistributionCharts({
  statusData,
  regionData,
  isDemo = false,
}: DistributionChartsProps) {
  const totalAppsByStatus = statusData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Applications by Status */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Applications by Workflow Status
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Distribution across statutory scrutiny, inspection & decision gates
              </p>
            </div>
            {isDemo && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Demo Sample
              </span>
            )}
          </div>

          {/* Stacked Progress Bar */}
          <div className="mt-5">
            <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              {statusData.map((item) => (
                <div
                  key={item.status}
                  style={{ width: `${item.percentage}%` }}
                  className={`h-full ${item.colorClass} transition-all duration-500 hover:opacity-90 relative group`}
                  title={`${item.label}: ${item.count} (${item.percentage}%)`}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>0%</span>
              <span className="font-medium text-slate-600">
                Total Tracked: {totalAppsByStatus.toLocaleString()} Applications
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="mt-5 space-y-2.5">
            {statusData.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-3 h-3 rounded-sm ${item.colorClass} shrink-0`} />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-900">{item.count.toLocaleString()}</span>
                  <span className="text-[11px] text-slate-400 w-10 text-right">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Official AICTE Status Taxonomy</span>
          <a href="/admin/workflows" className="text-teal-600 hover:underline font-medium">
            Workflow Details &rarr;
          </a>
        </div>
      </div>

      {/* Chart 2: Applications by Region */}
      <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Applications by AICTE Region
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Territorial breakdown of regulatory applications across zonal offices
              </p>
            </div>
            {isDemo && (
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                Demo Sample
              </span>
            )}
          </div>

          {/* Regional Horizontal Bars */}
          <div className="mt-5 space-y-3">
            {regionData.map((reg) => (
              <div key={reg.regionCode} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-[11px] px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                      {reg.regionCode}
                    </span>
                    <span className="font-medium text-slate-700 truncate max-w-[180px] sm:max-w-[220px]">
                      {reg.regionName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {reg.applicationCount} apps
                    </span>
                    <span className="text-[11px] text-slate-400 w-8 text-right">
                      {reg.percentage}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${reg.percentage}%` }}
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Active Regional Jurisdictions: {regionData.length}</span>
          <a href="/admin/regions" className="text-teal-600 hover:underline font-medium">
            Manage Regions &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}
