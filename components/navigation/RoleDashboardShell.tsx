"use client";

import React, { useState } from "react";
import { DynamicRoleSidebar } from "@/components/navigation/DynamicRoleSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import type { UserRole } from "@/types/database";

interface RoleDashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: UserRole | string;
  fullName?: string | null;
}

export function RoleDashboardShell({
  children,
  userEmail,
  userRole = "council_admin",
  fullName,
}: RoleDashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Role-tailored dynamic sidebar */}
      <DynamicRoleSidebar
        userRole={userRole}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
        <AdminHeader
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          userEmail={userEmail}
          userRole={userRole}
          fullName={fullName}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        <footer className="py-4 px-6 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-slate-700">AICTE SAKSHAM</span> &mdash; Multi-Tenant Statutory Portal
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>Role: {userRole}</span>
            <span>&bull;</span>
            <span className="text-teal-700 font-semibold">PostgreSQL RLS Active</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
