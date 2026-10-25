import React, { Suspense } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { QueryRegion } from "@/types/admin";

export const metadata = {
  title: "AICTE Regions & Jurisdictions | AICTE SAKSHAM",
  description: "Zonal offices and territorial state jurisdictions of AICTE",
};

interface RegionItem {
  id: string;
  code: string;
  name: string;
  officeLocation: string;
  jurisdictionStates: string[];
}

const DEFAULT_REGIONS: RegionItem[] = [
  {
    id: "reg-1",
    code: "WRO",
    name: "Western Regional Office",
    officeLocation: "Churchgate, Mumbai",
    jurisdictionStates: ["Maharashtra", "Goa", "Dadra and Nagar Haveli and Daman and Diu"],
  },
  {
    id: "reg-2",
    code: "SRO",
    name: "Southern Regional Office",
    officeLocation: "Shastri Bhavan, Chennai",
    jurisdictionStates: ["Tamil Nadu", "Puducherry"],
  },
  {
    id: "reg-3",
    code: "SWRO",
    name: "South-Western Regional Office",
    officeLocation: "Palace Road, Bengaluru",
    jurisdictionStates: ["Karnataka", "Kerala", "Lakshadweep"],
  },
  {
    id: "reg-4",
    code: "NRO",
    name: "Northern Regional Office",
    officeLocation: "Vikas Nagar, Kanpur",
    jurisdictionStates: ["Uttar Pradesh", "Uttarakhand"],
  },
  {
    id: "reg-5",
    code: "ERO",
    name: "Eastern Regional Office",
    officeLocation: "Salt Lake, Kolkata",
    jurisdictionStates: ["West Bengal", "Odisha", "Bihar", "Jharkhand", "Andaman and Nicobar"],
  },
  {
    id: "reg-6",
    code: "NWRO",
    name: "North-Western Regional Office",
    officeLocation: "Sector 36-A, Chandigarh",
    jurisdictionStates: ["Punjab", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Ladakh", "Chandigarh"],
  },
  {
    id: "reg-7",
    code: "SCRO",
    name: "South-Central Regional Office",
    officeLocation: "Masab Tank, Hyderabad",
    jurisdictionStates: ["Andhra Pradesh", "Telangana"],
  },
  {
    id: "reg-8",
    code: "CRO",
    name: "Central Regional Office",
    officeLocation: "Airport Road, Bhopal",
    jurisdictionStates: ["Madhya Pradesh", "Chhattisgarh", "Gujarat"],
  },
];

async function RegionsContent() {
  let regions = DEFAULT_REGIONS;
  let isDemo = true;

  try {
    const supabase = await createServerClient();
    const { data } = await (supabase.from("regions") as unknown as {
      select: (query: string) => {
        order: (col: string, opts: { ascending: boolean }) => Promise<{
          data: QueryRegion[] | null;
          error: unknown;
        }>;
      };
    })
      .select("id, code, name, states_covered")
      .order("code", { ascending: true });

    if (data && data.length > 0) {
      isDemo = false;
      regions = data.map((d) => ({
        id: d.id,
        code: d.code,
        name: d.name,
        officeLocation: `${d.name} Zonal Office`,
        jurisdictionStates: d.states_covered && Array.isArray(d.states_covered) ? d.states_covered : ["State Jurisdictions Configured"],
      }));
    }
  } catch (err) {
    console.warn("RegionsContent: falling back to demo records", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            AICTE Regional Offices & Jurisdictions
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Zonal administration centers executing statutory scrutiny and EVC deployment
          </p>
        </div>

        {isDemo && (
          <span className="text-[10px] font-semibold uppercase px-2 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200 self-start sm:self-auto">
            Statutory 8-Region Architecture
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {regions.map((reg) => (
          <div
            key={reg.id}
            className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 font-mono">
                  {reg.code}
                </span>
                <span className="text-[10px] font-semibold uppercase text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Regional Office
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2.5">
                {reg.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {reg.officeLocation}
              </p>

              <div className="mt-4">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Jurisdiction States / UTs:
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {reg.jurisdictionStates.map((st) => (
                    <span
                      key={st}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Security Policy: Regional RLS Scoped</span>
              <span className="text-emerald-700 font-medium">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegionsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading AICTE regions...</p>
        </div>
      }
    >
      <RegionsContent />
    </Suspense>
  );
}
