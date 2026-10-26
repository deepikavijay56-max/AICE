import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { getApplicationDetail } from "@/lib/applicationDetail";
import { ApplicationDetailView } from "@/components/admin/ApplicationDetailView";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  return {
    title: `Case Review: ${id} | AICTE SAKSHAM`,
    description: `Flight recorder, compliance history, and statutory workflow controls for application ${id}`,
  };
}

async function ApplicationDetailLoader({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getApplicationDetail(id);

  if (!data || !data.application) {
    notFound();
  }

  return (
    <ApplicationDetailView
      application={data.application}
      flightRecorder={data.flightRecorder}
      isDemo={data.isDemo}
    />
  );
}

export default function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Accessing case flight recorder and statutory records...</p>
        </div>
      }
    >
      <ApplicationDetailLoader params={params} />
    </Suspense>
  );
}
