import type { UserRole } from "@/types/database";

export interface CurrentUserContext {
  userId: string;
  email: string | null;
  fullName: string | null;
  role: UserRole;
  institutionId: string | null;
  regionId: string | null;
  isActive: boolean;
  isAuthenticated: boolean;
}

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  council_admin: "/admin",
  regional_officer: "/regional",
  scrutiny_officer: "/scrutiny",
  evc_expert: "/expert",
  institution_admin: "/institution",
  institution_user: "/institution",
  system_auditor: "/admin/audit-logs",
};
