import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getApplicationDetail } from "@/lib/applicationDetail";
import { ApplicationDetailView } from "@/components/admin/ApplicationDetailView";

interface ExpertApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExpertApplicationDetailPageProps) {
  const { id } = await params;
  return {
    title: `Inspection Dossier: ${id} | AICTE SAKSHAM`,
    description: `Peer-review inspection roster, geotagged infrastructure details, and case history for ${id}`,
  };
}

async function ExpertDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserContext();

  if (user && user.role !== "evc_expert" && user.role !== "council_admin") {
    return (
      <AccessDeniedView
        requiredRole="evc_expert"
        actualRole={user.role}
        message="Only appointed Expert Visiting Committee (EVC) members can inspect peer-review dossiers."
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
      userRole={user?.role || "evc_expert"}
      fullName={user?.fullName || "Prof. Senior Expert"}
    >
      <ApplicationDetailView
        application={data.application}
        flightRecorder={data.flightRecorder}
        isDemo={data.isDemo}
        listHref="/expert"
        listTitle="My Assigned Visits"
      />
    </RoleDashboardShell>
  );
}

export default function ExpertApplicationDetailPage({
  params,
}: ExpertApplicationDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Accessing inspection dossier and flight recorder...</p>
        </div>
      }
    >
      <ExpertDetailLoader params={params} />
    </Suspense>
  );
}
