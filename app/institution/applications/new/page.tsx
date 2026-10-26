import React, { Suspense } from "react";
import { getCurrentUserContext } from "@/lib/authContext";
import { AccessDeniedView } from "@/components/auth/AccessDeniedView";
import { RoleDashboardShell } from "@/components/navigation/RoleDashboardShell";
import { createServerClient } from "@/lib/supabase/server";
import { NewApplicationWizard } from "./NewApplicationWizard";

export const metadata = {
  title: "Submit New Statutory Application | AICTE SAKSHAM",
  description: "Initiate new Extension of Approval (EoA) or Program addition application with secure document uploads",
};

export default function NewApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-medium">Verifying institution accreditation and authorization...</p>
        </div>
      }
    >
      <NewApplicationLoader />
    </Suspense>
  );
}

async function NewApplicationLoader() {
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
        message="Only registered Technical Institute administrators can submit new statutory applications."
      />
    );
  }

  const supabase = await createServerClient();

  // Fetch full profile and institution details for prefilling
  let institutionData: {
    id: string;
    name: string;
    aicte_id: string | null;
    state: string;
    city: string;
  } | null = null;

  try {
    const { data: profile } = await (supabase.from("profiles") as unknown as {
      select: (cols: string) => {
        eq: (col: string, val: string) => {
          single: () => Promise<{
            data: {
              id: string;
              role: string;
              institution_id: string | null;
              institution?: {
                id: string;
                name: string;
                aicte_id: string | null;
                state: string;
                city: string;
              } | null;
            } | null;
          }>;
        };
      };
    })
      .select("id, role, institution_id, institution:institutions(id, name, aicte_id, state, city)")
      .eq("id", user?.userId || "")
      .single();

    if (profile?.institution) {
      institutionData = profile.institution;
    } else {
      // Fallback: fetch primary demo institution
      const { data: fallbackInst } = await (supabase.from("institutions") as unknown as {
        select: (cols: string) => {
          limit: (n: number) => {
            single: () => Promise<{
              data: { id: string; name: string; aicte_id: string | null; state: string; city: string } | null;
            }>;
          };
        };
      })
        .select("id, name, aicte_id, state, city")
        .limit(1)
        .single();

      if (fallbackInst) {
        institutionData = fallbackInst;
      }
    }
  } catch {
    // Non-blocking
  }

  const profileData = {
    id: user?.userId || "demo-user-id",
    fullName: user?.fullName || "Institution Registrar",
    email: user?.email || "principal@coep.ac.in",
    role: user?.role || "institution_admin",
    institution: institutionData || {
      id: "inst-coep-1",
      name: "COEP Technological University",
      aicte_id: "1-10992341",
      state: "Maharashtra",
      city: "Pune",
    },
  };

  return (
    <RoleDashboardShell
      userEmail={user?.email}
      userRole={user?.role || "institution_admin"}
      fullName={user?.fullName || "Institution Registrar"}
    >
      <NewApplicationWizard profile={profileData} />
    </RoleDashboardShell>
  );
}
