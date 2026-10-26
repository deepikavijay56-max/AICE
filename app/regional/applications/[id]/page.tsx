import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getApplicationDetail } from "@/lib/applicationDetail";
import { ApplicationDetailView } from "@/components/admin/ApplicationDetailView";

interface RegionalApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: RegionalApplicationDetailPageProps) {
  const { id } = await params;
  return {
    title: `Regional Dossier Review: ${id} | AICTE SAKSHAM`,
    description: `Regional jurisdiction case history, flight recorder, and scrutiny controls for application ${id}`,
  };
}

async function RegionalDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserContext();

  if (user && user.role !== "regional_officer" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="regional_officer"
        actualRole={user.role}
        message="Only authorized Regional Directorate Officers can access regional application dossiers."
      />
    );
  }

  const data = await getApplicationDetail(id);

  if (!data || !data.application) {
    notFound();
  }

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "regional_officer"}
      fullName={user?.fullName || "Regional Officer"}
    >
      <ApplicationDetailView
        application={data.application}
        flightRecorder={data.flightRecorder}
        isDemo={data.isDemo}
        listHref="/regional/applications"
        listTitle="Regional Applications"
      />
    </RoleDashboardShell>
  );
}

export default function RegionalApplicationDetailPage({
  params,
}: RegionalApplicationDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Accessing regional flight recorder and docket...</p>
        </div>
      }
    >
      <RegionalDetailLoader params={params} />
    </Suspense>
  );
}
