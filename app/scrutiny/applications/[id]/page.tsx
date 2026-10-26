import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getApplicationDetail } from "@/lib/applicationDetail";
import { ApplicationDetailView } from "@/components/admin/ApplicationDetailView";

interface ScrutinyApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ScrutinyApplicationDetailPageProps) {
  const { id } = await params;
  return {
    title: `Scrutiny Review: ${id} | AICTE SAKSHAM`,
    description: `Statutory document checklist, scrutiny deficiency tracking, and flight recorder for ${id}`,
  };
}

async function ScrutinyDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "scrutiny_officer" &&
    user.role !== "council_admin" &&
    user.role !== "regional_officer"
  ) {
    return (
      <AccessDeniedView
        requiredRole="scrutiny_officer"
        actualRole={user.role}
        message="Only assigned Scrutiny Officers can inspect statutory checklist submissions."
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
      userRole={user?.role || "scrutiny_officer"}
      fullName={user?.fullName || "Scrutiny Officer"}
    >
      <ApplicationDetailView
        application={data.application}
        flightRecorder={data.flightRecorder}
        isDemo={data.isDemo}
        listHref="/scrutiny"
        listTitle="Scrutiny Worklist"
      />
    </RoleDashboardShell>
  );
}

export default function ScrutinyApplicationDetailPage({
  params,
}: ScrutinyApplicationDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Accessing scrutiny checklist and case history...</p>
        </div>
      }
    >
      <ScrutinyDetailLoader params={params} />
    </Suspense>
  );
}
