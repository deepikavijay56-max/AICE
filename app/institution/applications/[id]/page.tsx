import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { getApplicationDetail } from "@/lib/applicationDetail";
import { ApplicationDetailView } from "@/components/admin/ApplicationDetailView";

interface InstitutionApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InstitutionApplicationDetailPageProps) {
  const { id } = await params;
  return {
    title: `Statutory Dossier: ${id} | AICTE SAKSHAM`,
    description: `Track application flight recorder, deficiency clarifications, and statutory milestones for ${id}`,
  };
}

async function InstitutionDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUserContext();

  if (
    user &&
    user.role !== "institution_admin" &&
    user.role !== "institution_user" &&
    user.role !== "council_admin"
  ) {
    return (
      <AccessDeniedView
        requiredRole="institution_admin"
        actualRole={user.role}
        message="Only registered Technical Institute administrators can access their institution's application docket."
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
      userRole={user?.role || "institution_admin"}
      fullName={user?.fullName || "Institution Registrar"}
    >
      <ApplicationDetailView
        application={data.application}
        flightRecorder={data.flightRecorder}
        isDemo={data.isDemo}
        listHref="/institution"
        listTitle="Institution Dossier"
      />
    </RoleDashboardShell>
  );
}

export default function InstitutionApplicationDetailPage({
  params,
}: InstitutionApplicationDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Loading statutory case flight recorder...</p>
        </div>
      }
    >
      <InstitutionDetailLoader params={params} />
    </Suspense>
  );
}
