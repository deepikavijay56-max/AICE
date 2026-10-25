import React, { Suspense } from "react";
import { fetchAdminDashboardStats } from "@/components/admin/data";
import { KpiCard, KpiCardSkeleton } from "@/components/admin/KpiCard";
import { DistributionCharts } from "@/components/admin/DistributionCharts";
import { ExplainableAlertsSection } from "@/components/admin/ExplainableAlertsSection";
import { ActivityFeed } from "@/components/admin/ActivityFeed";
import { ApplicationsTable } from "@/components/admin/ApplicationsTable";
import {
  ApplicationsIcon,
  ClockIcon,
  EvcIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExternalLinkIcon,
} from "@/components/admin/Icons";

async function DashboardOverviewContent() {
  const stats = await fetchAdminDashboardStats();

  return (
    <div className="space-y-8">
      {/* Banner / Operational Status Alert */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <h2 className="text-sm font-bold text-teal-300 uppercase tracking-wider">
              Statutory Approval Cycle 2026-2027
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Statutory decision window is active. Scrutiny, Expert Visiting Committees (EVC), and Standing Appellate Committee (SAC) reviews are being tracked against official SLA policies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/admin/workflows"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
          >
            <span>View SLA Policies</span>
            <ExternalLinkIcon className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* KPI Cards: Exactly the 6 specified metrics with transparent definitions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Key Performance Indicators
          </h2>
          <span className="text-xs text-slate-500">
            Real-time RLS-scoped aggregates
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Total Applications */}
          <KpiCard
            title="Total Applications"
            value={stats.totalApplications}
            subtitle="All statutory applications registered across regions"
            icon={ApplicationsIcon}
            tone="default"
            isDemo={stats.isDemo}
          />

          {/* 2. Pending Review */}
          <KpiCard
            title="Pending Review"
            value={stats.pendingReview}
            subtitle="Active across Scrutiny, Clarification & SAC"
            icon={ClockIcon}
            tone="amber"
            isDemo={stats.isDemo}
          />

          {/* 3. EVC Visits Scheduled */}
          <KpiCard
            title="EVC Visits Scheduled"
            value={stats.evcVisitsScheduled}
            subtitle="Expert Visiting Committees assigned & awaiting inspection"
            icon={EvcIcon}
            tone="cyan"
            isDemo={stats.isDemo}
          />

          {/* 4. Decisions Pending */}
          <KpiCard
            title="Decisions Pending"
            value={stats.decisionsPending}
            subtitle="Standing committee cleared; awaiting Council decision order"
            icon={AlertCircleIcon}
            tone="purple"
            isDemo={stats.isDemo}
          />

          {/* 5. Approved Applications */}
          <KpiCard
            title="Approved Applications"
            value={stats.approvedApplications}
            subtitle="Approval Letters (LoA / EoA) generated"
            icon={CheckCircleIcon}
            tone="emerald"
            isDemo={stats.isDemo}
          />

          {/* 6. Rejected Applications */}
          <KpiCard
            title="Rejected Applications"
            value={stats.rejectedApplications}
            subtitle="Deficiencies confirmed after SAC appellate hearing"
            icon={XCircleIcon}
            tone="rose"
            isDemo={stats.isDemo}
          />
        </div>
      </div>

      {/* Interactive Visual Distribution Charts */}
      <div>
        <DistributionCharts
          statusData={stats.statusDistribution}
          regionData={stats.regionDistribution}
          isDemo={stats.isDemo}
        />
      </div>

      {/* Explainable Statutory Alerts & SLA Deadlines */}
      <div>
        <ExplainableAlertsSection />
      </div>

      {/* Real-time Activity Feed */}
      <div>
        <ActivityFeed items={stats.recentActivity} isDemo={stats.isDemo} />
      </div>

      {/* Filterable, Searchable Applications Table */}
      <div>
        <ApplicationsTable
          initialApplications={stats.recentApplications}
          isDemo={stats.isDemo}
        />
      </div>
    </div>
  );
}

export default function OverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8">
          <div className="h-20 bg-slate-200 rounded-xl animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <KpiCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <DashboardOverviewContent />
    </Suspense>
  );
}
