"use client";

import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { TimeMachineProvider } from "@/components/admin/TimeMachineContext";

interface AdminShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: string | null;
  fullName?: string | null;
}

export function AdminShell({
  children,
  userEmail,
  userRole,
  fullName,
}: AdminShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <TimeMachineProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex">
        {/* Responsive Collapsible Sidebar */}
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-200">
          {/* Top Header */}
          <AdminHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            userEmail={userEmail}
            userRole={userRole}
            fullName={fullName}
          />

          {/* Dynamic Route Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>

          {/* Official Statutory Footer */}
          <footer className="py-4 px-6 border-t border-slate-200 bg-white text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-slate-700">AICTE SAKSHAM</span> — All India Council for Technical Education (Approval Bureau)
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Security Standard: ISO 27001 / CERT-In</span>
              <span>•</span>
              <span className="text-teal-700 font-medium">Session Active (Council Admin)</span>
            </div>
          </footer>
        </div>
      </div>
    </TimeMachineProvider>
  );
}
