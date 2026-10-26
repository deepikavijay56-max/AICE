import React from "react";
import { SihSimulationLabView } from "@/components/admin/SihSimulationLabView";

export const metadata = {
  title: "SIH 2026 Innovation Lab & Time Machine | AICTE SAKSHAM",
  description: "Interactive simulation sandbox demonstrating statutory routes, time travel, SLA breach alerts, and escalation triggers",
};

export default function SimulationLabPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          SIH 2026 Innovation Demonstration Lab
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Demonstrating Problem Statement 26262: Integrated AICTE Approval Workflow Automation & SLA Engine
        </p>
      </div>

      <SihSimulationLabView />
    </div>
  );
}
